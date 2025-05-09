import { useParams } from "react-router";
import { Suspense, lazy } from "react";

export const PluginLoader = () => {
    const { pluginName } = useParams();

    const PluginComponent = lazy(
        () => import(`./plugins/${pluginName}/Plugin.tsx`)
    );

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PluginComponent />
        </Suspense>
    );
};
