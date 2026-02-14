import React from 'react';
import { type NodeProps } from '@xyflow/react';
export interface ModuleNodeData {
    label: string;
    moduleType: string;
    args: Record<string, unknown>;
    inputs: string[];
    outputs: string[];
    selected?: boolean;
    [key: string]: unknown;
}
declare const _default: React.NamedExoticComponent<NodeProps>;
export default _default;
