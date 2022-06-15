import {TagList} from "./Tag/TagList";
import {VisionHelper} from "./helpers/VisionHelper";
import {DOM} from "./DOM";
import {WrappedWindow} from "./DOM/WrappedWindow";
import {WrappedDocument} from "./DOM/WrappedDocument";
import {DOMObject} from "./DOM/DOMObject";

export async function Query(selector: string, dom: DOM = null): Promise<TagList | DOMObject> {
    if (VisionHelper.document) {
        dom = dom || DOM.instance;
        const tagList = await dom.get(selector, true);
        if (tagList.length == 1 || tagList.length == 1 && (tagList[0] instanceof WrappedWindow || tagList[0] instanceof WrappedDocument))
            return tagList[0];
        return tagList;
    }
    return new TagList();
}
