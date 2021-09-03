import { TagList } from "./Tag/List";
import { DOM } from "./DOM";
import { DOMObject } from "./DOM/DOMObject";
export declare function Query(selector: string, dom?: DOM): Promise<TagList | DOMObject>;
