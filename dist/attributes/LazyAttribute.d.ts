import { On } from "./On";
export declare class LazyAttribute extends On {
    private loaded;
    private eleTop;
    setup(): Promise<void>;
    connect(): Promise<void>;
    handleEvent(e?: Event): Promise<void>;
}
