/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

interface ShipProps {
    presentationIsOpen: boolean;
}

const Ship = ({ presentationIsOpen }: ShipProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let renderer: any = null;
        let scene: any = null;
        let camera: any = null;
        let animationId: number | null = null;
        let model: any = null;
        let ocean: any = null;
        let time = 0;

        const init = async () => {
            const [three, loaders, draco] = await Promise.all([
                import("three"),
                import("three/examples/jsm/loaders/GLTFLoader.js"),
                import("three/examples/jsm/loaders/DRACOLoader.js"),
            ]);

            const {
                WebGLRenderer,
                Scene,
                PerspectiveCamera,
                ACESFilmicToneMapping,
                sRGBEncoding,
                AmbientLight,
                DirectionalLight,
                PlaneGeometry,
                MeshPhongMaterial,
                Mesh,
                BoxGeometry,
                MeshStandardMaterial,
            } = three;

            const { GLTFLoader } = loaders;
            const { DRACOLoader } = draco;

            if (!containerRef.current || !canvasRef.current) return;

            const container = containerRef.current;
            const width = container.clientWidth;
            const height = container.clientHeight;

            renderer = new WebGLRenderer({
                canvas: canvasRef.current,
                antialias: true,
                alpha: true,
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.outputEncoding = sRGBEncoding;
            renderer.toneMapping = ACESFilmicToneMapping;
            renderer.setClearColor(0x000000, 0);

            scene = new Scene();
            scene.background = null;

            camera = new PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.set(0, 3, 6);

            // Lights
            const ambient = new AmbientLight(0xffffff, 0.7);
            scene.add(ambient);

            const dir = new DirectionalLight(0xffffff, 1.0);
            dir.position.set(5, 10, 7);
            scene.add(dir);

            // Create ocean (keep unchanged)
            const oceanGeometry = new PlaneGeometry(100, 15, 100, 100);
            const oceanMaterial = new MeshPhongMaterial({
                color: 0x1e90ff,
                transparent: true,
                opacity: 0.9,
                shininess: 80,
                specular: 0x222222,
                side: three.DoubleSide,
            });

            ocean = new Mesh(oceanGeometry, oceanMaterial);
            ocean.rotation.x = -Math.PI / 2;
            ocean.position.y = -0.5;

            const pos = ocean.geometry.attributes.position;
            ocean.userData.original = new Float32Array(pos.array);
            scene.add(ocean);

            const shipGroup = new three.Group();
            scene.add(shipGroup);

            // LOAD SHIP
            const loader = new GLTFLoader();
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(
                "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
            );
            loader.setDRACOLoader(dracoLoader);
            const shipUrl = new URL(
                "../../../assets/models/ship.gltf",
                import.meta.url
            ).href;

            try {
                const gltf = await loader.loadAsync(shipUrl);
                model = gltf.scene;
                model.position.set(-3.0, 0.1, 0);
                model.scale.set(0.5, 0.5, 0.5);
                scene.add(model);
            } catch (e) {
                console.error("Failed to load GLTF:", e);

                // fallback ship — NOW uses dynamic import reference
                const geometry = new BoxGeometry(1, 1, 3);
                const material = new MeshStandardMaterial({
                    color: 0xff0000,
                    metalness: 0.5,
                    roughness: 0.5,
                });
                model = new Mesh(geometry, material);
                model.position.set(1.2, 0.6, 0); // SAME position as original
                scene.add(model);

                console.log("Fallback ship added");
            }

            const onResize = () => {
                if (!containerRef.current) return;
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;
                renderer!.setSize(w, h);
                camera!.aspect = w / h;
                camera!.updateProjectionMatrix();
            };
            window.addEventListener("resize", onResize);

            const tick = () => {
                time += 0.02;

                // Storm settings
                const isStorm = presentationIsOpen;
                const waveAmplitude = isStorm ? 1.2 : 0.4; // increase wave height in storm
                const waveSpeed = isStorm ? 2.0 : 1.5; // faster waves in storm
                const waveFrequency = isStorm ? 0.8 : 0.5;

                // Animate ocean
                if (ocean) {
                    const pos = ocean.geometry.attributes.position;
                    const orig = ocean.userData.original;

                    for (let i = 0; i < pos.count; i++) {
                        const x = orig[i * 3];
                        const z = orig[i * 3 + 2];

                        const wave =
                            Math.sin(x * waveFrequency + time * waveSpeed) *
                                waveAmplitude +
                            Math.sin(z * 0.3 + time * waveSpeed * 1.5) *
                                waveAmplitude *
                                0.75;

                        pos.setY(i, orig[i * 3 + 1] + wave);
                    }

                    pos.needsUpdate = true;
                    ocean.geometry.computeVertexNormals();

                    // Change ocean color during storm
                    (ocean.material as any).color.setHex(
                        isStorm ? 0x001f3f : 0x1e90ff
                    );
                    (ocean.material as any).shininess = isStorm ? 120 : 80;
                    (ocean.material as any).opacity = isStorm ? 0.95 : 0.9;
                }

                if (model) {
                    if (presentationIsOpen) model.rotation.y += 0.005;

                    // Oscillate ship along X-axis
                    const amplitude = 1.5;
                    const speed = 0.5;
                    model.position.x = Math.sin(time * speed) * amplitude;

                    const shipZ = model.position.z;

                    // Wave height at ship's position
                    const waveAtShip =
                        Math.sin(
                            model.position.x * 0.3 + shipZ * 0.1 + time * 1.2
                        ) *
                            waveAmplitude *
                            0.1 +
                        Math.sin(
                            model.position.x * 0.5 - shipZ * 0.3 + time * 0.8
                        ) *
                            waveAmplitude *
                            0.08 +
                        Math.sin(
                            (model.position.x + shipZ) * 0.1 + time * 0.3
                        ) *
                            waveAmplitude *
                            0.15;

                    model.position.y = 0.15 + waveAtShip * 0.3;

                    const waveDerivativeX =
                        Math.cos(
                            model.position.x * 0.3 + shipZ * 0.1 + time * 1.2
                        ) *
                            waveAmplitude *
                            0.3 *
                            0.1 +
                        Math.cos(
                            model.position.x * 0.5 - shipZ * 0.3 + time * 0.8
                        ) *
                            waveAmplitude *
                            0.5 *
                            0.08 +
                        Math.cos(
                            (model.position.x + shipZ) * 0.1 + time * 0.3
                        ) *
                            waveAmplitude *
                            0.1 *
                            0.15;

                    const waveDerivativeZ =
                        Math.cos(
                            model.position.x * 0.3 + shipZ * 0.1 + time * 1.2
                        ) *
                            waveAmplitude *
                            0.1 *
                            0.1 +
                        Math.cos(
                            model.position.x * 0.5 - shipZ * 0.3 + time * 0.8
                        ) *
                            waveAmplitude *
                            -0.3 *
                            0.08 +
                        Math.cos(
                            (model.position.x + shipZ) * 0.1 + time * 0.3
                        ) *
                            waveAmplitude *
                            0.1 *
                            0.15;

                    model.rotation.z = waveDerivativeX * 0.5;
                    model.rotation.x = waveDerivativeZ * 0.3;
                }

                renderer!.render(scene!, camera!);
                animationId = requestAnimationFrame(tick);
            };

            tick();

            return () => {
                window.removeEventListener("resize", onResize);
            };
        };

        const cleanup = () => {
            if (animationId) cancelAnimationFrame(animationId);
            renderer?.dispose?.();
        };

        init();
        return cleanup;
    }, [presentationIsOpen]);

    return (
        <div
            ref={containerRef}
            className="pointer-events-none absolute inset-0 -z-10"
        >
            <canvas ref={canvasRef} className="h-full w-full" />
        </div>
    );
};

export default Ship;
