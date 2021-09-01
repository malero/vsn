export declare function extendsarray<T extends {
    new (...args: any[]): {};
}>(target: T): {
    new (...args: any[]): {};
} & T;
