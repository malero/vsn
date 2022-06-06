import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { INodeMeta, Node } from "./Node";
import { BlockNode } from "./BlockNode";
export declare class ClassNode extends Node implements TreeNode {
    readonly selector: string;
    readonly block: BlockNode;
    static readonly ClassesVariable = "_vsn_classes";
    static readonly classes: {
        [name: string]: ClassNode;
    };
    static readonly classParents: {
        [name: string]: string[];
    };
    static readonly classChildren: {
        [name: string]: string[];
    };
    static readonly preppedTags: {
        [name: string]: Tag[];
    };
    protected requiresPrep: boolean;
    readonly classScope: Scope;
    protected _fullSelector: string;
    constructor(selector: string, block: BlockNode);
    get fullSelector(): string;
    updateMeta(meta?: any): any;
    prepare(scope: Scope, dom: DOM, tag?: Tag, meta?: INodeMeta): Promise<void>;
    findClassElements(dom: any): Promise<void>;
    constructTag(tag: Tag, dom: DOM, hasConstruct?: boolean | null): Promise<void>;
    deconstructTag(tag: Tag, dom: DOM, hasDeconstruct?: boolean | null): Promise<void>;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parse(lastNode: any, token: any, tokens: Token[]): ClassNode;
    static checkForClassChanges(element: HTMLElement, dom: DOM, tag?: Tag): Promise<void>;
    static getClassesForElement(element: HTMLElement): string[];
    static addPreparedClassToElement(element: HTMLElement, selector: string): void;
    static removePreparedClassFromElement(element: HTMLElement, selector: string): void;
    static addElementClass(selector: string, element: HTMLElement, dom: DOM, tag?: Tag): Promise<void>;
    static removeElementClass(selector: string, element: HTMLElement, dom: DOM, tag?: Tag): Promise<void>;
    static isClass(cls: string): boolean;
}
