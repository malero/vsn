import {DOM} from "../../src/DOM";


describe('ClassNode', () => {
    it("properly define a simple class", (done) => {
         document.body.innerHTML = `
            <script type="text/vsn" vsn-script>
            class simple { 
                func construct() {
                    a|integer = "15"; 
                }
                
                func test() {
                    a += 1;
                }
            }
            </script>
            <div class="simple"></div>
            <div class="simple"></div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(await dom.exec('?(.simple).a')).toEqual([15, 15]);
            await dom.exec('?(.simple).test()');
            expect(await dom.exec('?(.simple).a')).toEqual([16, 16]);
            done();
        });
    });
});
