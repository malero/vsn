import {DOM} from "../../src/DOM";

describe('JSONAttribute', () => {
    it("vsn-json should work with script/ld-json and an array", (done) => {
        document.body.innerHTML = `
            <script type="application/ld+json" vsn-json:test>
                [1,2,3,"four"]
            </script>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(dom.root.scope.get('test')[0]).toBe(1);
            expect(dom.root.scope.get('test')[1]).toBe(2);
            expect(dom.root.scope.get('test')[2]).toBe(3);
            expect(dom.root.scope.get('test')[3]).toBe("four");
            done();
        });
    });

    it("vsn-json should work with script/ld-json and an object", (done) => {
        document.body.innerHTML = `
            <script type="application/ld+json" vsn-json:test>
                {
                    "testing": [1,2,3,"four"],
                    "test": ["one","two","three",4],
                    "val": 111
                }
            </script>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(dom.root.scope.get('test').get("testing")[0]).toBe(1);
            expect(dom.root.scope.get('test').get("testing")[1]).toBe(2);
            expect(dom.root.scope.get('test').get("testing")[2]).toBe(3);
            expect(dom.root.scope.get('test').get("testing")[3]).toBe("four");
            expect(dom.root.scope.get('test').get("test")[0]).toBe("one");
            expect(dom.root.scope.get('test').get("test")[1]).toBe("two");
            expect(dom.root.scope.get('test').get("test")[2]).toBe("three");
            expect(dom.root.scope.get('test').get("test")[3]).toBe(4);
            expect(dom.root.scope.get('test').get("val")).toBe(111);
            done();
        });
    });

    it("vsn-json should work with div and an array", (done) => {
        document.body.innerHTML = `
            <div vsn-json:test="[1,2,3,&quot;four&quot;]"></div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(dom.root.scope.get('test')[0]).toBe(1);
            expect(dom.root.scope.get('test')[1]).toBe(2);
            expect(dom.root.scope.get('test')[2]).toBe(3);
            expect(dom.root.scope.get('test')[3]).toBe("four");
            done();
        });
    });

    it("vsn-json should work with div and an object", (done) => {
        document.body.innerHTML = `
            <div vsn-json:test="{&quot;testing&quot;: [1,2,3,&quot;four&quot;],&quot;test&quot;: [&quot;one&quot;,&quot;two&quot;,&quot;three&quot;,4]}"></div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(dom.root.scope.get('test').get("testing")[0]).toBe(1);
            expect(dom.root.scope.get('test').get("testing")[1]).toBe(2);
            expect(dom.root.scope.get('test').get("testing")[2]).toBe(3);
            expect(dom.root.scope.get('test').get("testing")[3]).toBe("four");
            expect(dom.root.scope.get('test').get("test")[0]).toBe("one");
            expect(dom.root.scope.get('test').get("test")[1]).toBe("two");
            expect(dom.root.scope.get('test').get("test")[2]).toBe("three");
            expect(dom.root.scope.get('test').get("test")[3]).toBe(4);
            done();
        });
    });
});
