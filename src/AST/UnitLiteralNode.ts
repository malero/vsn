import {LiteralNode} from "./LiteralNode";

export class UnitLiteral {
    protected _amount: number;
    protected _unit: string;

    constructor(
        protected _value: any
    ) {
        this.value = this._value;
    }

    get amount(): number {
        return this._amount;
    }

    get unit(): string {
        return this._unit;
    }

    get value(): string {
        return `${this._amount}${this._unit}`;
    }

    set value(value: string) {
        if (value.indexOf('.') > -1) {
            this._amount = parseFloat(value)
        } else {
            this._amount = parseInt(value);
        }

        if (isNaN(this._amount))
            this._amount = 0;

        const unit = /[^\d.]+$/.exec(value);
        this._unit = unit && unit[0] || '';
    }

    public toString() {
        return this.value;
    }
}


export class UnitLiteralNode extends LiteralNode<UnitLiteral> {
    constructor(
        _value: any
    ) {
        super(new UnitLiteral(_value));
    }
}
