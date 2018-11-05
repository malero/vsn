import {Tag} from "./Tag";
import {Controller} from "./tags/Controller";
import {Binding} from "./tags/Binding";
import {Scope} from "./Scope";
import {Click} from "./tags/Click";

export class VOM {
    public static readonly tagMap: {[key: string]: any} = {
        '[v-class]': Controller,
        '[v-bind]': Binding,
        '[v-click]': Click,
        '[v-list]': List,
    };
    protected tags: Tag[];

    constructor(
        protected $document: Document,
        protected scope: Scope
    ) {
        this.tags = [];

        for (const selector in VOM.tagMap) {
            for (const element of Array.from($document.querySelectorAll(selector))) {
                this.tags.push(new VOM.tagMap[selector](element, scope));
            }
        }
    }
}
