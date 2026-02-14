import React from 'react';
import type { Control, EventRecord, ModuleVisuals, RunStatus, UiSpec } from '../types/api';
export type ControlsState = Record<string, number | string>;
type UiState = {
    spec: UiSpec | null;
    status: RunStatus | null;
    visuals: ModuleVisuals[];
    events: EventRecord[];
    controls: ControlsState;
    visibleModules: Set<string>;
};
type UiActions = {
    setSpec: (s: UiSpec) => void;
    setStatus: (s: RunStatus) => void;
    setVisuals: (v: ModuleVisuals[]) => void;
    setEvents: (e: EventRecord[]) => void;
    appendEvent: (e: EventRecord) => void;
    setControls: (c: Partial<ControlsState>) => void;
    /**
     * Merge control defaults without overwriting user-provided values.
     * This is useful when the control schema changes (e.g. draft -> created run)
     * but the user should keep any inputs they've already set.
     */
    setControlsIfUnset: (c: Partial<ControlsState>) => void;
    setVisibleModules: (mods: Set<string>) => void;
};
export declare function UiProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useUi(): {
    state: UiState;
    actions: UiActions;
};
export declare function useModuleNames(): string[];
export declare function useVisualsByModule(): Map<string, ModuleVisuals['visuals']>;
export declare function isNumberControl(c: Control): c is Extract<Control, {
    type: 'number';
}>;
export declare function isJsonControl(c: Control): c is Extract<Control, {
    type: 'json';
}>;
export {};
