import {Attribute} from "../Attribute";
import {VisionHelper} from "../helpers/VisionHelper";
import {Registry} from "../Registry";
import {benchmark} from "../Bencmark";

@Registry.attribute('vsn-root')
export class RootAttribute extends Attribute {
    public static readonly scoped: boolean = true;

    @benchmark('attributeSetup', 'RootAttribute')
    public async setup() {
        this.tag.scope.set('$mobile', VisionHelper.isMobile());
    }
}
