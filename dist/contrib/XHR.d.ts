import { Service } from "../Service";
export declare class XHR extends Service {
    readonly siteHeaders: {
        [key: string]: {
            [key: string]: string;
        };
    };
    readonly siteFormData: {
        [key: string]: {
            [key: string]: string;
        };
    };
    addHeader(key: string, value: string, site?: string): void;
    addFormData(key: string, value: string, site?: string): void;
    getHeaders(site?: string): {
        [key: string]: string;
    };
    getFormData(site?: string): {
        [key: string]: string;
    };
}
