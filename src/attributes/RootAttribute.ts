import {Attribute} from "../Attribute";
import {VisionHelper} from "../helpers/VisionHelper";
import {Registry} from "../Registry";
import {Scope} from "../Scope";

@Registry.attribute('vsn-root')
export class RootAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;

    public async setup() {
        this.tag.scope.set('$mobile', VisionHelper.isMobile());
        if (console && !this.tag.scope.get('console'))
            this.tag.scope.set('console', Scope.fromObject(console));
        await super.setup();
    }
}
