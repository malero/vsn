import MessageList from "../src/MessageList";

describe('MessageList', () => {
    it("should reset properly", () => {
        const list = new MessageList();
        list.merge({
            'foo': ['bar', 'baz']
        });
        console.info(list.keys);
        expect(list.length).toBe(1);
        expect(list['foo']).toEqual(['bar', 'baz']);

        list.reset();

        expect(list.length).toBe(0);
        expect(list['foo']).toEqual(undefined);
    });

    it("should add messages", () => {
        const list = new MessageList({
            'foo': ['bar', 'baz']
        });

        // Add list
        list.add('foo', ['biz', 'blarg']);
        expect(list['foo']).toEqual(['bar', 'baz', 'biz', 'blarg']);

        // Add single error and replace
        list.add('foo', 'replaced', true);
        expect(list['foo']).toEqual(['replaced']);
    });

    it("should merge messages", () => {
        const list = new MessageList();
        list.merge({
            'foo': ['bar', 'baz'],
            'test': ['test 1', 'test 2']
        });

        list.merge({
            'foo': ['merged 1', 'merged 2'],
            'test': ['test 3', 'test 4'],
            'new': ['new 1', 'new 2']
        });

        expect(list['foo']).toEqual(['bar', 'baz', 'merged 1', 'merged 2']);
        expect(list['test']).toEqual(['test 1', 'test 2', 'test 3', 'test 4']);
        expect(list['new']).toEqual(['new 1', 'new 2']);
    });

    it("should replace messages", () => {
        const list = new MessageList();
        list.merge({
            'foo': ['bar', 'baz'],
            'test': ['test 1', 'test 2']
        });

        list.merge({
            'foo': ['merged 1', 'merged 2'],
            'test': ['test 3', 'test 4'],
            'new': ['new 1', 'new 2']
        }, true);

        expect(list['foo']).toEqual(['merged 1', 'merged 2']);
        expect(list['test']).toEqual(['test 3', 'test 4']);
        expect(list['new']).toEqual(['new 1', 'new 2']);
    });

    it("should return a list", () => {
        const list = new MessageList(),
            items = {
                'foo': ['bar', 'baz'],
                'test': ['test 1', 'test 2']
            };
        list.merge(items);
        expect(list.list).toEqual(items);
    });

    it("should ignore empty additions", () => {
        const list = new MessageList();
        list.merge({});
        list.merge(null);
        expect(list.length).toEqual(0);

        list.merge({
            'empty': [],
            'null': null
        });
        expect(list.length).toEqual(0);
    });

    it("should cache list getter result", () => {
        const messageList = new MessageList({
            'foo': ['bar', 'baz']
        }),
            list = messageList.list;
        expect(list).toBe(messageList.list);
        messageList.add('bar', 'baz');
        expect(list).not.toBe(messageList.list);
    });
});
