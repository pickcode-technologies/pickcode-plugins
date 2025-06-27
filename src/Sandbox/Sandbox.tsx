import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { JSRuntime } from "./JSRuntime";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

async function loadImplementationCode(name: string): Promise<string> {
    const url = `/plugins-code/${name}/languages/BasicJS/implementation.js`;
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
        const codeText = localStorage.getItem("codeText");
        if (codeText) {
            setCodeText(codeText);
        }
    }, []);

    useEffect(() => {
        if (!pluginName) return;
        loadImplementationCode(pluginName).then((c) => {
            setImplementation(c);
        });
    }, [pluginName]);

    return (
        <div className="flex flex-row w-full h-full">
            <div className="flex flex-col grow">
                <CodeMirror
                    value={codeText}
                    className="h-full grow m-2 b-2 border border-slate-500 rounded-lg overflow-hidden"
                    height="100%"
                    extensions={[javascript()]}
                    onChange={(value) => {
                        setCodeText(value);
                        localStorage.setItem("codeText", value);
                    }}
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
                    className="flex grow border border-slate-500 rounded-lg"
                    src={`/embed/${pluginName}`}
                />
            </div>
            <div
                className="absolute cursor-pointer right-5 bottom-5 bg-green-500 text-green-50 px-4 py-2 rounded-lg and-i-need-it-now hover:ring-2 hover:ring-green-800"
                onClick={() => {
                    jsRuntimeRef.current?.startExecution(
                        codeText,
                        implementation ?? ""
                    );
                }}
            >
                Play
            </div>
        </div>
    );
};
