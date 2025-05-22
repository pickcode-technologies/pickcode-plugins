import { FromRuntimeMessage } from "../../messages";

const createExports = (
    sendMessage: (message: FromRuntimeMessage) => void
    // onMessage: (onMessage: (message: ToRuntimeMessage) => void) => () => void
) => {
    return Promise.resolve({
        setValue: (value: any) => sendMessage({ setValue: value }),
    });
};

export default createExports;
