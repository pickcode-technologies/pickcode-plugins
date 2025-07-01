export type Line = {
    start: { x: number; y: number };
    end: { x: number; y: number };
};

export type ShiftCommand = {
    type: "shift";
    lineIndex: number; // Which line to shift (0 = supply, 1 = demand)
    amount: number; // How much to shift (positive = right, negative = left)
};

export type Helper = {
    equilibrium: { x: number; y: number };
    price: number;
    quantity: number;
};

export type Coconut = {
    start: number;
};

export type People = {
    start: number;
};

export type Price = {
    price: number;
};

export type Quantity = {
    quantity: number;
};

export type Shift = {
    shift: number;
};

export type Drought = {
    start: number;
};

export type FunctionCall = {
    functionName: any;
    functionName2: any;
};
