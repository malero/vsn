import { Tag } from "./Tag";
export declare abstract class Attribute {
    readonly tag: Tag;
    readonly attributeName: string;
    static readonly scoped: boolean;
    protected constructor(tag: Tag, attributeName: string);
    protected configure(): Promise<void>;
    setup(): Promise<void>;
    extract(): Promise<void>;
    connect(): Promise<void>;
    evaluate(): Promise<void>;
    getAttributeValue(fallback?: any): any;
    getAttributeBinding(fallback?: any): string;
    mutate(mutation: MutationRecord): void;
}
