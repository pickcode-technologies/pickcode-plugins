import { useRef, useState } from "react";
import { useParams } from "react-router";

export const Sandbox = () => {
    const { pluginName } = useParams();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [codeText, setCodeText] = useState("");

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
                    ref={iframeRef}
                    className="flex grow"
                    src={`/embed/${pluginName}`}
                />
            </div>
            <div
                className="absolute cursor-pointer right-5 bottom-5"
                onClick={() => console.log("PLAY")}
            >
                PLAY
            </div>
        </div>
    );
};
