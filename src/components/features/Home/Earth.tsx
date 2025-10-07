/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

const earthUrl = new URL("../../../assets/models/earth.gltf", import.meta.url)
    .href;

const Earth = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let renderer: any = null;
        let scene: any = null;
        let camera: any = null;
        let animationId: number | null = null;
        let model: any = null;
        let pivot: any = null; // to center when rotate

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
                Group,
                Box3,
                Vector3,
                BoxGeometry,
                MeshStandardMaterial,
                Mesh,
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
            // slightly brighter overall exposure
            (renderer as any).toneMappingExposure = 1.3;
            renderer.setClearColor(0x000000, 0);
            // Avoid browser panning/zooming on touch
            (renderer.domElement as HTMLCanvasElement).style.touchAction =
                "none";

            scene = new Scene();
            scene.background = null;

            // Positioning to control the size in the main page
            camera = new PerspectiveCamera(40, width / height, 0.01, 1000);
            camera.position.set(0, 0, 4.5);
            camera.lookAt(0, 0, 0);

            // Main sunlight (sun direction)
            const sunLight = new DirectionalLight(0xfff0d0, 2);
            sunLight.position.set(10, 5, 5);
            sunLight.castShadow = true;
            scene.add(sunLight);

            // Enhanced lighting setup
            const ambient = new AmbientLight(0xffffffff, 0.8); // Blue ambient
            scene.add(ambient);

            // Load the earth model
            const loader = new GLTFLoader();
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(
                "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
            );
            loader.setDRACOLoader(dracoLoader);

            try {
                const gltf = await loader.loadAsync(earthUrl);
                model = gltf.scene;

                model.traverse((child: any) => {
                    if (child.isMesh && child.material.transparent) {
                        child.material.opacity = 0.3; // lower value → more transparent
                    }
                });

                // change scale
                const scale = 3;
                model.scale.set(scale, scale, scale);

                // Center model to rotate about its true center
                const box = new Box3().setFromObject(model);
                const center = new Vector3();
                box.getCenter(center);
                model.position.sub(center); // shift so origin is the center

                pivot = new Group();
                pivot.add(model);
                scene.add(pivot);

                // Call load complete after successful model load
            } catch (e) {
                console.error("Failed to load Earth GLTF:", e);

                // Fallback Earth - simple sphere
                const geometry = new BoxGeometry(1, 1, 1);
                const material = new MeshStandardMaterial({
                    color: 0x1e90ff,
                    metalness: 0.3,
                    roughness: 0.7,
                });
                model = new Mesh(geometry, material);

                pivot = new Group();
                pivot.add(model);
                scene.add(pivot);

                // Also call load complete for fallback
            }

            // Manual drag-to-rotate behavior (rotate model only)
            let isDragging = false;
            let lastX = 0;
            let lastY = 0;
            const rotationSpeed = 0.005;

            const onPointerDown = (event: PointerEvent) => {
                isDragging = true;
                lastX = event.clientX;
                lastY = event.clientY;
                (event.target as HTMLElement)?.setPointerCapture?.(
                    event.pointerId
                );
            };

            const onPointerMove = (event: PointerEvent) => {
                if (!isDragging || !pivot) return;
                const deltaX = event.clientX - lastX;
                const deltaY = event.clientY - lastY;
                lastX = event.clientX;
                lastY = event.clientY;

                // Horizontal drag rotates around Y (spin)
                pivot.rotation.y += deltaX * rotationSpeed;
                // Vertical drag rotates around X (tilt)
                pivot.rotation.x += deltaY * rotationSpeed;
                // Optional clamp to avoid flipping over the poles too much
                const maxTilt = Math.PI / 2;
                if (pivot.rotation.x > maxTilt) pivot.rotation.x = maxTilt;
                if (pivot.rotation.x < -maxTilt) pivot.rotation.x = -maxTilt;
            };

            const onPointerUp = (event: PointerEvent) => {
                isDragging = false;
                (event.target as HTMLElement)?.releasePointerCapture?.(
                    event.pointerId
                );
            };

            renderer.domElement.addEventListener("pointerdown", onPointerDown);
            renderer.domElement.addEventListener("pointermove", onPointerMove);
            renderer.domElement.addEventListener("pointerup", onPointerUp);
            renderer.domElement.addEventListener("pointerleave", onPointerUp);

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
                if (pivot && !isDragging) {
                    // Only auto-rotate when not dragging
                    pivot.rotation.y += 0.01;
                }
                renderer!.render(scene!, camera!);
                animationId = requestAnimationFrame(tick);
            };
            tick();

            return () => {
                window.removeEventListener("resize", onResize);
                renderer?.domElement?.removeEventListener(
                    "pointerdown",
                    onPointerDown
                );
                renderer?.domElement?.removeEventListener(
                    "pointermove",
                    onPointerMove
                );
                renderer?.domElement?.removeEventListener(
                    "pointerup",
                    onPointerUp
                );
                renderer?.domElement?.removeEventListener(
                    "pointerleave",
                    onPointerUp
                );
            };
        };

        const cleanup = () => {
            if (animationId) cancelAnimationFrame(animationId);
            renderer?.dispose?.();
        };

        init();
        return cleanup;
    }, []);

    return (
        <div ref={containerRef} className="h-full w-full relative">
            <canvas ref={canvasRef} className="h-full w-full block" />
        </div>
    );
};

export default Earth;
