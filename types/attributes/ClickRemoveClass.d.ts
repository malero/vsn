import { Attribute } from "../Attribute";
export declare class ClickRemoveClass extends Attribute {
    protected cssClass: string;
    protected target: string;
    setup(): Promise<void>;
    connect(): Promise<void>;
    onClick(e: any): void;
}
