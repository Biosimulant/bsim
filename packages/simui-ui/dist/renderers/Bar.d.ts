type Item = {
    label: string;
    value: number;
};
export default function Bar({ data, isFullscreen }: {
    data: {
        items?: Item[];
    };
    isFullscreen?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
