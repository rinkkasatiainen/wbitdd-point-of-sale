import { ListensToSaleEvents } from '../output/ListensToSaleEvents'
import { BarCodeReadError, BarCodeReadErrorType, Item, Stock } from '../repository/stock'

export interface AddItem {
    onReadBarcode: (barCode: string) => Promise<void>;
    total: () => void;
}

export interface Result<L, R> {
    left: L;
    right: R;
}

function isError<T extends BarCodeReadErrorType>(result: any): result is BarCodeReadError<T> {
    return ('_type' in result) && result._type === BarCodeReadErrorType.EmptyBarcode
}

export class AddItemWithBarcode implements AddItem {
    private sale: Sale

    public constructor(private readonly listensToSaleEvents: ListensToSaleEvents, private readonly stock: Stock) {
        this.sale = new Sale(listensToSaleEvents)
    }

    public async onReadBarcode(barCode: string) {
        const item = await this.stock.findItem(barCode)
        if (isError<BarCodeReadErrorType.EmptyBarcode>(item)) {
            this.listensToSaleEvents.addError('Empty barcode')
        } else {
            this.sale.add(item)
            await this.listensToSaleEvents.addPrice(item.asString())
        }
    }

    public total() {
        this.sale.total(this.listensToSaleEvents)
    }
}

class Sale {
    private readonly prices: Price[]

    public constructor(private readonly listensToSaleEvents: ListensToSaleEvents) {
        this.prices = []
    }

    public getMoney() {
        const t = this.prices.reduce((p, curr) => p.plus(curr), new Price(0))
        return { euros: t.euros, centsStr: t.centsStr }
    }

    public add(item: Item) {
        this.prices.push(new Price(item.price()))
    }

    public total(listensToSaleEvents: ListensToSaleEvents): void {
        if (this.prices.length === 0) {
            this.listensToSaleEvents.addError('No Scanned Products')
        } else {
            const { euros, centsStr } = this.getMoney()
            this.listensToSaleEvents.addTotal(`TOTAL: ${ euros },${ centsStr }€`)
        }
    }
}


class Price {
    public readonly cents: number
    public readonly euros: number
    public readonly centsStr: string

    public constructor(price: number) {
        this.cents = (price * 100) % 100
        this.centsStr = this.cents.toPrecision(2).split('.').join('')
        this.euros = this.getEuros(price)
    }

    public plus(other: Price): Price {
        const cents = (this.cents + other.cents) / 100
        const euros = this.euros + other.euros
        return new Price(euros + cents)
    }

    private getEuros(price: number) {
        return ((price * 100) - this.cents) / 100
    }
}
