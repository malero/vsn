import {Tree} from "../../src/AST";
import {Scope} from "../../src/Scope";


describe('StringFormatNode', () => {
    it("should format simple format strings", async () => {
        const tree = new Tree("`Hello ${name}`");
        const scope = new Scope();
        scope.set("name", "World");
        expect(await tree.evaluate(scope, null, null)).toBe("Hello World");
    });
});
