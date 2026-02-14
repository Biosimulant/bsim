import React from 'react';
import type { Node } from '@xyflow/react';
import type { ModuleNodeData } from './ModuleNode';
import type { ModuleRegistry } from '../../lib/api';
interface PropertiesPanelProps {
    selectedNode: Node<ModuleNodeData> | null;
    registry: ModuleRegistry | null;
    onUpdateNode: (nodeId: string, args: Record<string, unknown>) => void;
    onDeleteNode: (nodeId: string) => void;
    onRenameNode: (nodeId: string, newId: string) => void;
}
declare const PropertiesPanel: React.FC<PropertiesPanelProps>;
export default PropertiesPanel;
