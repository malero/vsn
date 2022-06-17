import {Tag} from "../Tag";
import {SlotTag} from "./SlotTag";

export class SlottedTag extends Tag {
    protected slotTag: SlotTag;

    public async slotted(slot: SlotTag) {
        this.slotTag = slot;
        this.slot = slot.element as HTMLSlotElement;
        this.findParentTag();
    }

    findParentTag(): Tag {
        this.parentTag = this.slotTag;
        return this._parentTag;
    }
}
