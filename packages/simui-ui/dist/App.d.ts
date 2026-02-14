import React from "react";
import type { SimulationApi } from "./lib/api";
import type { ChatAdapter } from "./types/chat";
type AppMode = "simulation" | "editor";
export interface SimuiAppProps {
    api?: SimulationApi;
    className?: string;
    style?: React.CSSProperties;
    height?: string;
    initialMode?: AppMode;
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
    chatAdapter?: ChatAdapter;
}
export declare const SimuiApp: React.FC<SimuiAppProps>;
export declare const App: React.FC;
export {};
