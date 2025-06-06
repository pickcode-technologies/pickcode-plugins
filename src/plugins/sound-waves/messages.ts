export type SignalMessage = {
    waveType: "sine" | "sawtooth" | "square" | "triangle";
    harmonicData: number; // EITHER harmonics or harmonic number
    color?: string;
};
