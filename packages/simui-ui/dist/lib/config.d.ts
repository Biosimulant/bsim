export type FrontendConfig = {
    baseUrl: string;
};
declare global {
    interface Window {
        __BSIM_UI__?: {
            mountPath?: string;
        };
    }
}
export declare function resolveConfig(): FrontendConfig;
