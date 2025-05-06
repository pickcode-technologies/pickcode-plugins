import { createRoot } from "react-dom/client";
import Component from "../src/Component";
import React, { useEffect, useState } from "react";
import State from "../src/state";
import "./App.css";

const App = () => {
    const [appState, _] = useState<State>(new State());
    const [userCode, setUserCode] = useState("// user code here");

    useEffect(() => {
        const userCode = localStorage.getItem("user_code");
        if (userCode) setUserCode(userCode);
    }, []);

    useEffect(() => {
        localStorage.setItem("user_code", userCode);
    }, [userCode]);

    useEffect(() => {
        appState.onMessage({
            color: "red",
            numParticles: 100,
            temperature: 100,
        });
    }, []);

    return (
        <div className="flex flex-row gap-2 h-[100vh] w-[100vw]">
            <div className="flex-1/2 p-2">
                <textarea
                    className="w-full h-full p-2 border-black border rounded-lg font-mono"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                ></textarea>
            </div>
            <div className="flex-1/2 flex flex-col p-2">
                <Component state={appState} />
                <button className="m-2 w-40 p-2 bg-green-500 mx-auto text-white rounded-lg cursor-pointer hover:ring-2 ring-green-500">
                    Play
                </button>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
