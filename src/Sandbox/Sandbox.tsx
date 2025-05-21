import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { JSRuntime } from "./JSRuntime";

async function loadImplementationCode(name: string): Promise<string> {
    const url = `/implementations/${name}/implementation.js`; // served from publicDir :contentReference[oaicite:0]{index=0}
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.statusText}`);
    return res.text();
}

export const Sandbox = () => {
    const { pluginName } = useParams();
    const jsRuntimeRef = useRef<JSRuntime>(null);
    const [implementation, setImplementation] = useState<string | undefined>(
        undefined
    );
    const [codeText, setCodeText] = useState("");

    useEffect(() => {
        if (!pluginName) return;
        loadImplementationCode(pluginName).then((c) => {
            setImplementation(c);
        });
    }, [pluginName]);

    return (
        <div className="flex flex-row w-full h-full">
            <div className="flex m-2 b-2 flex-col grow">
                <textarea
                    className="flex grow p-2"
                    value={codeText}
                    onChange={(e) => setCodeText(e.target.value)}
                />
            </div>
            <div className="flex m-2 b-2 flex-col grow">
                <iframe
                    ref={(iframe) => {
                        if (!iframe) return;
                        jsRuntimeRef.current = new JSRuntime((message) => {
                            iframe.contentWindow?.postMessage(message, "*");
                        });
                    }}
                    className="flex grow"
                    src={`/embed/${pluginName}`}
                />
            </div>
            <div
                className="absolute cursor-pointer right-5 bottom-5"
                onClick={() => {
                    jsRuntimeRef.current?.startExecution(
                        codeText,
                        implementation ?? ""
                    );
                }}
            >
                PLAY
            </div>
        </div>
    );
};
