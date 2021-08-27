
export function extendsarray<T extends { new (...args: any[]): {} }>(target: T) {
    return class extends target {
        constructor(...args) {
            super(...args);
            for (const c in target.prototype) {
                this[c] = target.prototype[c];
            }
        }
    };;
}
