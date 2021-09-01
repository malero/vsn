
export class DOMHelper {
    public static async walk(e: HTMLElement, fnc: (e: HTMLElement) => void, callOnBaseElement: boolean = true) {
        if (callOnBaseElement)
            await fnc(e);

        const len: number = e.childNodes.length;
        if (len <= 0) return;
        for (let i = 0; i < len; i++){
            if(!e.childNodes[i]){
                continue;
            }

            await DOMHelper.walk(e.childNodes[i] as HTMLElement, fnc, true);
        }
    }
}
