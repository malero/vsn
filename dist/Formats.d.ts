export declare class Formats {
    protected static CurrencyFormatter: Intl.NumberFormat;
    static currency(value: string | number): string;
    static date(value: Date | string | number): string;
}
