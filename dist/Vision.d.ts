import { DOM } from "./DOM";
export declare class Vision {
    protected dom?: DOM;
    constructor();
    setup(): void;
    parse(str: string): import("../../../../../Users/malero/Projects/visionjs/src/lang/Lexer").Token[];
}
export declare const vision: Vision;
