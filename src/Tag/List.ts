import {Tag} from "../Tag";
import {VisionHelper} from "../helpers/VisionHelper";

export class TagList extends Array<Tag> {

}

if (VisionHelper.inDevelopment && VisionHelper.window)
    window['TagList'] = TagList;
