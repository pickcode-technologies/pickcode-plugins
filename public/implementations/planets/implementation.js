const createExports = (sendMessage) => {
    return Promise.resolve({
        addPlanet: (planet) => sendMessage(planet),
    });
};
export default createExports;
