import { useEffect, useState } from "react";
import Component from "./Component";
import State from "./state";

export const Plugin = () => {
    const [pluginState, setPluginState] = useState(new State());

    useEffect(() => {
        const onWindowMessage = ({ data }: MessageEvent<any>) => {
            if (data.type === "start") {
                setPluginState(new State());
            } else if (data.type === "message") {
                pluginState.onMessage(data.message as any);
            }
        };
        window.addEventListener("message", onWindowMessage);
        return () => window.removeEventListener("message", onWindowMessage);
    }, [pluginState]);

    return <Component state={pluginState} />;
};

export default Plugin;
