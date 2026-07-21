/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

const statueUrl = new URL(
    "../../../assets/models/statue.gltf",
    import.meta.url
).href;

const StatueMouse = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        let cancelled = false;
        let animationId: number;
        let renderer: any;

        const onMouseMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            targetRef.current.y = nx * 2.25;
            targetRef.current.x = ny * 1.25;
        };
        window.addEventListener("mousemove", onMouseMove);

        (async () => {
            const [three, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
                import("three"),
                import("three/examples/jsm/loaders/GLTFLoader.js"),
                import("three/examples/jsm/loaders/DRACOLoader.js"),
            ]);

            if (cancelled) return;

            const container = containerRef.current;
            if (!container) return;

            const w = container.clientWidth;
            const h = container.clientHeight;

            const scene = new three.Scene();
            const camera = new three.PerspectiveCamera(40, w / h, 0.01, 1000);
            camera.position.set(0, 0, 11);
            camera.lookAt(0, 0, 0);

            renderer = new three.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.toneMapping = three.ACESFilmicToneMapping;
            (renderer as any).toneMappingExposure = 1.2;
            renderer.setClearColor(0x000000, 0);
            container.appendChild(renderer.domElement);

            scene.add(new three.AmbientLight(0xffffff, 0.9));
            const sun = new three.DirectionalLight(0xfff0d0, 2.5);
            sun.position.set(5, 10, 5);
            scene.add(sun);
            const fill = new three.DirectionalLight(0xc9a463, 0.6);
            fill.position.set(-5, 2, -3);
            scene.add(fill);

            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(
                "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
            );
            const loader = new GLTFLoader();
            loader.setDRACOLoader(dracoLoader);

            let pivot: any = null;

            try {
                const gltf = await loader.loadAsync(statueUrl);
                if (cancelled) return;
                const model = gltf.scene;
                model.scale.set(4.5, 4.5, 4.5);
                const box = new three.Box3().setFromObject(model);
                const center = new three.Vector3();
                box.getCenter(center);
                model.position.sub(center);
                pivot = new three.Group();
                pivot.add(model);
                scene.add(pivot);
            } catch (e) {
                console.error("Failed to load statue:", e);
            }

            const onResize = () => {
                if (!containerRef.current) return;
                const nw = containerRef.current.clientWidth;
                const nh = containerRef.current.clientHeight;
                renderer.setSize(nw, nh);
                camera.aspect = nw / nh;
                camera.updateProjectionMatrix();
            };
            window.addEventListener("resize", onResize);

            const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

            const tick = () => {
                if (cancelled) return;
                animationId = requestAnimationFrame(tick);
                if (pivot) {
                    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.06);
                    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.06);
                    pivot.rotation.x = currentRef.current.x;
                    pivot.rotation.y = currentRef.current.y;
                }
                renderer.render(scene, camera);
            };
            tick();

            // store resize cleanup on ref to call from main cleanup
            (containerRef as any)._resizeCleanup = () =>
                window.removeEventListener("resize", onResize);
        })();

        return () => {
            cancelled = true;
            window.removeEventListener("mousemove", onMouseMove);
            (containerRef as any)._resizeCleanup?.();
            cancelAnimationFrame(animationId);
            if (renderer) {
                renderer.dispose();
                renderer.domElement?.parentNode?.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default StatueMouse;
