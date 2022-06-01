import {DOM} from "../../src/DOM";
import {ClassNode} from "../../src/AST/ClassNode";
import {Registry} from "../../src/Registry";
import {TagList} from "../../src/Tag/List";


describe('ClassNode', () => {
    it("properly combine nested classes", async () => {
         document.body.innerHTML = `
            <script type="text/vsn" vsn-script>
            class .simple { 
                func construct() {}
                class input {
                    func construct() {}
                }
            }
            </script>
            <div class="simple"><input /></div>
        `;
        const dom = new DOM(document);
        await dom.ready;
        await Registry.instance.classes.get('.simple input');
        expect(ClassNode.classParents['input']).toBeInstanceOf(Array);
        expect(ClassNode.classParents['input'].includes('.simple input')).toBe(true);
        expect(ClassNode.classes['.simple input']).toBeInstanceOf(ClassNode);
    });

    it("properly define a simple class", async () => {
         document.body.innerHTML = `
            <script type="text/vsn" vsn-script>
            class .simple-construct { 
                func construct() {
                    a|integer = "15";
                    log('####### construct', a);
                }
                
                func test() {
                    a += 1;
                    log('####### testing', a);
                }
            }
            </script>
            <div class="simple-construct" id="ele-1"></div>
            <div class="simple-construct" id="ele-2"></div>
        `;
        const dom = new DOM(document);
        await dom.ready;
        await Registry.instance.classes.get('.simple-construct');
        const t: TagList = await dom.exec('?(.simple-construct)');
        expect(t).toBeInstanceOf(TagList);
        expect(t.length).toBe(2);
        await t.all('.simple-construct.construct');
        console.log('####### hmm?', await dom.exec('?(.simple-construct).a'));
        expect(await dom.exec('?(.simple-construct).a')).toEqual([15, 15]);
        await dom.exec('?(.simple-construct).test()');
        expect(await dom.exec('?(.simple-construct).a')).toEqual([16, 16]);
    });
});
