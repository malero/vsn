import {TagList} from "./Tag/List";
import {VisionHelper} from "./helpers/VisionHelper";
import {DOM} from "./DOM";

export async function Query(selector: string, dom: DOM = null): Promise<TagList> {
    if (VisionHelper.document) {
        dom = dom || DOM.instance;
        return await dom.get(selector, true)
    }
    return new TagList();
}
