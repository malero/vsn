import {Attribute} from "../Attribute";
import {VisionHelper} from "../helpers/VisionHelper";
import {Registry} from "../Registry";

@Registry.attribute('vsn-root')
export class RootAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;

    public async setup() {
        this.tag.scope.set('$mobile', VisionHelper.isMobile());
        for (const key of Registry.instance.functions.keys) {
            const fn = Registry.instance.functions.get(key);
            this.tag.scope.set(key, fn);
        }

        Registry.instance.functions.on('register', this.registerFunction, this);
        await super.setup();
    }

    public async registerFunction(name: string, fn: Function) {
        this.tag.scope.set(name, fn);
    }
}
