import { LiteralNode } from "./LiteralNode";
export declare class UnitLiteral {
    protected _value: any;
    protected _amount: number;
    protected _unit: string;
    constructor(_value: any);
    get amount(): number;
    get unit(): string;
    get value(): string;
    set value(value: string);
    toString(): string;
}
export declare class UnitLiteralNode extends LiteralNode<UnitLiteral> {
    constructor(_value: any);
}
