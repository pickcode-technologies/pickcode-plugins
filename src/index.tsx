import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { PluginLoader } from "./PluginLoader";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/embed/:pluginName" element={<PluginLoader />} />
            </Routes>
        </BrowserRouter>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
