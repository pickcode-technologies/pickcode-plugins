import { observer } from "mobx-react-lite";
import State from "./state";
import { useEffect, useRef } from "react";

const Component = observer(({ state }: { state: State | undefined }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starCanvasRef = useRef(document.createElement("canvas"));
    const animationRef = useRef<number>(0);
    const angleRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const starCanvas = starCanvasRef.current;
        if (!canvas || !starCanvas) return;
        const ctx = canvas.getContext("2d");
        const starCtx = starCanvas.getContext("2d");
        if (!ctx || !starCtx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        starCanvas.width = canvas.width;
        starCanvas.height = canvas.height;

        // Draw static star field once
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const brightness = Math.random() * 255;
            starCtx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
            starCtx.fillRect(x, y, 2, 2);
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(starCanvas, 0, 0);

            // Draw sun
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.shadowColor = "yellow";
            ctx.shadowBlur = 30;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw planets
            state?.planets.forEach((planet) => {
                const angle = angleRef.current;
                const x =
                    canvas.width / 2 +
                    planet.radius * Math.cos((angle * planet.speed) / 10);
                const y =
                    canvas.height / 2 +
                    planet.radius * Math.sin((angle * planet.speed) / 10);

                // Orbit path
                ctx.beginPath();
                ctx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    planet.radius,
                    0,
                    Math.PI * 2
                );
                ctx.strokeStyle = "gray";
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Planet
                ctx.beginPath();
                ctx.arc(x, y, planet.size / 10, 0, Math.PI * 2);
                ctx.fillStyle = planet.color || "deepskyblue";
                ctx.fill();

                // Label
                ctx.fillStyle = "white";
                ctx.font = "14px sans-serif";
                ctx.fillText(planet.name, x - 15, y - 20);
            });

            angleRef.current += 0.01;
            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationRef.current);
    }, [state?.planets]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>
    );
});

export default Component;
