import {Attribute} from "../Attribute";
import {VisionHelper} from "../helpers/VisionHelper";
import {Registry} from "../Registry";

@Registry.attribute('vsn-root')
export class RootAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;

    public async setup() {
        this.tag.scope.set('$mobile', VisionHelper.isMobile());
    }
}
