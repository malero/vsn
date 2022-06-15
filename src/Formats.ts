import {Registry} from "./Registry";
import {Configuration} from "./Configuration";

export class Formats {
    protected static CurrencyFormatter: Intl.NumberFormat;

    @Registry.format('currency')
    public static currency(value: string | number) {
        if (!Formats.CurrencyFormatter) {
            const setup = () => {
                const locale: string = Configuration.get('locale', 'en-US') as string;
                const currency: string = Configuration.get('currency', 'USD') as string;
                Formats.CurrencyFormatter = new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: currency
                });
            };
            Configuration.instance.on('change:locale', setup);
            Configuration.instance.on('change:currency', setup);
            setup();
        }
        value = `${value}`.replace(/[^0-9.]+/, '');
        value = parseFloat(value);
        if (isNaN(value))
            return '';
        return Formats.CurrencyFormatter.format(value);
    }

    @Registry.format('date')
    public static date(value: Date | string | number) {
        return value ? value.toLocaleString() : '';
    }
}
