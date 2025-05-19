import { useEffect, useState } from "react";
import { PluginComponentBase } from "./PluginComponentBase";
import { PluginStateBase } from "./PluginStateBase";

export const plugin =
    <T extends PluginStateBase>(
        Component: PluginComponentBase<T>,
        State: new () => T
    ) =>
    () => {
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
