import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import State from "./state";
import { Line, ShiftCommand, Helper, FunctionCall } from "./messages";

const Component = observer(({ state }: { state: State | undefined }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Helper function to calculate intersection point of two lines
    const calculateIntersection = (
        line1: Line,
        line2: Line
    ): { x: number; y: number } | null => {
        // Line 1: (x1, y1) to (x2, y2)
        const x1 = line1.start.x;
        const y1 = line1.start.y;
        const x2 = line1.end.x;
        const y2 = line1.end.y;

        // Line 2: (x3, y3) to (x4, y4)
        const x3 = line2.start.x;
        const y3 = line2.start.y;
        const x4 = line2.end.x;
        const y4 = line2.end.y;

        // Calculate slopes
        const m1 = (y2 - y1) / (x2 - x1);
        const m2 = (y4 - y3) / (x4 - x3);

        // If lines are parallel, no intersection
        if (Math.abs(m1 - m2) < 0.001) return null;

        // Calculate intersection point
        const x = (m1 * x1 - m2 * x3 + y3 - y1) / (m1 - m2);
        const y = m1 * (x - x1) + y1;

        return { x, y };
    };

    const drawlines = () => {
        console.log("drawlines");
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const draw = () => {
            console.log("draw", state?.lines);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.translate(canvas.width / 2, canvas.height / 2);

            const margin = 50;
            const xScalingFactor = canvas.width / 2 - margin;
            const yScalingFactor = canvas.height / 2 - margin;
            ctx.scale(xScalingFactor, -yScalingFactor);

            ctx.lineWidth = 0.01;

            const drawText = (
                x: number,
                y: number,
                text: string,
                color: string
            ) => {
                ctx.save();
                ctx.translate(x, y); //translates origin to (0.8, 0.8)
                ctx.scale(1 / xScalingFactor, -1 / yScalingFactor); //scale it back to original scale
                ctx.fillStyle = color;
                ctx.font = `16px Comic Sans MS`;
                ctx.fillText(text, 0, 0);
                ctx.restore();
            };

            //draw axes for the supply and demand curves

            //x axis
            ctx.strokeStyle = "black";
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-1, 1);
            ctx.lineTo(-1, -1);
            ctx.stroke();

            //y axis
            ctx.beginPath();
            ctx.moveTo(-1, -1);
            ctx.lineTo(1, -1);
            ctx.stroke();

            //draw default supply and demand curves that stay in place
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(-0.8, 0.8);
            ctx.lineTo(0.8, -0.8);
            ctx.stroke();

            ctx.strokeStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(-0.8, -0.8);
            ctx.lineTo(0.8, 0.8);
            ctx.stroke();

            //text for supply and demand
            drawText(-0.9, 0.85, "Demand", "red");
            drawText(0.85, 0.85, "Supply", "blue");

            // Draw lines (looks at state; state says state?; this means that if state is undefined, then don't do anything. If it is defined, we look at its line value)
            // => defines a function; input is thing on the left of arrow. Output is thing on the right of arrow.
            //forEach is basically calling a forEach loop but saves space
            state?.lines.forEach((line, lineIndex) => {
                console.log("line drawing here!!");

                if (lineIndex === 0) {
                    ctx.strokeStyle = "blue";
                } else {
                    ctx.strokeStyle = "red";
                }
                ctx.setLineDash([0.03, 0.03]);
                ctx.beginPath();
                ctx.moveTo(line.start.x, line.start.y);
                ctx.lineTo(line.end.x, line.end.y);
                ctx.stroke();
            });

            // Draw helper lines if requested
            if (
                state?.helper &&
                (state?.lines.length >= 2 || state?.lines.length == 0)
            ) {
                let equilibrium;

                if (state?.lines.length == 0) {
                    //default case
                    console.log("No lines exist, so equilibrium is 0,0");
                    equilibrium = { x: 0, y: 0 };
                } else {
                    // Calculate equilibrium point
                    equilibrium = calculateIntersection(
                        state.lines[0],
                        state.lines[1]
                    );
                }

                if (equilibrium) {
                    console.log("Equilibrium point:", equilibrium);

                    // Draw helper lines from axes to equilibrium point
                    ctx.strokeStyle = "green";
                    ctx.lineWidth = 0.02;
                    ctx.setLineDash([0.05, 0.05]);

                    // Vertical line from x-axis to equilibrium point
                    ctx.beginPath();
                    ctx.moveTo(equilibrium.x, -1); // Start at x-axis
                    ctx.lineTo(equilibrium.x, equilibrium.y); // End at equilibrium
                    ctx.stroke();

                    // Horizontal line from y-axis to equilibrium point
                    ctx.beginPath();
                    ctx.moveTo(-1, equilibrium.y); // Start at y-axis
                    ctx.lineTo(equilibrium.x, equilibrium.y); // End at equilibrium
                    ctx.stroke();

                    // Draw equilibrium point
                    ctx.fillStyle = "green";
                    ctx.beginPath();
                    ctx.arc(equilibrium.x, equilibrium.y, 0.05, 0, Math.PI * 2);
                    ctx.fill();

                    // Reset line style
                    ctx.setLineDash([]);

                    // Draw equilibrium labels
                    drawText(
                        equilibrium.x + 0.1,
                        equilibrium.y + 0.1,
                        `E(${equilibrium.x.toFixed(2)}, ${equilibrium.y.toFixed(
                            2
                        )})`,
                        "green"
                    );
                }
            }

            // Reset canvas to original coordinate system for axis labels
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Draw axis labels outside the margins
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";

            // Price label (y-axis) - positioned to the left of the graph
            ctx.fillText("Price", 5, canvas.height / 2);

            // Quantity label (x-axis) - positioned below the graph
            ctx.fillText("Quantity", canvas.width / 2, canvas.height - 20);
        };

        draw();
    };

    //useEffect --> {function, array of dependencies --> [state?.lines]}
    useEffect(() => {
        console.log("state.lines changed", state?.lines);

        drawlines();
    }, [state?.lines, state?.helper]); // Watch both lines and helper

    //we only change (or call this function) when the state.lines changes

    return (
        <div className="w-full h-full flex items-center justify-center bg-white p-4">
            <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>
    );
});

export default Component;
