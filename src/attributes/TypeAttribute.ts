import {Attribute} from "../Attribute";
import {ScopeReference, ScopeVariableType} from "../Scope";


export class TypeAttribute extends Attribute {
    public async extract() {
        const key: string = this.getAttributeBinding();
        let type: ScopeVariableType = this.tag.scope.stringToType(this.getAttributeValue());

        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(key);
        } catch (e) {
            console.error('error', e);
            return;
        }

        ref.scope.setType(ref.key, type);
    }
}
