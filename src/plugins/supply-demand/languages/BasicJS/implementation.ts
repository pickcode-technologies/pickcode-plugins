import {
    Line,
    ShiftCommand,
    Helper,
    Price,
    Quantity,
    Shift,
    Function,
} from "../../messages";

const createExports = (
    sendMessage: (
        message:
            | Line
            | ShiftCommand
            | Helper
            | Price
            | Quantity
            | Shift
            | Function
    ) => void
) => {
    console.log("createExports", sendMessage);
    return Promise.resolve({
        drawLine: (line: Line) => sendMessage(line), //sendMessage will send the userwritten function to state.ts

        // Simple functions that shift existing lines
        addSupply: (amount: number) => {
            // Shift supply curve (line 0) to the right
            sendMessage({ type: "shift", lineIndex: 0, amount: amount });
            console.log("addSupply", amount);
        },

        addDemand: (amount: number) => {
            // Shift demand curve (line 1) to the right
            sendMessage({ type: "shift", lineIndex: 1, amount: amount });
            console.log("addDemand", amount);
        },

        addDrought: (severity: number) => {
            // Shift supply curve (line 0) to the left (negative amount)
            sendMessage({
                type: "shift",
                lineIndex: 0,
                amount: -severity * 10,
            });
            console.log("addDrought", severity);
        },

        // Generic shift function for any line
        shiftLine: (lineIndex: number, amount: number) => {
            sendMessage({ type: "shift", lineIndex, amount });
        },

        setPrice: (price: number) => {
            sendMessage({ price });
            console.log("setPrice called with:", price);
        },
        setQuantity: (quantity: number) => {
            sendMessage({ quantity });
            console.log("setQuantity called with:", quantity);
        },

        setHelpers: (functionName: Function, functionName2: Function) => {
            sendMessage({ functionName, functionName2 });
        },

        // Show equilibrium point and helper lines
        showHelpers: () => {
            // Calculate equilibrium point (this will be done in the component)
            // For now, send a placeholder helper message
            sendMessage({
                equilibrium: { x: 0, y: 0 }, // Will be calculated in component
                price: 0,
                quantity: 0,
            });
            console.log("showHelpers called");
        },
    });
};

export default createExports;

//when the user types function such as addPlanet, it outlines how that code will be implemented
