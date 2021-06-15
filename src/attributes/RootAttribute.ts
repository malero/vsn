import {Attribute} from "../Attribute";
import {VisionHelper} from "../helpers/VisionHelper";

export class RootAttribute extends Attribute {
    public static readonly scoped: boolean = true;

    public async setup() {
        this.tag.scope.set('$mobile', VisionHelper.isMobile());
    }
}
