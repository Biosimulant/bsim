type TableData = {
    columns?: string[];
    rows?: (string | number)[][];
    items?: Record<string, string | number>[];
};
export default function Table({ data, isFullscreen }: {
    data: TableData;
    isFullscreen?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
