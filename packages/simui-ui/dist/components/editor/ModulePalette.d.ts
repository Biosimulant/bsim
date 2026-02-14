import React from 'react';
import type { ModuleRegistry, ModuleSpec } from '../../lib/api';
interface ModulePaletteProps {
    registry: ModuleRegistry | null;
    onDragStart: (event: React.DragEvent, moduleType: string, spec: ModuleSpec) => void;
}
declare const ModulePalette: React.FC<ModulePaletteProps>;
export default ModulePalette;
