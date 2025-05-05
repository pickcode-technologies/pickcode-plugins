import { SongFromRuntimeMessage } from "./messages";

const createExports = (
    sendMessage: (message: SongFromRuntimeMessage) => void
) => {
    return Promise.resolve({
        song: {
            playNote: (note: string, duration: number) =>
                sendMessage({ note, duration }),
        },
    });
};

export default createExports;
