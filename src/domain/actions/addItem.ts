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

// export const ofError: <L>(x: L) => Result<L, null> = left => ({ left, rigth: null})

function isError<T extends BarCodeReadErrorType>(result: any): result is BarCodeReadError<T> {
    return ('_type' in result) && result._type === BarCodeReadErrorType.EmptyBarcode
}

export class AddItemWithBarcode implements AddItem {
    // TODO: Not really a display, but something that plays role of 'I want to know when an item is added'
    private items: Item[]
    private sale: Sale

    public constructor(private readonly display: ListensToSaleEvents, private readonly stock: Stock) {
        this.items = []
        this.sale = new Sale([])
    }

    public async onReadBarcode(barCode: string) {
        const item = await this.stock.findItem(barCode)
        if (isError<BarCodeReadErrorType.EmptyBarcode>(item)) {
            this.display.addError('Empty barcode')
        } else {
            this.sale.add(item)

            this.items.push(item)
            await this.display.addPrice(item.asString())
        }
    }

    public total() {
        if (this.items.length === 0) {
            this.display.addError('No Scanned Products')

        } else {
            const { euros, centsStr } = this.sale.getMoney()
            this.display.addTotal(`TOTAL: ${ euros },${ centsStr }€`)
        }
    }
}

class Sale {
    private readonly prices: Price[]

    public constructor(public readonly items: Item[]) {
        this.prices = items.map( i => new Price(i.price()))
    }

    public getMoney( ){
        const t = this.prices.reduce ( (p, curr) => p.plus(curr), new Price(0))
        return { euros: t.euros, centsStr: t.centsStr }
    }

    public add(item: Item) {
        this.prices.push( new Price(item.price()))
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

    public plus( other: Price): Price {
        const cents = (this.cents + other.cents) / 100
        const euros = this.euros + other.euros
        // const eurosFromCents = this.getEuros(cents / 100)
        return new Price( euros + cents)
    }

    private getEuros(price: number) {
        return ((price * 100) - this.cents) / 100
    }
}
