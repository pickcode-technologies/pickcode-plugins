import { observer } from "mobx-react-lite";
import State, { Particle } from "./state";
import { useEffect, useRef } from "react";

type ParticleState = Particle & {
    x: number;
    y: number;
    vx: number;
    vy: number;
};

const Component = observer(({ state }: { state: State | undefined }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef(0);
    const particleStatesRef = useRef<ParticleState[]>([]);
    const particles = state?.particles || [];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const width = canvas.width;
        const height = canvas.height;

        const avgTemperature =
            particles.reduce((sum, p) => sum + p.temperature, 0) /
            particles.length;

        particleStatesRef.current = particles.map((p) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.sqrt(p.temperature) * 0.5;
            return {
                ...p,
                x: Math.random() * width,
                y: Math.random() * height,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
            };
        });

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            ctx.beginPath();
            ctx.rect(0, 0, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.stroke();

            particleStatesRef.current.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                // Adjust speed toward equilibrium
                const currentSpeed = Math.sqrt(p.vx ** 2 + p.vy ** 2);
                const targetSpeed = Math.sqrt(avgTemperature) * 0.5;
                const smoothedSpeed =
                    currentSpeed + (targetSpeed - currentSpeed) * 0.001;

                // Normalize velocity to new speed
                const angle = Math.atan2(p.vy, p.vx);
                p.vx = Math.cos(angle) * smoothedSpeed;
                p.vy = Math.sin(angle) * smoothedSpeed;

                // Bounce on walls
                if (p.x <= 0 || p.x >= width) p.vx *= -1;
                if (p.y <= 0 || p.y >= height) p.vy *= -1;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationRef.current);
    }, [particles.length]);

    return (
        <div className="w-full h-full flex flex-col justify-center p-4 bg-black">
            <canvas
                ref={canvasRef}
                style={{ display: "block" }}
                className="w-full h-full"
            />
        </div>
    );
});

export default Component;
