type Series = {
    name?: string;
    points: Array<[number, number]>;
};
export default function Timeseries({ data, isFullscreen }: {
    data: {
        series?: Series[];
    };
    isFullscreen?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
