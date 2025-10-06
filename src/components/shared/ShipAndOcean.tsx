/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

interface ShipAndOceanProps {
    storm: boolean;
    isRedirecting: boolean;
    onLoad?: () => void;
}

const models = {
    ship: "../../assets/models/ship.gltf",
    tree: "../../assets/models/tree.gltf",
    chest: "../../assets/models/chest.gltf",
    wizard: "../../assets/models/wizard.gltf",
};

const ShipAndOcean = ({ storm, onLoad, isRedirecting }: ShipAndOceanProps) => {
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
        let mixer: any = null;
        let wizard: any = null;
        const wizardAnimations: any = {};
        let currentAnimation: any = null;
        let resizeObserver: ResizeObserver | null = null;
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
                CylinderGeometry,
            } = three;

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

            // === Camera ===
            const isMobile = window.innerWidth < 768;
            const isTablet =
                window.innerWidth >= 768 && window.innerWidth < 1024;
            const cameraDistance = isMobile ? 9 : isTablet ? 7 : 6;

            camera = new PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.set(0, 3, cameraDistance);

            // === Lights ===
            const ambient = new AmbientLight(0xffffff, 0.7);
            scene.add(ambient);

            const dir = new DirectionalLight(0xffffff, 1.0);
            dir.position.set(5, 10, 7);
            scene.add(dir);

            // === Ocean ===
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
            ocean.userData.original = new Float32Array(
                ocean.geometry.attributes.position.array
            );
            scene.add(ocean);

            // === Draco Loader ===
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(
                "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
            );

            // === Island ===
            const islandGeometry = new CylinderGeometry(1.2, 3.5, 0.4, 32);
            const islandMaterial = new MeshStandardMaterial({
                color: 0xdeb887,
            });
            const island = new Mesh(islandGeometry, islandMaterial);

            if (isMobile) {
                island.position.set(-2, -0.5, -9);
            } else {
                island.position.set(-8, -0.5, -9);
            }
            scene.add(island);

            // === Tree ===
            const treeLoader = new GLTFLoader();
            const treeUrl = new URL(models.tree, import.meta.url).href;
            try {
                const treeModel = await treeLoader.loadAsync(treeUrl);
                const tree1 = treeModel.scene.clone();
                tree1.scale.set(0.5, 0.5, 0.5);
                tree1.position.set(-1.5, 0.3, -0.3);
                island.add(tree1);
            } catch (e) {
                console.warn("Tree model not found:", e);
            }

            // === Chest / Ruins ===
            const ruinsLoader = new GLTFLoader();
            ruinsLoader.setDRACOLoader(dracoLoader);
            const ruinsUrl = new URL(models.chest, import.meta.url).href;
            try {
                const ruinsModel = await ruinsLoader.loadAsync(ruinsUrl);
                const ruins = ruinsModel.scene.clone();
                ruins.position.set(0, 0.2, 0);
                ruins.scale.set(1, 1, 1);
                island.add(ruins);
            } catch (e) {
                console.warn("Ruins model not found:", e);
            }

            // === Wizard ===
            const wizardLoader = new GLTFLoader();
            const wizardUrl = new URL(models.wizard, import.meta.url).href;
            const playWizardAnimation = (name: string) => {
                if (!mixer) return;
                if (currentAnimation) currentAnimation.stop();
                const action = wizardAnimations[name];
                if (action) {
                    action.reset().play();
                    currentAnimation = action;
                }
            };

            try {
                const wizardModel = await wizardLoader.loadAsync(wizardUrl);
                wizard = wizardModel.scene;
                wizard.scale.set(1, 1, 1);
                wizard.position.set(2.4, 0.3, 1.3);
                wizard.rotation.y = Math.PI / 9;
                island.add(wizard);

                mixer = new AnimationMixer(wizard);
                if (wizardModel.animations.length > 0) {
                    wizardModel.animations.forEach((clip: any) => {
                        wizardAnimations[clip.name] = mixer.clipAction(clip);
                    });
                    playWizardAnimation(
                        isRedirectingRef.current ? "PortalOpen" : "Waiting"
                    );
                }
            } catch (e) {
                console.warn("Wizard model not found:", e);
            }

            // === Ship ===
            const loader = new GLTFLoader();
            loader.setDRACOLoader(dracoLoader);
            const shipUrl = new URL(models.ship, import.meta.url).href;
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
                console.error("Failed to load ship model:", e);
                const fallback = new Mesh(
                    new BoxGeometry(1, 1, 3),
                    new MeshStandardMaterial({ color: 0xff0000 })
                );
                fallback.position.set(1.2, 0.6, 0);
                model = fallback;
                scene.add(fallback);
                handleLoadComplete();
            }

            // === Resize Handling (includes camera responsiveness) ===
            const handleResize = () => {
                if (!containerRef.current) return;
                const { clientWidth: w, clientHeight: h } =
                    containerRef.current;
                renderer.setSize(w, h);
                renderer.setPixelRatio(
                    Math.min(window.devicePixelRatio || 1, 2)
                );
                camera.aspect = w / h;

                const isMobile = window.innerWidth < 768;
                const isTablet =
                    window.innerWidth >= 768 && window.innerWidth < 1024;
                const newDistance = isMobile ? 9 : isTablet ? 7 : 6;
                camera.position.set(0, 3, newDistance);

                camera.updateProjectionMatrix();
            };

            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(containerRef.current);
            window.addEventListener("resize", handleResize);

            // === Animation Loop ===
            let lastTime = 0;
            const animate = (currentTime: number) => {
                const deltaTime = Math.min(
                    (currentTime - lastTime) / 1000,
                    0.1
                );
                lastTime = currentTime;
                time += deltaTime;

                const isStorm = stormRef.current;
                const waveAmplitude = isStorm ? 1.2 : 0.4;
                const waveSpeed = isStorm ? 2.0 : 1.5;
                const waveFrequency = isStorm ? 0.8 : 0.5;

                mixer?.update(deltaTime);

                if (wizard && mixer) {
                    const currentName = currentAnimation?.getClip?.()?.name;
                    if (
                        isRedirectingRef.current &&
                        currentName !== "PortalOpen"
                    )
                        playWizardAnimation("PortalOpen");
                    else if (
                        !isRedirectingRef.current &&
                        currentName !== "Waiting"
                    )
                        playWizardAnimation("Waiting");
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
                if (animationId) cancelAnimationFrame(animationId);
                window.removeEventListener("resize", handleResize);
                resizeObserver?.disconnect();
                renderer?.dispose?.();
            };
        };

        init();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 -z-10 w-full h-full"
        >
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default ShipAndOcean;
