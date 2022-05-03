
export class WASMContext {
    public readonly names: string[];
    public addName(name: string): number {
        let index: number = this.names.indexOf(name);
        if (index == -1) {
            index = this.names.length;
            this.names.push(name);
        }
        return index;
    }
}
