/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

interface ShipProps {
    storm: boolean;
    isRedirecting: boolean;
    onLoad?: () => void;
}

const Ship = ({ storm, onLoad, isRedirecting }: ShipProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const hasLoadedRef = useRef(false);
    const stormRef = useRef(storm);
    const isRedirectingRef = useRef(isRedirecting);

    useEffect(() => {
        stormRef.current = storm;
    }, [storm]);

    useEffect(() => {
        isRedirectingRef.current = isRedirecting;
    }, [isRedirecting]);

    useEffect(() => {
        let renderer: any = null;
        let scene: any = null;
        let camera: any = null;
        let animationId: number | null = null;
        let model: any = null;
        let ocean: any = null;
        let time = 0;
        let mixer: any = null;
        let wizard: any = null;
        const wizardAnimations: any = {};
        let currentAnimation: any = null;

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
                CylinderGeometry,
            } = three;

            // Get AnimationMixer from three - it might be a named export
            const AnimationMixer = three.AnimationMixer;

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
            camera = new PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.set(0, 3, 6);

            // Lights
            const ambient = new AmbientLight(0xffffff, 0.7);
            scene.add(ambient);

            const dir = new DirectionalLight(0xffffff, 1.0);
            dir.position.set(5, 10, 7);
            scene.add(dir);

            // Ocean
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

            // === 📦 DRACO Loader ===
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(
                "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
            );

            // === 🏝️ Ilha simples ===
            const islandGeometry = new CylinderGeometry(1.2, 3.5, 0.4, 32);
            const islandMaterial = new MeshStandardMaterial({
                color: 0xdeb887,
            });
            const island = new Mesh(islandGeometry, islandMaterial);
            island.position.set(-8, -0.5, -9);
            scene.add(island);

            // === 🌳 Árvores ===
            const treeLoader = new GLTFLoader();
            const treeUrl = new URL(
                "../../../assets/models/tree.gltf",
                import.meta.url
            ).href;

            try {
                const treeModel = await treeLoader.loadAsync(treeUrl);
                const tree1 = treeModel.scene.clone();

                tree1.scale.set(0.5, 0.5, 0.5);

                tree1.position.set(-9.4, -0.3, -9.3);

                scene.add(tree1);
            } catch (e) {
                console.warn("Tree model not found:", e);
            }

            // === 🗿 Ruins ===
            const ruinsLoader = new GLTFLoader();
            ruinsLoader.setDRACOLoader(dracoLoader);
            const ruinsUrl = new URL(
                "../../../assets/models/chest.gltf",
                import.meta.url
            ).href;

            try {
                const ruinsModel = await ruinsLoader.loadAsync(ruinsUrl);
                const ruins = ruinsModel.scene.clone();
                ruins.position.set(0, 0, 0);
                ruins.rotation.set(0, 0, 0);
                ruins.scale.set(1, 1, 1);
                ruins.position.set(0, 0.2, 0);
                island.add(ruins);
                console.log("Ruins added", ruins);
            } catch (e) {
                console.warn("Ruins model not found:", e);
            }

            // === 🧙‍♂️ Mago ===
            const wizardLoader = new GLTFLoader();
            const wizardUrl = new URL(
                "../../../assets/models/wizard.gltf",
                import.meta.url
            ).href;

            // Function to play wizard animations
            const playWizardAnimation = (animationName: string) => {
                if (!mixer) {
                    console.warn("No animation mixer available");
                    return;
                }

                if (currentAnimation) {
                    currentAnimation.stop();
                    console.log(`Stopped previous animation: ${currentAnimation.getClip?.()?.name}`);
                }

                const action = wizardAnimations[animationName];
                if (action) {
                    action.reset();
                    action.play();
                    currentAnimation = action;
                    console.log(`Playing wizard animation: ${animationName}`);
                } else {
                    console.warn(`Animation "${animationName}" not found. Available animations:`, Object.keys(wizardAnimations));
                }
            };


            try {
                const wizardModel = await wizardLoader.loadAsync(wizardUrl);
                wizard = wizardModel.scene;
                wizard.scale.set(1, 1, 1);
                wizard.position.set(-5, -0.3, -9);
                wizard.rotation.y = Math.PI / 9;
                scene.add(wizard);

                console.log("Wizard model loaded, animations:", wizardModel.animations);

                // Set up animation mixer for wizard
                if (AnimationMixer) {
                    mixer = new AnimationMixer(wizard);
                    console.log("Animation mixer created");

                    // Store all animations
                    if (wizardModel.animations && wizardModel.animations.length > 0) {
                        wizardModel.animations.forEach((clip: any) => {
                            const action = mixer.clipAction(clip);
                            wizardAnimations[clip.name] = action;
                            console.log(`Loaded animation: ${clip.name}`, action);
                        });

                        // Set initial animation based on redirecting state
                        if (isRedirectingRef.current) {
                            playWizardAnimation("PortalOpen");
                        } else {
                            playWizardAnimation("Waiting");
                        }
                    } else {
                        console.warn("No animations found in wizard model");
                    }
                } else {
                    console.error("AnimationMixer not available in Three.js");
                }

            } catch (e) {
                console.warn("Wizard model not found:", e);
            }

            // === 🚢 Navio ===
            const loader = new GLTFLoader();
            loader.setDRACOLoader(dracoLoader);
            const shipUrl = new URL(
                "../../../assets/models/ship.gltf",
                import.meta.url
            ).href;

            const handleLoadComplete = () => {
                if (!hasLoadedRef.current && onLoad) {
                    hasLoadedRef.current = true;
                    onLoad();
                }
            };

            try {
                const gltf = await loader.loadAsync(shipUrl);
                model = gltf.scene;
                model.position.set(-3.0, 0.1, 0);
                model.scale.set(0.5, 0.5, 0.5);
                scene.add(model);
                handleLoadComplete();
            } catch (e) {
                console.error("Failed to load GLTF:", e);
                const geometry = new BoxGeometry(1, 1, 3);
                const material = new MeshStandardMaterial({
                    color: 0xff0000,
                    metalness: 0.5,
                    roughness: 0.5,
                });
                model = new Mesh(geometry, material);
                model.position.set(1.2, 0.6, 0);
                scene.add(model);
                handleLoadComplete();
            }

            // === Resize e animação ===
            const onResize = () => {
                if (!containerRef.current) return;
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;
                renderer!.setSize(w, h);
                camera!.aspect = w / h;
                camera!.updateProjectionMatrix();
            };
            window.addEventListener("resize", onResize);

            let lastTime = 0;
            const animate = (currentTime: number) => {
                const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
                lastTime = currentTime;
                time += deltaTime;
                
                const isStorm = stormRef.current;
                const waveAmplitude = isStorm ? 1.2 : 0.4;
                const waveSpeed = isStorm ? 2.0 : 1.5;
                const waveFrequency = isStorm ? 0.8 : 0.5;

                // Update animation mixer
                if (mixer) {
                    mixer.update(deltaTime);
                }

                // Update wizard animation based on redirecting state
                if (wizard && mixer) {
                    const currentAnimationName = currentAnimation?.getClip?.()?.name;
                    if (isRedirectingRef.current && currentAnimationName !== "PortalOpen") {
                        console.log("Switching to PortalOpen animation");
                        playWizardAnimation("PortalOpen");
                    } else if (!isRedirectingRef.current && currentAnimationName !== "Waiting") {
                        console.log("Switching to Waiting animation");
                        playWizardAnimation("Waiting");
                    }
                }

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
                    (ocean.material as any).color.setHex(
                        isStorm ? 0x001f3f : 0x1e90ff
                    );
                    (ocean.material as any).shininess = isStorm ? 120 : 80;
                    (ocean.material as any).opacity = isStorm ? 0.95 : 0.9;
                }

                if (model) {
                    if (isStorm) model.rotation.y += 0.005;
                    const amplitude = 1.5;
                    const speed = 0.5;
                    model.position.x = Math.sin(time * speed) * amplitude;
                    const shipZ = model.position.z;
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
                            0.08;
                    model.position.y = 0.15 + waveAtShip * 0.3;
                    model.rotation.z = Math.cos(time * 0.5) * 0.05;
                    model.rotation.x = Math.sin(time * 0.4) * 0.03;
                }

                renderer.render(scene, camera);
                animationId = requestAnimationFrame(animate);
            };

            animationId = requestAnimationFrame(animate);

            return () => {
                window.removeEventListener("resize", onResize);
                if (animationId) cancelAnimationFrame(animationId);
                renderer?.dispose?.();
            };
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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