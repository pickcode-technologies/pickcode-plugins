const createExports = (sendMessage) => {
    return Promise.resolve({
        playNote: (note, duration) => sendMessage({ note, duration }),
    });
};
export default createExports;
