import { AddParticlesMessage } from "./messages";

const createExports = (sendMessage: (message: AddParticlesMessage) => void) => {
    return Promise.resolve({
        addParticles: (
            numParticles: number,
            temperature: number,
            color: string
        ) => sendMessage({ numParticles, temperature, color }),
    });
};

export default createExports;
