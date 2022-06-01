import {DOM} from "../../src/DOM";
import {ClassNode} from "../../src/AST/ClassNode";
import {Registry} from "../../src/Registry";
import {TagList} from "../../src/Tag/List";
import {Tag} from "../../src/Tag";


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

    it("properly define a simple class with a parent", async () => {
        document.body.innerHTML = `
            <script type="text/vsn" vsn-script>
            class .testing { 
                func construct() {
                    a|integer = 0;
                }
                
                class .test {
                    func construct() {
                        ?<(.testing).a += 1;
                    }
                }
            }
            </script>
            <div class="testing"><span class="test"></span></div>
        `;
        const dom = new DOM(document);
        await dom.ready;
        await Registry.instance.classes.get('.testing .test');
        const t = await dom.exec('?(.testing .test)[0]');
        await t.promise('.testing .test.construct');
        expect(await dom.exec('?(.testing)[0].a')).toEqual(1);
    });

    it("properly define a simple class with a parent", async () => {
        document.body.innerHTML = `
<script type="text/vsn" vsn-script>
class .product-firearm-option {
    func construct() {
        log('construct');
    }
        
    func open() {
        log(@data-type, 'open');
    }

    func close() {
        log(@data-type, 'close');
    }

    func filter(value) {
        log(@data-type, 'filter', value);
    }

    class > input {
        func construct() {
            log('construct');
        }
        on focus() {
            ?>(:parent).open();
        }
        
        on blur() {
            ?>(:parent).close();
        }
        
        on keyup() {
            ?>(:parent).filter(@value)
        }
    }

    class .option-list {
        func construct() {
            log(?>(:parent input).@data-type, 'construct');
        }
    
        class li {
            func construct() {
                log(@text);
            }
        }
    }
}
</script>
<div class="product-firearm-option">
    <input data-type="firearm-type" />
    <ul class="option-list">
        <li data-type="rifle">Rifle</li>
        <li data-type="pistol">Pistol</li>
        <li data-type="shotgun">Shotgun</li>
    </ul>
</div>
<div class="product-firearm-option">
    <input data-type="model-type" />
    <ul class="option-list">
        <li data-type="rifle">Glock</li>
        <li data-type="pistol">Springfield Armory</li>
        <li data-type="shotgun">Smith & Wesson</li>
    </ul>
</div>
`;
        const dom = new DOM(document);
        await dom.ready;
    });
});
