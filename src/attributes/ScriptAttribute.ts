import {Registry} from "../Registry";
import {Exec} from "./Exec";

@Registry.attribute('vsn-script')
export class ScriptAttribute extends Exec {
    public get code() {
        return this.tag.element.innerText;
    }
}
