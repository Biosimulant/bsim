import type { EventRecord, ModuleVisuals, RunStatus, Snapshot, UiSpec } from "../types/api";
export type SSEMessage = {
    type: "snapshot" | "event" | "status" | "tick" | "heartbeat";
    data: unknown;
};
export type SSESubscription = {
    close: () => void;
};
export interface ModuleArg {
    name: string;
    type: string;
    default: unknown;
    required: boolean;
    description?: string;
    options?: unknown[];
}
export interface ModuleSpec {
    name: string;
    category: string;
    description?: string;
    inputs: string[];
    outputs: string[];
    args: ModuleArg[];
}
export interface ModuleRegistry {
    modules: Record<string, ModuleSpec>;
    categories: Record<string, string[]>;
}
export interface GraphNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        args: Record<string, unknown>;
        inputs: string[];
        outputs: string[];
    };
}
export interface GraphEdge {
    id: string;
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
}
export interface GraphMeta {
    title?: string;
    description?: string;
}
export interface ConfigGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
    meta: GraphMeta;
}
export interface ConfigFileInfo {
    name: string;
    path: string;
    is_dir: boolean;
}
export interface ValidateResponse {
    valid: boolean;
    errors: string[];
}
export interface CurrentConfigResponse {
    available: boolean;
    path: string | null;
    graph: ConfigGraph | null;
    error?: string;
}
export interface ApplyConfigResponse {
    ok: boolean;
    path: string;
    error?: string;
}
export interface SimulationEditorApi {
    getModules: () => Promise<ModuleRegistry>;
    getConfig: (path: string) => Promise<ConfigGraph>;
    getCurrent: () => Promise<CurrentConfigResponse>;
    saveConfig: (path: string, graph: ConfigGraph) => Promise<{
        ok: boolean;
        path: string;
    }>;
    applyConfig: (graph: ConfigGraph, savePath?: string) => Promise<ApplyConfigResponse>;
    validate: (graph: ConfigGraph) => Promise<ValidateResponse>;
    layout: (graph: ConfigGraph) => Promise<ConfigGraph>;
    toYaml: (graph: ConfigGraph) => Promise<{
        yaml: string;
    }>;
    fromYaml: (yaml: string) => Promise<ConfigGraph>;
    listFiles: (path?: string) => Promise<ConfigFileInfo[]>;
}
export interface SimulationApi {
    spec: () => Promise<UiSpec>;
    status: () => Promise<RunStatus>;
    state: () => Promise<Record<string, unknown>>;
    events: (since_id?: number, limit?: number) => Promise<{
        events: EventRecord[];
        next_since_id: number;
    }>;
    visuals: () => Promise<ModuleVisuals[]>;
    snapshot: () => Promise<Snapshot>;
    run: (duration: number, tick_dt?: number, extra?: Record<string, unknown>) => Promise<unknown>;
    pause: () => Promise<unknown>;
    resume: () => Promise<unknown>;
    reset: () => Promise<unknown>;
    subscribeSSE: (onMessage: (msg: SSEMessage) => void, onError?: (err: Event) => void) => SSESubscription;
    editor?: SimulationEditorApi;
}
export type Api = SimulationApi;
export declare function createSimuiApi(baseUrl: string): SimulationApi;
