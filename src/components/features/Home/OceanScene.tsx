/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

const treeUrl   = new URL("../../../assets/models/tree.gltf",   import.meta.url).href;
const shipUrl   = new URL("../../../assets/models/ship.gltf",   import.meta.url).href;
const wizardUrl = new URL("../../../assets/models/wizard.gltf", import.meta.url).href;

interface OceanSceneProps {
    theme: "dark" | "light";
    revealed?: boolean;
    /** Fires once the models have settled (loaded or failed) and the first frame is drawn. */
    onReady?: () => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smoothstep = (t: number) => {
    const c = clamp(t, 0, 1);
    return c * c * (3 - 2 * c);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// ── World layout ─────────────────────────────────────────────────────────
// Scroll 0→1 maps to a dive: the hero frames the island from just above the
// surface, the camera goes under during the first stretch of the page, then
// sinks steadily past the creatures until the sand fills the last screen.
const SEABED_Y = -60;
const CAM_Z = 9;
const CAM_TOP_Y = 2.4;
const DIVE_END_T = 0.12;   // scroll fraction at which the camera is fully under
const DIVE_END_Y = -4;
const CAM_BOTTOM_Y = SEABED_Y + 4.5;
const ENTRY_LIFT = 1.6;    // camera starts this much higher and settles on reveal
const ENTRY_DURATION = 1.4;

const cameraYAt = (t: number) =>
    t < DIVE_END_T
        ? lerp(CAM_TOP_Y, DIVE_END_Y, smoothstep(t / DIVE_END_T))
        : lerp(DIVE_END_Y, CAM_BOTTOM_Y, (t - DIVE_END_T) / (1 - DIVE_END_T));

// Above water the look target dips slightly; near the bottom it tilts down onto the sand
const lookDropAt = (t: number) => lerp(-0.7, -0.2, smoothstep(t / DIVE_END_T)) - smoothstep((t - 0.85) / 0.15) * 3.2;

type Palette = {
    sky: number; shallow: number; deep: number;
    surface: number; skyLight: number; groundLight: number;
};
const PALETTES: Record<"dark" | "light", Palette> = {
    dark:  { sky: 0x0b1a33, shallow: 0x0d5a7a, deep: 0x020d18, surface: 0x0d4f7a, skyLight: 0x9fc8ff, groundLight: 0x0b2233 },
    light: { sky: 0x9fd8f0, shallow: 0x1f97bd, deep: 0x0a3f5c, surface: 0x1e90ff, skyLight: 0xdff4ff, groundLight: 0x1a4a5e },
};

// ── Fish schools — more of them, and bigger, the deeper you go ───────────
type School = { y: number; count: number; color: number; x: number; z: number; rx: number; rz: number; speed: number; size: number };
const SCHOOLS: School[] = [
    { y:  -7, count: 36, color: 0xffd04a, x: -5, z:  -6, rx: 6,  rz: 3, speed: 0.32, size: 0.55 },
    { y: -13, count: 50, color: 0x9fd8ff, x:  4, z:  -9, rx: 7,  rz: 4, speed: 0.26, size: 0.5  },
    { y: -20, count: 64, color: 0xff8a5c, x: -3, z:  -7, rx: 8,  rz: 3, speed: 0.3,  size: 0.5  },
    { y: -27, count: 80, color: 0xd6ecf5, x:  2, z: -12, rx: 10, rz: 5, speed: 0.22, size: 0.45 },
    { y: -38, count: 70, color: 0x7fe3c9, x: -4, z:  -8, rx: 9,  rz: 4, speed: 0.27, size: 0.45 },
    { y: -49, count: 54, color: 0xb9a6ff, x:  3, z:  -9, rx: 7,  rz: 3, speed: 0.24, size: 0.5  },
];
const SHARKS = [
    { y: -24, rx: 11, rz: 6, z: -12, speed: 0.11, scale: 1.2, phase: 0 },
    { y: -34, rx: 9,  rz: 5, z: -8,  speed: -0.13, scale: 1.5, phase: 2 },
    { y: -45, rx: 12, rz: 6, z: -14, speed: 0.09, scale: 1.8, phase: 4 },
];
const JELLY_COUNT = 7;

// Low-poly fish, nose along +Z so Object3D.lookAt points it where it swims
function makeFishGeometry(THREE: any) {
    const v = {
        nose: [0, 0, 0.5], top: [0, 0.17, 0.05], bot: [0, -0.13, 0.05],
        left: [-0.08, 0, 0.05], right: [0.08, 0, 0.05], tail: [0, 0, -0.28],
        finTop: [0, 0.16, -0.48], finBot: [0, -0.16, -0.48],
    } as const;
    const tris: (keyof typeof v)[][] = [
        ["nose", "top", "right"], ["nose", "right", "bot"], ["nose", "bot", "left"], ["nose", "left", "top"],
        ["tail", "right", "top"], ["tail", "bot", "right"], ["tail", "left", "bot"], ["tail", "top", "left"],
        ["tail", "finTop", "finBot"],
    ];
    const pos = new Float32Array(tris.length * 9);
    tris.forEach((tri, i) => tri.forEach((k, j) => pos.set(v[k], i * 9 + j * 3)));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
}

// A flat fin from a 2D outline; `plane` picks which world plane it lies in
function makeFin(THREE: any, pts: [number, number][], plane: "side" | "flat") {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ShapeGeometry(shape);
    if (plane === "side") geo.rotateY(-Math.PI / 2); // outline x → world z (along the body)
    else geo.rotateX(-Math.PI / 2);                  // outline y → world -z, lies horizontal
    return geo;
}

function makeShark(THREE: any, mat: any) {
    const group = new THREE.Group();
    const profile = [
        [0, -1.6], [0.14, -1.35], [0.34, -0.7], [0.44, -0.05], [0.4, 0.55], [0.26, 1.05], [0.1, 1.4], [0, 1.52],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const bodyGeo = new THREE.LatheGeometry(profile, 14);
    bodyGeo.rotateX(Math.PI / 2); // lathe axis +y → nose along +z
    const body = new THREE.Mesh(bodyGeo, mat);
    body.scale.set(0.8, 1, 1);
    group.add(body);

    const dorsal = new THREE.Mesh(makeFin(THREE, [[0.35, 0], [-0.35, 0], [-0.25, 0.7]], "side"), mat);
    dorsal.position.set(0, 0.32, 0.05);
    group.add(dorsal);

    for (const side of [1, -1]) {
        const pec = new THREE.Mesh(makeFin(THREE, [[0, -0.25], [0, 0.15], [0.85, 0.6]], "flat"), mat);
        pec.position.set(0.22 * side, -0.18, 0.55);
        pec.scale.x = side;
        pec.rotation.z = -0.3 * side;
        group.add(pec);
    }

    const tailPivot = new THREE.Group();
    tailPivot.position.z = -1.45;
    const tail = new THREE.Mesh(makeFin(THREE, [[0.1, 0], [-0.55, 0.8], [-0.3, 0.05], [-0.45, -0.5]], "side"), mat);
    tailPivot.add(tail);
    group.add(tailPivot);

    return { group, tailPivot };
}

function makeJelly(THREE: any, color: number) {
    const group = new THREE.Group();
    const bellMat = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.9,
        transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false,
    });
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), bellMat);
    group.add(bell);
    const pts: number[] = [];
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const x = Math.cos(a) * 0.3, z = Math.sin(a) * 0.3;
        pts.push(x, 0, z, x * 0.6, -1.4 - (i % 3) * 0.3, z * 0.6);
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 }));
    group.add(lines);
    return group;
}

// Vertical soft streak used for the sun shafts just under the surface
function makeRayTexture(THREE: any) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const v = ctx.createLinearGradient(0, 0, 0, 256);
    v.addColorStop(0, "rgba(255,255,255,1)");
    v.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 64, 256);
    // Fade the sides so each shaft has no hard edges
    ctx.globalCompositeOperation = "destination-in";
    const h = ctx.createLinearGradient(0, 0, 64, 0);
    h.addColorStop(0, "rgba(0,0,0,0)");
    h.addColorStop(0.5, "rgba(0,0,0,1)");
    h.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = h;
    ctx.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const OceanScene = ({ theme, revealed = true, onReady }: OceanSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const themeRef = useRef(theme);
    const revealTimeRef = useRef<number | null>(null);
    const onReadyRef = useRef(onReady);

    useEffect(() => { themeRef.current = theme; }, [theme]);
    useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
    useEffect(() => {
        if (revealed && revealTimeRef.current === null) revealTimeRef.current = performance.now();
    }, [revealed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let cancelled = false;
        let rafId = 0;
        let cleanup: (() => void) | undefined;

        const isMobile = window.innerWidth < 768;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const scroll = { target: 0, current: 0 };
        const mouse = { tx: 0, ty: 0, cx: 0, cy: 0 };

        const onScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            scroll.target = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
        };
        const onMouseMove = (e: MouseEvent) => {
            if (reducedMotion || isMobile) return;
            mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        onScroll();
        scroll.current = scroll.target;
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("mousemove", onMouseMove);

        (async () => {
            const [THREE, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
                import("three"),
                import("three/examples/jsm/loaders/GLTFLoader.js"),
                import("three/examples/jsm/loaders/DRACOLoader.js"),
            ]);
            if (cancelled) return;

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.05;

            const scene = new THREE.Scene();
            const waterColor = new THREE.Color();
            scene.background = waterColor;
            scene.fog = new THREE.FogExp2(waterColor, 0.02);

            const camera = new THREE.PerspectiveCamera(isMobile ? 62 : 50, window.innerWidth / window.innerHeight, 0.1, 160);

            // ── Lights ───────────────────────────────────────────────────
            const hemi = new THREE.HemisphereLight(0xdff4ff, 0x1a4a5e, 1.6);
            scene.add(hemi);
            const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
            sun.position.set(6, 12, 6);
            scene.add(sun);
            // Warm pool of light on the sand so the last screen isn't lost in the dark
            const seabedLight = new THREE.PointLight(0xffd99a, 40, 40, 1.4);
            seabedLight.position.set(0, SEABED_Y + 6, 0);
            scene.add(seabedLight);

            // ── Surface ──────────────────────────────────────────────────
            const SURF_SEG = isMobile ? 48 : 90;
            const surfaceGeo = new THREE.PlaneGeometry(140, 90, SURF_SEG, SURF_SEG);
            surfaceGeo.rotateX(-Math.PI / 2);
            surfaceGeo.translate(0, 0, -25);
            const surfaceRest = new Float32Array(surfaceGeo.attributes.position.array);
            const surfaceMat = new THREE.MeshPhongMaterial({
                color: 0x1e90ff, shininess: 80, specular: 0x335566,
                transparent: true, opacity: 0.92, side: THREE.DoubleSide,
            });
            scene.add(new THREE.Mesh(surfaceGeo, surfaceMat));

            // ── Island: sand cap above water, rocky base below it ───────
            const island = new THREE.Group();
            island.position.set(isMobile ? 1.6 : 5.2, -0.3, isMobile ? -11 : -9);
            scene.add(island);
            const sandMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 1 });
            island.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 3.5, 0.5, 32), sandMat));
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x3e3a32, roughness: 1, flatShading: true });
            const islandBase = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 4.6, 8, 14, 3), rockMat);
            islandBase.position.y = -4.2;
            island.add(islandBase);

            // Sails further out than the island, so it never sits on top of it
            const SHIP_X = isMobile ? -1.2 : -1.4;
            const shipPivot = new THREE.Group();
            shipPivot.position.set(SHIP_X, 0.1, isMobile ? -15 : -13);
            scene.add(shipPivot);

            // ── Models — none of them block the scene; each failure just leaves a gap ──
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
            const loader = new GLTFLoader();
            loader.setDRACOLoader(dracoLoader);

            let mixer: any = null;
            const loads = [
                loader.loadAsync(treeUrl).then((gltf: any) => {
                    const tree = gltf.scene;
                    tree.scale.setScalar(0.5);
                    tree.position.set(0.6, 0.25, -0.6);
                    island.add(tree);
                }),
                loader.loadAsync(wizardUrl).then((gltf: any) => {
                    const wizard = gltf.scene;
                    wizard.position.set(-1.6, 0.25, 1.2);
                    wizard.rotation.y = -Math.PI / 7;
                    island.add(wizard);
                    const clip = gltf.animations.find((a: any) => a.name === "Waiting") ?? gltf.animations[0];
                    if (clip) {
                        mixer = new THREE.AnimationMixer(wizard);
                        mixer.clipAction(clip).play();
                    }
                }),
                loader.loadAsync(shipUrl).then((gltf: any) => {
                    gltf.scene.scale.setScalar(0.5);
                    shipPivot.add(gltf.scene);
                }),
            ];

            // ── Fish ─────────────────────────────────────────────────────
            const schools = SCHOOLS.map((s) => ({ ...s, count: isMobile ? Math.round(s.count * 0.55) : s.count }));
            const fishTotal = schools.reduce((n, s) => n + s.count, 0);
            const fishGeo = makeFishGeometry(THREE);
            const fishMat = new THREE.MeshStandardMaterial({
                color: 0xffffff, roughness: 0.45, metalness: 0.25, flatShading: true, side: THREE.DoubleSide,
            });
            const fishMesh = new THREE.InstancedMesh(fishGeo, fishMat, fishTotal);
            fishMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            scene.add(fishMesh);

            // Per-fish: which school, a fixed offset inside it, how far it trails the leader
            const fSchool = new Uint8Array(fishTotal);
            const fOffset = new Float32Array(fishTotal * 3);
            const fLag = new Float32Array(fishTotal);
            const fPhase = new Float32Array(fishTotal);
            const tint = new THREE.Color();
            {
                let i = 0;
                schools.forEach((s, si) => {
                    for (let k = 0; k < s.count; k++, i++) {
                        fSchool[i] = si;
                        fOffset[i * 3 + 0] = (Math.random() - 0.5) * 1.6;
                        fOffset[i * 3 + 1] = (Math.random() - 0.5) * 1.1;
                        fOffset[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
                        fLag[i] = Math.random() * 0.9;
                        fPhase[i] = Math.random() * Math.PI * 2;
                        tint.setHex(s.color).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
                        fishMesh.setColorAt(i, tint);
                    }
                });
            }
            const schoolCenter = (s: School, si: number, t: number, out: any) => {
                const a = t * s.speed + si * 1.7;
                return out.set(s.x + Math.sin(a) * s.rx, s.y + Math.sin(a * 1.6) * 1.2, s.z + Math.cos(a) * s.rz);
            };

            // ── Sharks ───────────────────────────────────────────────────
            const sharkMat = new THREE.MeshStandardMaterial({ color: 0x5f7686, roughness: 0.6, side: THREE.DoubleSide });
            const sharks = SHARKS.slice(0, isMobile ? 2 : 3).map((cfg) => {
                const shark = makeShark(THREE, sharkMat);
                shark.group.scale.setScalar(cfg.scale);
                scene.add(shark.group);
                return { ...shark, cfg };
            });
            const sharkPos = (cfg: typeof SHARKS[number], t: number, out: any) => {
                const a = t * cfg.speed + cfg.phase;
                return out.set(Math.cos(a) * cfg.rx, cfg.y + Math.sin(a * 2) * 0.8, cfg.z + Math.sin(a) * cfg.rz);
            };

            // ── Jellyfish — glowing in the dark lower half ──────────────
            const jellies = Array.from({ length: isMobile ? 4 : JELLY_COUNT }, (_, i) => {
                const g = makeJelly(THREE, [0xff9ae6, 0x9ad8ff, 0xc5a4ff][i % 3]);
                g.position.set((Math.random() - 0.5) * 16, -40 - Math.random() * 14, -4 - Math.random() * 12);
                g.userData.phase = Math.random() * Math.PI * 2;
                g.userData.baseY = g.position.y;
                scene.add(g);
                return g;
            });

            // ── Sun shafts under the surface ─────────────────────────────
            const rayTex = makeRayTexture(THREE);
            const rays = Array.from({ length: isMobile ? 5 : 9 }, (_, i) => {
                const mat = new THREE.MeshBasicMaterial({
                    map: rayTex, color: 0xcff6ff, transparent: true, opacity: 0.12,
                    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
                });
                const ray = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + Math.random() * 1.8, 26), mat);
                ray.position.set(-12 + i * 3 + Math.random(), -13, -6 - Math.random() * 10);
                ray.rotation.z = -0.25 + Math.random() * 0.12;
                ray.userData.phase = Math.random() * Math.PI * 2;
                scene.add(ray);
                return ray;
            });

            // ── Marine snow / bubbles drifting up the whole column ──────
            const SNOW = isMobile ? 220 : 480;
            const snowPos = new Float32Array(SNOW * 3);
            for (let i = 0; i < SNOW; i++) {
                snowPos[i * 3 + 0] = (Math.random() - 0.5) * 34;
                snowPos[i * 3 + 1] = SEABED_Y + Math.random() * -SEABED_Y;
                snowPos[i * 3 + 2] = -22 + Math.random() * 28;
            }
            const snowGeo = new THREE.BufferGeometry();
            snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
            const snowMat = new THREE.PointsMaterial({ color: 0xdff6ff, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false });
            scene.add(new THREE.Points(snowGeo, snowMat));

            // ── Seabed — dunes, rocks and swaying kelp ───────────────────
            const bedGeo = new THREE.PlaneGeometry(150, 90, isMobile ? 60 : 110, isMobile ? 36 : 66);
            bedGeo.rotateX(-Math.PI / 2);
            {
                const p = bedGeo.attributes.position.array as Float32Array;
                for (let i = 0; i < p.length; i += 3) {
                    const x = p[i], z = p[i + 2];
                    const ripples = Math.sin(x * 1.3 + z * 0.4) * 0.06;
                    const dunes = Math.sin(x * 0.18 + 1.3) * Math.cos(z * 0.21) * 0.9;
                    const backRise = Math.max(0, -z - 18) * 0.12;
                    p[i + 1] = ripples + dunes + backRise;
                }
                bedGeo.translate(0, SEABED_Y, -20);
                bedGeo.computeVertexNormals();
            }
            const bedMat = new THREE.MeshStandardMaterial({ color: 0xe2c992, roughness: 1 });
            scene.add(new THREE.Mesh(bedGeo, bedMat));

            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4f5560, roughness: 1, flatShading: true });
            const stoneGeo = new THREE.DodecahedronGeometry(1, 0);
            for (let i = 0; i < 9; i++) {
                const stone = new THREE.Mesh(stoneGeo, stoneMat);
                const side = i % 2 ? 1 : -1;
                stone.position.set(side * (5 + Math.random() * 9), SEABED_Y + 0.2, -2 - Math.random() * 16);
                stone.scale.set(0.6 + Math.random() * 1.4, 0.4 + Math.random() * 0.9, 0.6 + Math.random() * 1.2);
                stone.rotation.set(Math.random(), Math.random() * 3, Math.random());
                scene.add(stone);
            }

            const KELP_H = 4.5;
            const kelpMat = new THREE.MeshStandardMaterial({ color: 0x3f8f5a, roughness: 0.8, side: THREE.DoubleSide });
            const kelps = Array.from({ length: isMobile ? 8 : 16 }, (_, i) => {
                const h = KELP_H * (0.6 + Math.random() * 0.7);
                const geo = new THREE.PlaneGeometry(0.35, h, 1, 10);
                geo.translate(0, h / 2, 0);
                const mesh = new THREE.Mesh(geo, kelpMat);
                const side = i % 2 ? 1 : -1;
                mesh.position.set(side * (3.5 + Math.random() * 10), SEABED_Y, -1 - Math.random() * 14);
                mesh.rotation.y = Math.random() * Math.PI;
                scene.add(mesh);
                return { geo, rest: new Float32Array(geo.attributes.position.array), h, phase: Math.random() * 6 };
            });

            const onResize = () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            };
            window.addEventListener("resize", onResize);

            // ── Frame ────────────────────────────────────────────────────
            const tmpA = new THREE.Vector3();
            const tmpB = new THREE.Vector3();
            const dummy = new THREE.Object3D();
            const lookTarget = new THREE.Vector3();
            const shallow = new THREE.Color();
            const deep = new THREE.Color();
            const sky = new THREE.Color();
            let clock = 0;
            let lastTime = performance.now();

            const renderFrame = (dt: number) => {
                clock += reducedMotion ? 0 : dt;
                const t = clock;
                const pal = PALETTES[themeRef.current];

                scroll.current = reducedMotion ? scroll.target : lerp(scroll.current, scroll.target, 0.08);
                mouse.cx = lerp(mouse.cx, mouse.tx, 0.05);
                mouse.cy = lerp(mouse.cy, mouse.ty, 0.05);

                let entry = 0;
                if (!reducedMotion) {
                    const since = revealTimeRef.current === null ? 0 : (performance.now() - revealTimeRef.current) / 1000;
                    entry = ENTRY_LIFT * (1 - easeOutCubic(clamp(since / ENTRY_DURATION, 0, 1)));
                }

                const st = scroll.current;
                const camY = cameraYAt(st) + entry;
                camera.position.set(mouse.cx * 0.5, camY - mouse.cy * 0.2, CAM_Z);
                lookTarget.set(mouse.cx * 0.2, camY + lookDropAt(st), CAM_Z - 10);
                camera.lookAt(lookTarget);

                // Water colour: sky above the surface, darkening with depth below it
                const depth = clamp(-camY / -SEABED_Y, 0, 1);
                const under = smoothstep((0.3 - camY) / 0.6);
                sky.setHex(pal.sky);
                shallow.setHex(pal.shallow);
                deep.setHex(pal.deep);
                waterColor.copy(shallow).lerp(deep, Math.pow(depth, 0.8));
                waterColor.lerp(sky, 1 - under);
                scene.fog.color.copy(waterColor); // FogExp2 copies its colour, so it can't share the instance
                scene.fog.density = lerp(0.012, lerp(0.04, 0.055, depth), under);

                hemi.color.setHex(pal.skyLight);
                hemi.groundColor.setHex(pal.groundLight);
                hemi.intensity = lerp(1.6, 0.55, depth);
                sun.intensity = lerp(2.4, 0.4, depth);
                surfaceMat.color.setHex(pal.surface);

                // Surface waves only matter while the surface is in view
                if (camY > -14 && !reducedMotion) {
                    const p = surfaceGeo.attributes.position.array as Float32Array;
                    for (let i = 0; i < p.length; i += 3) {
                        const x = surfaceRest[i], z = surfaceRest[i + 2];
                        p[i + 1] = Math.sin(x * 0.5 + t * 1.5) * 0.28 + Math.sin(z * 0.3 + t * 2.2) * 0.2;
                    }
                    surfaceGeo.attributes.position.needsUpdate = true;
                    surfaceGeo.computeVertexNormals();
                }

                mixer?.update(reducedMotion ? 0 : dt);
                shipPivot.position.x = SHIP_X + Math.sin(t * 0.25) * 1.2;
                shipPivot.position.y = 0.1 + Math.sin(t * 1.2) * 0.06;
                shipPivot.rotation.z = Math.cos(t * 0.5) * 0.05;
                shipPivot.rotation.x = Math.sin(t * 0.4) * 0.03;

                // Fish follow their school's leader along its loop, each a bit behind
                for (let i = 0; i < fishTotal; i++) {
                    const si = fSchool[i];
                    const s = schools[si];
                    const ft = t - fLag[i] * 3;
                    schoolCenter(s, si, ft, tmpA);
                    schoolCenter(s, si, ft + 0.05, tmpB);
                    const wob = Math.sin(t * 2 + fPhase[i]) * 0.15;
                    tmpA.x += fOffset[i * 3] + wob;
                    tmpA.y += fOffset[i * 3 + 1] + Math.cos(t * 1.7 + fPhase[i]) * 0.1;
                    tmpA.z += fOffset[i * 3 + 2];
                    tmpB.x += fOffset[i * 3] + wob;
                    tmpB.y += fOffset[i * 3 + 1];
                    tmpB.z += fOffset[i * 3 + 2];
                    dummy.position.copy(tmpA);
                    dummy.lookAt(tmpB);
                    dummy.rotateY(Math.sin(t * 9 + fPhase[i]) * 0.18); // tail beat
                    dummy.scale.setScalar(s.size);
                    dummy.updateMatrix();
                    fishMesh.setMatrixAt(i, dummy.matrix);
                }
                fishMesh.instanceMatrix.needsUpdate = true;

                for (const shark of sharks) {
                    sharkPos(shark.cfg, t, tmpA);
                    sharkPos(shark.cfg, t + 0.1, tmpB);
                    shark.group.position.copy(tmpA);
                    shark.group.lookAt(tmpB);
                    shark.tailPivot.rotation.y = Math.sin(t * 3.2 + shark.cfg.phase) * 0.4;
                }

                for (const j of jellies) {
                    const ph = j.userData.phase;
                    const pulse = Math.sin(t * 1.6 + ph);
                    j.position.y = j.userData.baseY + Math.sin(t * 0.4 + ph) * 1.2;
                    j.scale.set(1 + pulse * 0.08, 1 - pulse * 0.1, 1 + pulse * 0.08);
                }

                const rayFade = smoothstep((camY + 30) / 20) * under;
                for (const r of rays) {
                    (r.material as any).opacity = (0.08 + Math.sin(t * 0.6 + r.userData.phase) * 0.04) * rayFade;
                }

                if (!reducedMotion) {
                    for (let i = 0; i < SNOW; i++) {
                        let y = snowPos[i * 3 + 1] + dt * 0.25;
                        if (y > -0.5) y = SEABED_Y;
                        snowPos[i * 3 + 1] = y;
                    }
                    snowGeo.attributes.position.needsUpdate = true;
                }
                snowMat.opacity = 0.5 * under;

                if (camY < SEABED_Y + 25) {
                    for (const k of kelps) {
                        const p = k.geo.attributes.position.array as Float32Array;
                        for (let i = 0; i < p.length; i += 3) {
                            const h = k.rest[i + 1] / k.h;
                            p[i + 2] = k.rest[i + 2] + Math.sin(t * 0.9 + k.phase + h * 2.5) * h * h * 0.8;
                        }
                        k.geo.attributes.position.needsUpdate = true;
                    }
                }

                renderer.render(scene, camera);
            };

            const tick = () => {
                if (cancelled) return;
                rafId = requestAnimationFrame(tick);
                const now = performance.now();
                const dt = Math.min((now - lastTime) / 1000, 0.05);
                lastTime = now;
                renderFrame(dt);
            };

            const onVisibility = () => {
                cancelAnimationFrame(rafId);
                if (!document.hidden) {
                    lastTime = performance.now();
                    tick();
                }
            };
            document.addEventListener("visibilitychange", onVisibility);

            tick();

            Promise.allSettled(loads).then((results) => {
                if (cancelled) return;
                results.forEach((r) => r.status === "rejected" && console.warn("Ocean model failed to load", r.reason));
                onReadyRef.current?.();
            });

            cleanup = () => {
                window.removeEventListener("resize", onResize);
                document.removeEventListener("visibilitychange", onVisibility);
                cancelAnimationFrame(rafId);
                scene.traverse((obj: any) => {
                    obj.geometry?.dispose?.();
                    const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
                    mats.forEach((m: any) => { m.map?.dispose?.(); m.dispose(); });
                });
                dracoLoader.dispose();
                renderer.dispose();
            };
        })();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("mousemove", onMouseMove);
            cleanup?.();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
            }}
        />
    );
};

export default OceanScene;
