import { On } from "./On";
export declare abstract class KeyAbstract extends On {
    protected specificKey: string;
    compile(): Promise<void>;
    connect(): Promise<void>;
    handleEvent(e: any): Promise<void>;
}
