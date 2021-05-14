import { Attribute } from "../Attribute";
export declare class ClickToggleClass extends Attribute {
    protected cssClass: string;
    protected target: string;
    setup(): Promise<void>;
    onClick(e: any): void;
}
