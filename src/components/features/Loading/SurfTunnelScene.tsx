/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

interface SurfTunnelSceneProps {
    reducedMotion: boolean;
}

const LOOP_MS = 2000;

// Timeline beats as fractions of the 2s loop: 0, .3, .6, .9, 1.3, 1.7, 2.0s.
const BEATS = [0, 0.15, 0.3, 0.45, 0.65, 0.85, 1];
// How far the camera has travelled into the barrel (0 = deep inside/tight, 1 = at the exit).
const PROGRESS  = [0, 0, 0.05, 0.4, 0.82, 1, 1];
const FOAM_RATE = [0.4, 0.4, 0.5, 0.8, 1.6, 2.3, 0.4];

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
function smoothstep(t: number) {
    const c = Math.max(0, Math.min(1, t));
    return c * c * (3 - 2 * c);
}
function interpBeats(values: number[], t: number) {
    const n = BEATS.length - 1;
    let i = 0;
    while (i < n - 1 && t > BEATS[i + 1]) i++;
    const span = BEATS[i + 1] - BEATS[i] || 1;
    const f = (t - BEATS[i]) / span;
    return lerp(values[i], values[i + 1], f);
}

// ── Barrel geometry ─────────────────────────────────────────────────────
// The wall wraps all the way under the camera now (a full U/C-shaped
// channel: floor → near wall → ceiling/lip), not just the top and one side —
// it rises from a continuous floor, curls up and over to form the ceiling,
// and only stops short of closing on the far/lip side, which is the open
// water/exit. As the camera travels deeper toward the exit, the arc's sweep
// shrinks from that lip end (less ceiling overhead) and its radius grows, so
// the barrel visibly opens up — the floor stays put throughout.
const ARC_CENTER_X   = 0.5;   // wall's arc is centred off to one side of the camera path
const ARC_CENTER_Y   = 0.2;
const ANGLE_START_DEG = -100;  // reaches under the camera — the floor of the channel
const SWEEP_START_DEG = 360;   // total wrap at the deepest point of the barrel (floor to lip)
const SWEEP_END_DEG   = 300;   // total wrap right at the exit — ceiling opens, floor remains
const RADIUS_START = 2.0;
const RADIUS_END   = 3.3;
const TOTAL_LENGTH = 36;

// ── Board nose overlay ──────────────────────────────────────────────────
// The board itself is a screen-space SVG overlay drawn by SurfLoader.tsx
// (not part of the WebGL scene), but its position/size/sway is tuned here
// alongside the rest of the scene's art-direction constants.
export const BOARD_CONFIG = {
    widthVw: 72,          // responsive width, capped by widthMaxPx
    widthMaxPx: 360,
    leftPercent: 75,      // horizontal anchor, % of the loader viewport
    bottomFactor: -0.1,   // how far the board dips below the fold, as a multiple of its own width
    baseTiltDeg: -7.25,   // resting tilt (leaning into the wave)
    swayDeg: 5.5,         // full sway range around baseTiltDeg
    bobPx: 5,             // vertical bob amplitude
    swayDurationS: 3.6,
    reducedTiltDeg: -6,   // static tilt used under prefers-reduced-motion
};

function sliceShape(u: number) {
    const e = smoothstep(u);
    const sweepDeg = lerp(SWEEP_START_DEG, SWEEP_END_DEG, e);
    const radius = lerp(RADIUS_START, RADIUS_END, e);
    const angleStart = ANGLE_START_DEG * (Math.PI / 180);
    const angleEnd = angleStart + sweepDeg * (Math.PI / 180);
    return { angleStart, angleEnd, radius };
}

// ── Procedural value noise / FBM — no textures/dependencies, just math,
// reused both to bake the water's normal/roughness maps and to break up the
// lip foam into patches instead of a smooth band. ──
function hash2(x: number, y: number): number {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
}
function valueNoise2D(x: number, y: number): number {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function fbm2D(x: number, y: number, octaves: number): number {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
        sum += amp * valueNoise2D(x * freq, y * freq);
        norm += amp;
        amp *= 0.5;
        freq *= 2.05;
    }
    return sum / norm;
}

// Bakes a multi-octave (macro+meso+micro) height field once, then derives a
// normal map (finite-difference gradient) and a roughness map (smooth water
// vs. rougher/foamier patches) from it — animated later via UV offset so the
// surface keeps breaking up highlights even while the camera sits still.
function makeWaterMaps(THREE: any, size: number) {
    const heights = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const u = x / size, v = y / size;
            const h =
                fbm2D(u * 3.2, v * 3.2, 3) * 0.55 +
                fbm2D(u * 9.5 + 7.3, v * 9.5 + 2.1, 3) * 0.3 +
                fbm2D(u * 23 + 15.1, v * 23 + 9.7, 2) * 0.15;
            heights[y * size + x] = h;
        }
    }
    const normalData = new Uint8ClampedArray(size * size * 4);
    const roughData = new Uint8ClampedArray(size * size * 4);
    const strength = 2.0;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const xL = heights[y * size + ((x - 1 + size) % size)];
            const xR = heights[y * size + ((x + 1) % size)];
            const yU = heights[((y - 1 + size) % size) * size + x];
            const yD = heights[((y + 1 + size) % size) * size + x];
            let nx = -(xR - xL) * strength;
            let ny = -(yD - yU) * strength;
            let nz = 1;
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            nx /= len; ny /= len; nz /= len;
            const idx = (y * size + x) * 4;
            normalData[idx + 0] = (nx * 0.5 + 0.5) * 255;
            normalData[idx + 1] = (ny * 0.5 + 0.5) * 255;
            normalData[idx + 2] = (nz * 0.5 + 0.5) * 255;
            normalData[idx + 3] = 255;

            const h = heights[y * size + x];
            const rough = Math.max(0.1, Math.min(0.9, 0.24 + h * 0.6)) * 255;
            roughData[idx + 0] = rough; roughData[idx + 1] = rough; roughData[idx + 2] = rough; roughData[idx + 3] = 255;
        }
    }
    const normalTex = new THREE.DataTexture(normalData, size, size, THREE.RGBAFormat);
    normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping;
    normalTex.colorSpace = THREE.NoColorSpace;
    normalTex.needsUpdate = true;

    const roughTex = new THREE.DataTexture(roughData, size, size, THREE.RGBAFormat);
    roughTex.wrapS = roughTex.wrapT = THREE.RepeatWrapping;
    roughTex.colorSpace = THREE.NoColorSpace;
    roughTex.needsUpdate = true;

    return { normalTex, roughTex };
}

// Soft round sprite for particles — WebGL gl.POINTS default to hard squares,
// which read as debug markers rather than spray without this.
function makeDotTexture(THREE: any): any {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}

const SurfTunnelScene = ({ reducedMotion }: SurfTunnelSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let cancelled = false;
        let rafId = 0;

        (async () => {
            const THREE = await import("three");
            if (cancelled) return;

            const isMobile = window.innerWidth < 768;
            const LEN_SEG = isMobile ? 34 : 50;
            const ARC_SEG = isMobile ? 20 : 30;
            const FOAM_COUNT = isMobile ? 90 : 190;

            const w = canvas.clientWidth || window.innerWidth;
            const h = canvas.clientHeight || window.innerHeight;
            const dotTexture = makeDotTexture(THREE);
            const { normalTex, roughTex } = makeWaterMaps(THREE, isMobile ? 128 : 256);

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setClearColor(0x000000, 1);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;

            const scene = new THREE.Scene();
            // Wherever a ray escapes through the open side of the barrel and
            // hits no geometry, it must show bright open water/sky, not the
            // renderer's black clear colour — otherwise the opening reads as
            // a solid black hole instead of daylight beyond the wave.
            scene.background = new THREE.Color(0x14415c);
            // Fog fades to a dark petrol blue, not flat black, so distant wall
            // stays a readable dark blue instead of dissolving into the void.
            scene.fog = new THREE.FogExp2(0x040e18, 0.038);

            const camera = new THREE.PerspectiveCamera(85, w / h, 0.05, TOTAL_LENGTH + 18);

            // ── Wave wall — a single lofted, open-arc surface (not a closed
            // tube): built once into rest-position/angle buffers, then given a
            // small procedural ripple each frame for organic movement. ──
            const vCount = (LEN_SEG + 1) * (ARC_SEG + 1);
            const restPos = new Float32Array(vCount * 3);
            const cosA = new Float32Array(vCount);
            const sinA = new Float32Array(vCount);
            const angleArr = new Float32Array(vCount);
            const uArr = new Float32Array(vCount);
            const vArr = new Float32Array(vCount);
            const colorArr = new Float32Array(vCount * 3);
            const uvArr = new Float32Array(vCount * 2);
            // Kept close to each other (not one axis wildly higher than the
            // other) so the baked noise doesn't stretch into vertical streaks.
            const UV_REPEAT_U = isMobile ? 3.4 : 4.6;
            const UV_REPEAT_V = 2.6;

            // Never crushes to near-black: darkest water is still a readable
            // deep petrol blue, brightening toward a richer ocean blue and
            // finally pale cyan foam at the lip.
            const deepColor = new THREE.Color(0x0a2338);
            const midColor = new THREE.Color(0x1f6f8f);
            const foamColor = new THREE.Color(0xdff6ff);

            let vi = 0;
            for (let i = 0; i <= LEN_SEG; i++) {
                const u = i / LEN_SEG;
                const z = -u * TOTAL_LENGTH;
                const { angleStart, angleEnd, radius } = sliceShape(u);
                for (let k = 0; k <= ARC_SEG; k++) {
                    const v = k / ARC_SEG;
                    const angle = lerp(angleStart, angleEnd, v);
                    const ca = Math.cos(angle), sa = Math.sin(angle);
                    const x = ARC_CENTER_X + ca * radius;
                    const y = ARC_CENTER_Y + sa * radius;
                    restPos[vi * 3 + 0] = x;
                    restPos[vi * 3 + 1] = y;
                    restPos[vi * 3 + 2] = z;
                    cosA[vi] = ca;
                    sinA[vi] = sa;
                    angleArr[vi] = angle;
                    uArr[vi] = u;
                    vArr[vi] = v;
                    uvArr[vi * 2 + 0] = u * UV_REPEAT_U;
                    uvArr[vi * 2 + 1] = v * UV_REPEAT_V;

                    // Organic "thickness" variation — not a straight gradient — so
                    // some patches of wall read thinner/more lit than others, the
                    // way real water density and light passage never look uniform.
                    const thickness = fbm2D(u * 2.1 + 1.3, v * 1.7 + 5.5, 3);
                    const uMix = THREE.MathUtils.clamp(u * 0.5 + v * 0.22 + thickness * 0.3 + 0.08, 0, 1);
                    const base = deepColor.clone().lerp(midColor, uMix);
                    // Foam clings to the lip as uneven patches/clusters, not a clean band.
                    const lipMix = Math.max(0, (v - 0.7) / 0.3);
                    const patch = fbm2D(u * 14 + 4.2, v * 10 + 1.7, 3);
                    const foamAmt = Math.max(0, lipMix * (0.35 + 0.85 * patch) - 0.06);
                    base.lerp(foamColor, Math.min(1, foamAmt * 1.6));
                    colorArr[vi * 3 + 0] = base.r;
                    colorArr[vi * 3 + 1] = base.g;
                    colorArr[vi * 3 + 2] = base.b;
                    vi++;
                }
            }

            const indices: number[] = [];
            const rowLen = ARC_SEG + 1;
            for (let i = 0; i < LEN_SEG; i++) {
                for (let k = 0; k < ARC_SEG; k++) {
                    const a0 = i * rowLen + k;
                    const a1 = a0 + 1;
                    const b0 = a0 + rowLen;
                    const b1 = b0 + 1;
                    indices.push(a0, b0, b1, a0, b1, a1);
                }
            }

            const waveGeo = new THREE.BufferGeometry();
            waveGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(restPos), 3));
            waveGeo.setAttribute("color", new THREE.BufferAttribute(colorArr, 3));
            waveGeo.setAttribute("uv", new THREE.BufferAttribute(uvArr, 2));
            waveGeo.setIndex(indices);
            waveGeo.computeVertexNormals();

            // normalMap and roughnessMap scroll independently each frame (see
            // the render loop below) so highlights break up and drift instead
            // of sitting frozen — the surface stays "alive" even when the
            // camera holds still.
            const waveMat = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.82,
                metalness: 0.0,
                normalMap: normalTex,
                normalScale: new THREE.Vector2(0.55, 0.55),
                roughnessMap: roughTex,
                // Just enough built-in glow that the water is never truly
                // unlit and crushes to black — but dim, so the mass still
                // reads as dense, dark water rather than glowing from within.
                emissive: new THREE.Color(0x051420),
                emissiveIntensity: 0.55,
                side: THREE.DoubleSide,
                fog: true,
            });
            const waveMesh = new THREE.Mesh(waveGeo, waveMat);
            scene.add(waveMesh);

            // ── Lights — the wall must stay readable everywhere (never pure
            // black), while the exit ahead still reads as clearly the
            // brightest point, so depth/direction still come through. ──
            const ambient = new THREE.AmbientLight(0x0c2c45, 1.05);
            scene.add(ambient);

            // Kept well past the camera's farthest travel point (z = -TOTAL_LENGTH)
            // so proximity can't blow the material to solid white; now that the
            // minimum distance is guaranteed large, intensity can be pushed hard
            // to properly flood the exit with daylight.
            const exitLight = new THREE.PointLight(0xa9ecff, 55, TOTAL_LENGTH + 34, 1.35);
            exitLight.position.set(ARC_CENTER_X * 0.2, 0.9, -(TOTAL_LENGTH + 10));
            scene.add(exitLight);

            // A second, softer light roughly mid-barrel keeps the middle of the
            // ride lit too, instead of only the two ends (camera fill + exit).
            const midLight = new THREE.PointLight(0x1a5a80, 10, 26, 1.5);
            midLight.position.set(ARC_CENTER_X * 0.6, 1.4, -TOTAL_LENGTH * 0.32);
            scene.add(midLight);

            // The barrel is now long enough that one mid-light leaves the far
            // two-thirds dim — a second one keeps the whole ride lit.
            const midLight2 = new THREE.PointLight(0x1a5a80, 10, 26, 1.5);
            midLight2.position.set(ARC_CENTER_X * 0.4, 1.2, -TOTAL_LENGTH * 0.68);
            scene.add(midLight2);

            const fillLight = new THREE.PointLight(0x145174, 1.4, 6, 1.8);
            scene.add(fillLight); // repositioned to follow the camera each frame

            const rimLight = new THREE.DirectionalLight(0x2fd8ff, 0.7);
            rimLight.position.set(-2, 2, 1);
            scene.add(rimLight);

            // ── Exit glow — soft light flaring where the barrel opens up ──
            const glowMat = new THREE.SpriteMaterial({
                map: dotTexture, color: 0xeafcff, transparent: true, opacity: 0.55,
                blending: THREE.AdditiveBlending, depthWrite: false, fog: true,
            });
            const exitGlow = new THREE.Sprite(glowMat);
            exitGlow.scale.set(15, 15, 1);
            exitGlow.position.copy(exitLight.position);
            scene.add(exitGlow);

            // ── Spray / foam — clings to the curling lip along the whole
            // length of the barrel; the camera flying past reveals it, no
            // recycling needed since the wall itself is a static, finite shape.
            // Two size tiers (fine mist + bigger droplets) instead of one
            // uniform population, so it reads as real spray, not stars. ──
            function makeFoamTier(count: number, sizeBase: number, opacityBase: number, vMin: number, vMax: number, fallMin: number, fallMax: number) {
                const fU = new Float32Array(count);
                const fV0 = new Float32Array(count);
                const fFallPh = new Float32Array(count);
                const fFallSp = new Float32Array(count);
                const fJitter = new Float32Array(count);
                for (let i = 0; i < count; i++) {
                    fU[i] = Math.random();
                    fV0[i] = vMin + Math.random() * (vMax - vMin);
                    fFallPh[i] = Math.random();
                    fFallSp[i] = fallMin + Math.random() * (fallMax - fallMin);
                    fJitter[i] = 0.9 + Math.random() * 0.25;
                }
                const geo = new THREE.BufferGeometry();
                geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
                const mat = new THREE.PointsMaterial({
                    color: 0xffffff, size: sizeBase,
                    map: dotTexture, alphaTest: 0.02, depthWrite: false,
                    transparent: true, opacity: opacityBase, sizeAttenuation: true, fog: true,
                });
                const points = new THREE.Points(geo, mat);
                scene.add(points);
                const place = (i: number, fallT: number) => {
                    const u = fU[i];
                    const v = Math.min(0.99, fV0[i] + (1 - fV0[i]) * fallT * 0.6);
                    const { angleStart, angleEnd, radius } = sliceShape(u);
                    const angle = lerp(angleStart, angleEnd, v);
                    const r = radius * fJitter[i] * (1 - fallT * 0.12);
                    return [
                        ARC_CENTER_X + Math.cos(angle) * r,
                        ARC_CENTER_Y + Math.sin(angle) * r - fallT * 0.35,
                        -u * TOTAL_LENGTH,
                    ];
                };
                return { count, fFallPh, fFallSp, geo, mat, place, baseOpacity: opacityBase };
            }

            const foamFine = makeFoamTier(FOAM_COUNT, isMobile ? 0.045 : 0.06, 0.55, 0.8, 1.0, 0.55, 1.3);
            const foamBig  = makeFoamTier(Math.round(FOAM_COUNT * 0.26), isMobile ? 0.1 : 0.135, 0.6, 0.82, 0.98, 0.32, 0.7);
            const foamTiers = [foamFine, foamBig];

            // ── Foreground droplets — a handful of large, close, drifting
            // points anchored just ahead of the camera, for scale/speed/depth. ──
            const DROP_COUNT = isMobile ? 6 : 10;
            const dBaseX = new Float32Array(DROP_COUNT);
            const dBaseY = new Float32Array(DROP_COUNT);
            const dBaseZ = new Float32Array(DROP_COUNT);
            const dSpeed = new Float32Array(DROP_COUNT);
            const dPhase = new Float32Array(DROP_COUNT);
            const dAmp   = new Float32Array(DROP_COUNT);
            for (let i = 0; i < DROP_COUNT; i++) {
                dBaseX[i] = (Math.random() - 0.5) * 0.9;
                dBaseY[i] = (Math.random() - 0.55) * 0.5;
                dBaseZ[i] = -(0.35 + Math.random() * 0.75);
                dSpeed[i] = 0.55 + Math.random() * 1.1;
                dPhase[i] = Math.random() * Math.PI * 2;
                dAmp[i] = 0.45 + Math.random() * 0.6;
            }
            const dropGeo = new THREE.BufferGeometry();
            dropGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(DROP_COUNT * 3), 3));
            const dropMat = new THREE.PointsMaterial({
                color: 0xdff6ff, size: isMobile ? 0.055 : 0.075,
                map: dotTexture, alphaTest: 0.02, depthWrite: false,
                transparent: true, opacity: 0.45, sizeAttenuation: true, fog: false,
            });
            const droplets = new THREE.Points(dropGeo, dropMat);
            scene.add(droplets);

            const onResize = () => {
                const nw = canvas.clientWidth || window.innerWidth;
                const nh = canvas.clientHeight || window.innerHeight;
                renderer.setSize(nw, nh, false);
                camera.aspect = nw / nh;
                camera.updateProjectionMatrix();
            };
            window.addEventListener("resize", onResize);

            let clock = 0;
            let lastTime = performance.now();

            const applyRipple = (t: number) => {
                const posArr = waveGeo.attributes.position.array as Float32Array;
                for (let idx = 0; idx < vCount; idx++) {
                    const angle = angleArr[idx], u = uArr[idx], v = vArr[idx];
                    // High amplitude throughout, including the floor/base — this
                    // is meant to read as heavy folds of a real wave, not a
                    // smooth pipe with a bit of texture near the top.
                    const amp = 0.16 * (0.55 + 0.7 * Math.max(0, v - 0.05));
                    // Every term mixes both angle and length so nothing collapses
                    // into a pure "ring" or pure "stripe" — deformation direction
                    // stays blended across the surface, not axis-aligned.
                    const n =
                        Math.sin(angle * 3 + u * 6 + t * 1.1) * 0.5 +
                        Math.sin(angle * 5 - u * 9 - t * 0.8) * 0.24 +
                        Math.sin(angle * 1.6 + u * 14 + t * 1.6) * 0.15 +
                        Math.sin(angle * 13 + u * 22 - t * 2.6) * 0.11; // micro crests/ripples
                    const delta = amp * n * (RADIUS_START + (RADIUS_END - RADIUS_START) * u);
                    posArr[idx * 3 + 0] = restPos[idx * 3 + 0] + delta * cosA[idx];
                    posArr[idx * 3 + 1] = restPos[idx * 3 + 1] + delta * sinA[idx];
                    posArr[idx * 3 + 2] = restPos[idx * 3 + 2];
                }
                waveGeo.attributes.position.needsUpdate = true;
                waveGeo.computeVertexNormals();
            };

            const placeCamera = (progress: number, t: number, animated: boolean) => {
                const z = -progress * TOTAL_LENGTH;
                const swayX = animated ? Math.sin(t * 0.8) * 0.1 : 0;
                const bobY = animated ? Math.sin(t * 1.3) * 0.045 : 0;
                camera.position.set(swayX, 0.18 + bobY, z);
                camera.rotation.set(
                    animated ? Math.sin(t * 0.6) * 0.018 : 0,
                    lerp(0, -0.16, progress) + (animated ? Math.sin(t * 0.5) * 0.012 : 0),
                    animated ? Math.sin(t * 0.7) * 0.02 : 0,
                );
                fillLight.position.set(camera.position.x, camera.position.y, camera.position.z + 1.2);
            };

            const renderStaticFrame = () => {
                applyRippleStatic();
                placeCamera(0.3, 0, false);
                for (const tier of foamTiers) {
                    const posArr = tier.geo.attributes.position.array as Float32Array;
                    for (let i = 0; i < tier.count; i++) {
                        const [x, y, z] = tier.place(i, 0.3);
                        posArr[i * 3 + 0] = x; posArr[i * 3 + 1] = y; posArr[i * 3 + 2] = z;
                    }
                    tier.geo.attributes.position.needsUpdate = true;
                    tier.mat.opacity = tier.baseOpacity * 0.75;
                }
                renderer.render(scene, camera);
            };

            function applyRippleStatic() {
                waveGeo.attributes.position.array.set(restPos);
                (waveGeo.attributes.position as any).needsUpdate = true;
                waveGeo.computeVertexNormals();
            }

            let tickFn: (() => void) | undefined;

            if (reducedMotion) {
                renderStaticFrame();
            } else {
                tickFn = () => {
                    if (cancelled) return;
                    rafId = requestAnimationFrame(tickFn!);

                    const now = performance.now();
                    const dt = Math.min((now - lastTime) / 1000, 0.05);
                    lastTime = now;
                    clock += dt;

                    const loopT = (clock * 1000 % LOOP_MS) / LOOP_MS;
                    const progress = interpBeats(PROGRESS, loopT);
                    const foamRate = interpBeats(FOAM_RATE, loopT);

                    applyRipple(clock);
                    placeCamera(progress, clock, true);

                    // Scroll the baked noise maps independently — breaks up
                    // specular highlights and foam patches so they drift and
                    // reshape instead of reading as one static texture.
                    normalTex.offset.set(clock * 0.02, clock * -0.015);
                    roughTex.offset.set(clock * -0.011, clock * 0.017);

                    for (const tier of foamTiers) {
                        const posArr = tier.geo.attributes.position.array as Float32Array;
                        for (let i = 0; i < tier.count; i++) {
                            tier.fFallPh[i] = (tier.fFallPh[i] + dt * tier.fFallSp[i] * foamRate * 0.6) % 1;
                            const [x, y, z] = tier.place(i, tier.fFallPh[i]);
                            posArr[i * 3 + 0] = x; posArr[i * 3 + 1] = y; posArr[i * 3 + 2] = z;
                        }
                        tier.geo.attributes.position.needsUpdate = true;
                        tier.mat.opacity = THREE.MathUtils.clamp(tier.baseOpacity * (0.65 + foamRate * 0.35), 0, 0.95);
                    }

                    const dropArr = dropGeo.attributes.position.array as Float32Array;
                    for (let i = 0; i < DROP_COUNT; i++) {
                        const drift = Math.sin(clock * dSpeed[i] + dPhase[i]) * dAmp[i];
                        dropArr[i * 3 + 0] = camera.position.x + dBaseX[i] + drift;
                        dropArr[i * 3 + 1] = camera.position.y + dBaseY[i];
                        dropArr[i * 3 + 2] = camera.position.z + dBaseZ[i];
                    }
                    dropGeo.attributes.position.needsUpdate = true;
                    dropMat.opacity = THREE.MathUtils.clamp(0.3 + foamRate * 0.18, 0, 0.7);

                    exitLight.intensity = 50 + foamRate * 8;
                    glowMat.opacity = 0.42 + THREE.MathUtils.clamp((progress - 0.3) / 0.7, 0, 1) * 0.36;

                    renderer.render(scene, camera);
                };
                tickFn();
            }

            const onVisibility = () => {
                if (reducedMotion) return;
                if (!document.hidden && tickFn) {
                    lastTime = performance.now();
                    tickFn();
                } else {
                    cancelAnimationFrame(rafId);
                }
            };
            document.addEventListener("visibilitychange", onVisibility);

            (canvasRef as any)._cleanup = () => {
                window.removeEventListener("resize", onResize);
                document.removeEventListener("visibilitychange", onVisibility);
                cancelAnimationFrame(rafId);
                waveGeo.dispose();
                waveMat.dispose();
                normalTex.dispose();
                roughTex.dispose();
                foamTiers.forEach((tier) => { tier.geo.dispose(); tier.mat.dispose(); });
                dropGeo.dispose();
                dropMat.dispose();
                glowMat.dispose();
                dotTexture.dispose();
                renderer.dispose();
            };
        })();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            (canvasRef as any)._cleanup?.();
        };
    }, [reducedMotion]);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />
    );
};

export default SurfTunnelScene;
