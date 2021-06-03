
export class ElementHelper {
    public static hasVisionAttribute(element: HTMLElement | Element, testAttr: string = 'vsn-'): boolean {
        for (let i: number = 0; i < element.attributes.length; i++) {
            const attr: Attr = element.attributes[i];
            if (attr.name.startsWith(testAttr))
            {
                return true;
            }
        }

        return false;
    }

    public static normalizeElementID(id: string) {
        return id ? id.replace(/-([a-zA-Z0-9])/g, function (g) { return g[1].toUpperCase(); }) : null;
    }
}
