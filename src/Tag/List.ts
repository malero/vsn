import {VisionHelper} from "../helpers/VisionHelper";
import {DOMObject} from "../DOM/DOMObject";

export class TagList extends Array<DOMObject> {

}

if (VisionHelper.inDevelopment && VisionHelper.window)
    window['TagList'] = TagList;
