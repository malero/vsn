import {Registry} from "../Registry";
import {Service} from "../Service";
import {property} from "../Scope/properties/Property";

@Registry.service('XHR')
export class XHR extends Service {
    @property()
    public readonly siteHeaders: { [key: string]: {[key: string]: string}} = {};

    @property()
    public readonly siteFormData: { [key: string]: {[key: string]: string}} = {};

    public addHeader(key: string, value: string, site: string = null) {
        if (site === null)
            site = window.location.hostname;

        if (!this.siteHeaders[site]) {
            this.siteHeaders[site] = {};
        }
        this.siteHeaders[site][key] = value;
    }

    public addFormData(key: string, value: string, site: string = null) {
        if (site === null)
            site = window.location.hostname;

        if (!this.siteFormData[site]) {
            this.siteFormData[site] = {};
        }
        this.siteFormData[site][key] = value;
    }

    public getHeaders(site: string = null) {
        if (site === null)
            site = window.location.hostname;

        return this.siteHeaders[site];
    }

    public getFormData(site: string = null) {
        if (site === null)
            site = window.location.hostname;

        return this.siteFormData[site];
    }
}
