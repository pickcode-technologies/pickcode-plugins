import { SignalMessage } from "../../messages";

const createExports = (sendMessage: (message: SignalMessage) => void) => {
    return Promise.resolve({
        createSignal: (
            type: "sine" | "sawtooth" | "square" | "triangle",
            data: number
        ) =>
            sendMessage({
                waveType: type,
                harmonicData: data,
            }),
    });
};

export default createExports;
