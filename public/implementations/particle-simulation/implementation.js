const createExports = (sendMessage) => {
    return Promise.resolve({
        addParticles: (numParticles, temperature, color) => sendMessage({ numParticles, temperature, color }),
    });
};
export default createExports;
