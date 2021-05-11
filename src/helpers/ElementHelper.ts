
export class ElementHelper {
    public static hasVisionAttribute(element: HTMLElement | Element, testAttr: string = 'v-'): boolean {
        for (let i: number = 0; i < element.attributes.length; i++) {
            const attr: Attr = element.attributes[i];
            if (attr.name.startsWith(testAttr))
            {
                return true;
            }
        }

        return false;
    }
}
