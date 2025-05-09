import { observer } from "mobx-react-lite";
import State from "./state";

const Component = observer(
    ({
        runtimeState,
        state,
    }: // getFile,
    {
        runtimeState: "starting" | "ready" | "running" | "stopped";
        state: State | undefined;
        getFile: (path: string) => any | undefined;
    }) => {
        if (runtimeState === "starting" || !state) {
            return <div>Press play to start.</div>;
        }
        return <div>Value: {state?.value}</div>;
    }
);

export default Component;
