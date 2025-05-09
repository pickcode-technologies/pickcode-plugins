import { useEffect, useState } from "react";
import State from "./state";
import Component from "./Component";

export const Plugin = () => {
    const [pluginState, _] = useState(new State());

    // useEffect(() => {
    //     const onWindowMessage = (m: MessageEvent<any>) =>
    //         pluginState.onMessage(m as any);
    //     window.addEventListener("message", onWindowMessage);
    //     return () => window.removeEventListener("message", onWindowMessage);
    // }, []);

    return <Component state={pluginState} />;
};

export default Plugin;
