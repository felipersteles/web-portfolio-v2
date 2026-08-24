/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

// Same earth model used by the original Earth.tsx component
const earthUrl = new URL("../../../assets/models/earth.gltf", import.meta.url).href;

interface PortfolioSceneProps {
    theme: "dark" | "light";
    revealed?: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
// Overshoots slightly past 1 before settling — the "rise up and drop into place" feel
const easeOutBack = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const ENTRY_DROP = 0.2;   // world units the globe starts below its resting spot
const ENTRY_DURATION = 0.65; // seconds

type ScrollState = {
    ndcX: number; ndcY: number; scale: number;
    // Light / emissive tint (0-1 per channel)
    lr: number; lg: number; lb: number;
};

// 4 keyframes mapped to scroll 0→1
// ndcX/ndcY: offset from screen center in NDC (-1..1)
const DARK_STATES: ScrollState[] = [
    { ndcX:  0.36, ndcY:  0.00, scale: 1.00, lr: 0.00, lg: 0.71, lb: 0.85 }, // ocean   – hero
    { ndcX: -0.33, ndcY:  0.05, scale: 0.62, lr: 0.62, lg: 0.80, lb: 1.00 }, // ice     – projects
    { ndcX:  0.27, ndcY: -0.06, scale: 0.50, lr: 0.58, lg: 0.44, lb: 1.00 }, // violet  – stats
    { ndcX: -0.17, ndcY:  0.11, scale: 0.38, lr: 0.35, lg: 0.16, lb: 0.82 }, // indigo  – papers/about
];

const LIGHT_STATES: ScrollState[] = [
    { ndcX:  0.36, ndcY:  0.00, scale: 0.88, lr: 0.00, lg: 0.45, lb: 0.56 },
    { ndcX: -0.33, ndcY:  0.05, scale: 0.56, lr: 0.28, lg: 0.46, lb: 0.72 },
    { ndcX:  0.27, ndcY: -0.06, scale: 0.44, lr: 0.42, lg: 0.26, lb: 0.72 },
    { ndcX: -0.17, ndcY:  0.11, scale: 0.34, lr: 0.28, lg: 0.10, lb: 0.62 },
];

function interpState(states: ScrollState[], t: number): ScrollState {
    const n = states.length - 1;
    const scaled = clamp(t, 0, 1) * n;
    const lo = Math.floor(scaled);
    const hi = Math.min(lo + 1, n);
    const f = easeInOutCubic(scaled - lo);
    const sa = states[lo], sb = states[hi];
    return {
        ndcX:  lerp(sa.ndcX,  sb.ndcX,  f),
        ndcY:  lerp(sa.ndcY,  sb.ndcY,  f),
        scale: lerp(sa.scale, sb.scale, f),
        lr:    lerp(sa.lr,    sb.lr,    f),
        lg:    lerp(sa.lg,    sb.lg,    f),
        lb:    lerp(sa.lb,    sb.lb,    f),
    };
}

const PortfolioScene = ({ theme, revealed = true }: PortfolioSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Persists across theme-driven scene rebuilds so the entry animation only ever plays once
    const revealTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (revealed && revealTimeRef.current === null) {
            revealTimeRef.current = performance.now();
        }
    }, [revealed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let cancelled = false;
        let rafId = 0;

        const isMobile = window.innerWidth < 768;
        const PARTICLE_COUNT = isMobile ? 28 : 72;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const scrollTarget  = { t: 0 };
        const scrollCurrent = { t: 0 };
        const mouse = { tx: 0, ty: 0, cx: 0, cy: 0 };
        let clock    = 0;
        let lastTime = performance.now();

        const onScroll = () => {
            if (reducedMotion) return;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            scrollTarget.t = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (reducedMotion || isMobile) return;
            mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
            mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        window.addEventListener("scroll",    onScroll,    { passive: true });
        window.addEventListener("mousemove", onMouseMove);

        let tickFn: (() => void) | undefined;

        const onVisibility = () => {
            if (!document.hidden && tickFn) {
                lastTime = performance.now();
                tickFn();
            } else {
                cancelAnimationFrame(rafId);
            }
        };
        document.addEventListener("visibilitychange", onVisibility);

        // Per-particle data (allocated once, reused every frame)
        const pAngles = new Float32Array(PARTICLE_COUNT);
        const pRadii  = new Float32Array(PARTICLE_COUNT);
        const pSpeeds = new Float32Array(PARTICLE_COUNT);
        const pTilts  = new Float32Array(PARTICLE_COUNT);
        const pYaws   = new Float32Array(PARTICLE_COUNT);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pAngles[i] = Math.random() * Math.PI * 2;
            pRadii[i]  = 1.55 + Math.random() * 0.80;
            pSpeeds[i] = (0.16 + Math.random() * 0.28) * (Math.random() < 0.5 ? 1 : -1);
            pTilts[i]  = (Math.random() - 0.5) * Math.PI * 1.8;
            pYaws[i]   = Math.random() * Math.PI * 2;
        }

        (async () => {
            const [THREE, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
                import("three"),
                import("three/examples/jsm/loaders/GLTFLoader.js"),
                import("three/examples/jsm/loaders/DRACOLoader.js"),
            ]);
            if (cancelled) return;

            const w = window.innerWidth;
            const h = window.innerHeight;

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.1;
            // Required for MeshPhysicalMaterial features
            (renderer as any).useLegacyLights = false;

            const darkBg  = new THREE.Color(0x040814);
            const lightBg = new THREE.Color(0xf5f2ed);
            renderer.setClearColor(theme === "dark" ? darkBg : lightBg, 1);

            const scene  = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 100);
            camera.position.set(0, 0, 5);

            // ── Lights ───────────────────────────────────────────────────────────
            // Dim ambient — the earth should be dramatically lit
            const ambientLight = new THREE.AmbientLight(
                theme === "dark" ? 0x080d1a : 0xaaaacc, 0.35,
            );
            scene.add(ambientLight);

            // Main sun light (warm directional)
            const sunLight = new THREE.DirectionalLight(0xfff0d0, 2.2);
            sunLight.position.set(8, 4, 6);
            scene.add(sunLight);

            // Fill light (opposite side, cool)
            const fillLight = new THREE.DirectionalLight(0x4466cc, 0.5);
            fillLight.position.set(-6, -2, -4);
            scene.add(fillLight);

            // Core point light (animated colour)
            const coreLight = new THREE.PointLight(0x00b5d8, 2.8, 14);
            scene.add(coreLight); // position updated each frame to follow orbGroup

            // ── Orb group ──────────────────────────────────────────────────────
            const orbGroup = new THREE.Group();
            scene.add(orbGroup);

            // ── Emissive inner core (visible through transparent earth parts) ──
            const coreGeo = new THREE.SphereGeometry(0.28, 32, 32);
            const coreMat = new THREE.MeshPhysicalMaterial({
                color:             new THREE.Color(0x00b5d8),
                emissive:          new THREE.Color(0x00b5d8),
                emissiveIntensity: 3.0,
                roughness:         0.45,
                metalness:         0.0,
            });
            const coreMesh = new THREE.Mesh(coreGeo, coreMat);
            orbGroup.add(coreMesh);

            // ── Earth GLTF model ──────────────────────────────────────────────
            let earthPivot: any = null;
            try {
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath(
                    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
                );
                const loader = new GLTFLoader();
                loader.setDRACOLoader(dracoLoader);

                const gltf = await loader.loadAsync(earthUrl);
                if (cancelled) return;

                const earthModel = gltf.scene;

                // Make transparent layers show the inner core glow
                earthModel.traverse((child: any) => {
                    if (!child.isMesh) return;
                    if (child.material.transparent) {
                        child.material.opacity = 0.22;
                    }
                    // Upgrade to MeshPhysicalMaterial for better PBR
                    if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                        child.material.roughness  = Math.min(child.material.roughness, 0.65);
                        child.material.metalness  = 0.08;
                        child.material.needsUpdate = true;
                    }
                });

                // Scale earth to fit scene (target radius ~1.1 world units)
                const tempBox = new THREE.Box3().setFromObject(earthModel);
                const tempSphere = new THREE.Sphere();
                tempBox.getBoundingSphere(tempSphere);
                const scaleFactor = 1.1 / tempSphere.radius;
                earthModel.scale.setScalar(scaleFactor);

                // Center model at origin
                const centeredBox = new THREE.Box3().setFromObject(earthModel);
                const center = new THREE.Vector3();
                centeredBox.getCenter(center);
                earthModel.position.sub(center);

                earthPivot = new THREE.Group();
                earthPivot.add(earthModel);
                orbGroup.add(earthPivot);

                // ── Glass atmosphere shell (wraps earth) ──────────────────────
                const glassRadius = 1.1 * 1.06; // slightly larger than earth
                const glassGeo = new THREE.SphereGeometry(glassRadius, isMobile ? 64 : 128, isMobile ? 64 : 128);
                const glassMat: any = new THREE.MeshPhysicalMaterial({
                    color:     0xffffff,
                    roughness: 0.0,
                    metalness: 0.0,
                    ...(isMobile
                        ? { transparent: true, opacity: 0.14 }
                        : { transmission: 0.94, thickness: 0.6, ior: 1.55 }),
                });
                try {
                    glassMat.iridescence = 0.85;
                    glassMat.iridescenceIOR = 1.38;
                    glassMat.iridescenceThicknessRange = [60, 360];
                } catch {}
                orbGroup.add(new THREE.Mesh(glassGeo, glassMat));

                // Update particle radii to orbit outside the glass shell
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    pRadii[i] = glassRadius * 1.25 + Math.random() * glassRadius * 0.55;
                }
            } catch (err) {
                console.warn("Earth model failed to load — using fallback sphere", err);
                // Fallback: plain emissive sphere
                const fallbackGeo  = new THREE.SphereGeometry(1.1, 64, 64);
                const fallbackMat  = new THREE.MeshPhysicalMaterial({
                    color:             0x00b5d8,
                    emissive:          0x00b5d8,
                    emissiveIntensity: 1.2,
                    roughness:         0.5,
                });
                orbGroup.add(new THREE.Mesh(fallbackGeo, fallbackMat));
                earthPivot = null;
            }

            // ── Outer glow halo (BackSide) ────────────────────────────────────
            const glowGeo = new THREE.SphereGeometry(1.52, 32, 32);
            const glowMat = new THREE.MeshPhysicalMaterial({
                color:             new THREE.Color(0x00b5d8),
                emissive:          new THREE.Color(0x00b5d8),
                emissiveIntensity: 0.45,
                roughness:         1.0,
                transparent:       true,
                opacity:           theme === "dark" ? 0.085 : 0.055,
                side:              THREE.BackSide,
                depthWrite:        false,
            });
            const glowMesh = new THREE.Mesh(glowGeo, glowMat);
            orbGroup.add(glowMesh);

            // ── Orbiting particles ────────────────────────────────────────────
            const pPositions = new Float32Array(PARTICLE_COUNT * 3);
            const pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
            const particleMat = new THREE.PointsMaterial({
                color:           new THREE.Color(0xbfeefc),
                size:            isMobile ? 0.016 : 0.020,
                transparent:     true,
                opacity:         theme === "dark" ? 0.68 : 0.48,
                sizeAttenuation: true,
                depthWrite:      false,
            });
            const particleMesh = new THREE.Points(pGeo, particleMat);
            orbGroup.add(particleMesh);

            // Camera frustum half-extents at z=0 (for world-space NDC conversion)
            const fovRad = (50 * Math.PI) / 180;
            const halfH  = Math.tan(fovRad / 2) * 5;

            const states = theme === "dark" ? DARK_STATES : LIGHT_STATES;

            const onResize = () => {
                const nw = window.innerWidth;
                const nh = window.innerHeight;
                renderer.setSize(nw, nh);
                camera.aspect = nw / nh;
                camera.updateProjectionMatrix();
            };
            window.addEventListener("resize", onResize);

            tickFn = () => {
                if (cancelled) return;
                rafId = requestAnimationFrame(tickFn!);

                const now = performance.now();
                const dt  = Math.min((now - lastTime) / 1000, 0.05);
                lastTime  = now;
                clock    += dt;

                // Lerp scroll and mouse
                scrollCurrent.t = lerp(scrollCurrent.t, scrollTarget.t, 0.046);
                if (!isMobile) {
                    mouse.cx = lerp(mouse.cx, mouse.tx, 0.072);
                    mouse.cy = lerp(mouse.cy, mouse.ty, 0.072);
                }

                const st     = interpState(states, scrollCurrent.t);
                const aspect = camera.aspect;
                const halfW  = halfH * aspect;

                const bob = reducedMotion ? 0 : Math.sin(clock * 0.52) * 0.055;

                const targetX = st.ndcX * halfW + (reducedMotion ? 0 : mouse.cx * 0.15);
                const targetY = st.ndcY * halfH + (reducedMotion ? 0 : -mouse.cy * 0.10) + bob;

                // Entry: globe rises from below the fold, overshoots, then settles into place
                let entryOffsetY = -ENTRY_DROP;
                if (revealTimeRef.current !== null) {
                    const elapsed = (now - revealTimeRef.current) / 1000;
                    const raw = clamp(elapsed / ENTRY_DURATION, 0, 1);
                    entryOffsetY = -ENTRY_DROP * (1 - easeOutBack(raw));
                }

                orbGroup.position.x = lerp(orbGroup.position.x, targetX, 0.038);
                orbGroup.position.y = lerp(orbGroup.position.y, targetY, 0.038) + entryOffsetY;
                orbGroup.scale.setScalar(lerp(orbGroup.scale.x, st.scale, 0.046));

                // Keep core point light at orbGroup world position
                orbGroup.getWorldPosition(coreLight.position);

                // Idle earth rotation
                if (!reducedMotion && earthPivot) {
                    earthPivot.rotation.y += 0.0018;
                }

                // Subtle glow pulse
                glowMesh.scale.setScalar(1.0 + 0.055 * Math.sin(clock * 0.65));

                // ── Update colours (no allocations) ──────────────────────────
                coreMat.emissive.setRGB(st.lr, st.lg, st.lb);
                coreMat.color.setRGB(st.lr, st.lg, st.lb);
                glowMat.emissive.setRGB(st.lr, st.lg, st.lb);
                glowMat.color.setRGB(st.lr, st.lg, st.lb);
                coreLight.color.setRGB(st.lr, st.lg, st.lb);

                // Sun shifts subtly towards the scroll colour
                sunLight.color.setRGB(
                    lerp(1.0, st.lr, 0.28),
                    lerp(0.94, st.lg, 0.28),
                    lerp(0.82, st.lb, 0.28),
                );

                particleMat.color.setRGB(
                    lerp(st.lr, 1.0, 0.30),
                    lerp(st.lg, 1.0, 0.30),
                    lerp(st.lb, 1.0, 0.30),
                );

                // ── Update particle positions (tilted 3-D orbits) ─────────────
                const posArr = pGeo.attributes.position.array as Float32Array;
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    if (!reducedMotion) pAngles[i] += pSpeeds[i] * dt;
                    const angle = pAngles[i];
                    const r     = pRadii[i];
                    const tilt  = pTilts[i];
                    const yaw   = pYaws[i];
                    const lx    = r * Math.cos(angle);
                    const lz    = r * Math.sin(angle);
                    const ty    = -lz * Math.sin(tilt);
                    const tz    =  lz * Math.cos(tilt);
                    posArr[i * 3 + 0] = lx * Math.cos(yaw) + tz * Math.sin(yaw);
                    posArr[i * 3 + 1] = ty;
                    posArr[i * 3 + 2] = -lx * Math.sin(yaw) + tz * Math.cos(yaw);
                }
                pGeo.attributes.position.needsUpdate = true;

                renderer.render(scene, camera);
            };

            tickFn();

            (canvasRef as any)._cleanup = () => {
                window.removeEventListener("resize", onResize);
                cancelAnimationFrame(rafId);
                coreGeo.dispose();
                coreMat.dispose();
                glowGeo.dispose();
                glowMat.dispose();
                pGeo.dispose();
                particleMat.dispose();
                renderer.dispose();
            };
        })();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll",    onScroll);
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("visibilitychange", onVisibility);
            (canvasRef as any)._cleanup?.();
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
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

export default PortfolioScene;
