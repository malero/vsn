import {DOM} from "../../src/DOM";

describe('JSONAttribute', () => {
    it("vsn-json should work with script/ld-json and an array", (done) => {
        document.body.innerHTML = `
            <script type="application/ld+json" vsn-json:t0>
                [1,2,3,"four"]
            </script>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            expect(dom.root.scope.get('t0')[0]).toBe(1);
            expect(dom.root.scope.get('t0')[1]).toBe(2);
            expect(dom.root.scope.get('t0')[2]).toBe(3);
            expect(dom.root.scope.get('t0')[3]).toBe("four");
            done();
        });
    });

    it("vsn-json should work with script/ld-json and an object", (done) => {
        document.body.innerHTML = `
            <script type="application/ld+json" vsn-json:t1>
                {
                    "testing": [1,2,3,"four"],
                    "test": ["one","two","three",4],
                    "val": 111
                }
            </script>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            expect(dom.root.scope.get('t1').get("testing")[0]).toBe(1);
            expect(dom.root.scope.get('t1').get("testing")[1]).toBe(2);
            expect(dom.root.scope.get('t1').get("testing")[2]).toBe(3);
            expect(dom.root.scope.get('t1').get("testing")[3]).toBe("four");
            expect(dom.root.scope.get('t1').get("test")[0]).toBe("one");
            expect(dom.root.scope.get('t1').get("test")[1]).toBe("two");
            expect(dom.root.scope.get('t1').get("test")[2]).toBe("three");
            expect(dom.root.scope.get('t1').get("test")[3]).toBe(4);
            expect(dom.root.scope.get('t1').get("val")).toBe(111);
            done();
        });
    });

    it("vsn-json should work with div and an array", (done) => {
        document.body.innerHTML = `
            <div vsn-json:t2="[1,2,3,&quot;four&quot;]"></div>
        `;

        const dom = new DOM(document.body);
        dom.once('built', async () => {
            console.log('scope keys', dom.root.scope.keys);
            expect(dom.root.scope.get('t2')[0]).toBe(1);
            expect(dom.root.scope.get('t2')[1]).toBe(2);
            expect(dom.root.scope.get('t2')[2]).toBe(3);
            expect(dom.root.scope.get('t2')[3]).toBe("four");
            done();
        });
    });

    it("vsn-json should work with div and an object", (done) => {
        document.body.innerHTML = `
            <div vsn-json:t3="{&quot;testing&quot;: [1,2,3,&quot;four&quot;],&quot;test&quot;: [&quot;one&quot;,&quot;two&quot;,&quot;three&quot;,4]}"></div>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            expect(dom.root.scope.get('t3').get("testing")[0]).toBe(1);
            expect(dom.root.scope.get('t3').get("testing")[1]).toBe(2);
            expect(dom.root.scope.get('t3').get("testing")[2]).toBe(3);
            expect(dom.root.scope.get('t3').get("testing")[3]).toBe("four");
            expect(dom.root.scope.get('t3').get("test")[0]).toBe("one");
            expect(dom.root.scope.get('t3').get("test")[1]).toBe("two");
            expect(dom.root.scope.get('t3').get("test")[2]).toBe("three");
            expect(dom.root.scope.get('t3').get("test")[3]).toBe(4);
            done();
        });
    });

    it("vsn-json should work with a ref path", (done) => {
        document.body.innerHTML = `
            <div vsn-name="testing">
                <div vsn-json:testing.test='{"testing": 123}'></div>
            </div>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            expect(dom.root.scope.get('testing').get("test").get('testing')).toBe(123);
            done();
        });
    });
});
