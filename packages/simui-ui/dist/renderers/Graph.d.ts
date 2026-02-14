type Edge = {
    source: string;
    target: string;
};
type Node = {
    id: string;
};
export default function Graph({ data, isFullscreen }: {
    data: {
        nodes?: Node[];
        edges?: Edge[];
    };
    isFullscreen?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
