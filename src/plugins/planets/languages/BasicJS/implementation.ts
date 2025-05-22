import { Planet } from "../../messages";

const createExports = (sendMessage: (message: Planet) => void) => {
    return Promise.resolve({
        addPlanet: (planet: Planet) => sendMessage(planet),
    });
};

export default createExports;
