import { action, observable } from "mobx";
import { Line, ShiftCommand, Helper, Price, Quantity } from "./messages";

export class State {
    @observable
    accessor lines: Line[] = [];

    @observable
    accessor helper: Helper | null = null;

    @observable
    accessor price: number = 0;

    @observable
    accessor quantity: number = 0;

    public init = () => {};

    // Helper function to calculate intersection point of two lines
    private calculateIntersection = (
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

    // Helper function to create base curves
    private createBaseCurves = () => {
        if (this.lines.length === 0) {
            // Create default supply curve (upward sloping)
            const supplyCurve: Line = {
                start: { x: -0.8, y: -0.8 },
                end: { x: 0.8, y: 0.8 },
            };

            // Create default demand curve (downward sloping)
            const demandCurve: Line = {
                start: { x: -0.8, y: 0.8 },
                end: { x: 0.8, y: -0.8 },
            };

            this.lines = [supplyCurve, demandCurve];
            console.log("Auto-created base curves:", this.lines);
        }
    };

    @action
    public onMessage = (
        message: Line | ShiftCommand | Helper | Price | Quantity | Function
    ) => {
        if ("start" in message && "end" in message) {
            // This is a Line
            console.log("Adding line:", message);
            this.lines.push(message as Line);
        } else if ("type" in message && message.type === "shift") {
            // This is a ShiftCommand
            const shift = message as ShiftCommand;
            console.log("Shift command:", shift, "Current lines:", this.lines);

            // Auto-create base curves if they don't exist
            this.createBaseCurves();

            if (this.lines[shift.lineIndex]) {
                console.log(
                    "Shifting line",
                    shift.lineIndex,
                    "by",
                    shift.amount
                );
                // Create a new array to trigger MobX reactivity
                const newLines = [...this.lines];
                newLines[shift.lineIndex] = {
                    start: {
                        x: this.lines[shift.lineIndex].start.x + shift.amount,
                        y: this.lines[shift.lineIndex].start.y,
                    },
                    end: {
                        x: this.lines[shift.lineIndex].end.x + shift.amount,
                        y: this.lines[shift.lineIndex].end.y,
                    },
                };
                this.lines = newLines;
                console.log("New lines after shift:", this.lines);
            } else {
                console.log("Line index", shift.lineIndex, "doesn't exist");
            }
        } else if ("equilibrium" in message) {
            // This is a Helper message
            console.log("Helper message received:", message);
            this.helper = message as Helper;
        } else if ("price" in message) {
            console.log("Price message received:", message);
            this.price = message.price;
            console.log("Price set to:", this.price);
        } else if ("quantity" in message) {
            console.log("Quantity message received:", message);
            this.quantity = message.quantity;
        }
    };
}

export default State;
