import { Tag } from "../Tag";
import { SlotTag } from "./SlotTag";
export declare class SlottedTag extends Tag {
    protected slotTag: SlotTag;
    slotted(slot: SlotTag): Promise<void>;
    findParentTag(): Tag;
}
