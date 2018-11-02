import { Tag } from "./Tag";
import { Scope } from "./Scope";
export declare class VOM {
    protected $document: Document;
    protected scope: Scope;
    static readonly tagMap: {
        [key: string]: any;
    };
    protected tags: Tag[];
    constructor($document: Document, scope: Scope);
}
