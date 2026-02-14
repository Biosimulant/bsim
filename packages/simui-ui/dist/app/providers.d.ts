import React from "react";
import { type SimulationApi } from "../lib/api";
export declare const ApiProvider: React.FC<{
    api?: SimulationApi;
    children: React.ReactNode;
}>;
export declare function useApi(): SimulationApi;
