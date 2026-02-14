import React from 'react';
import type { Api } from '../../lib/api';
interface ConfigEditorProps {
    api: Api;
    initialConfigPath?: string;
}
declare const ConfigEditor: React.FC<ConfigEditorProps>;
export default ConfigEditor;
