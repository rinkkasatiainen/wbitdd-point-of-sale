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

    public constructor(private readonly display: ListensToSaleEvents, private readonly stock: Stock) {
        this.items = []
    }

    public async onReadBarcode(barCode: string) {
        const item = await this.stock.findItem(barCode)
        if (isError<BarCodeReadErrorType.EmptyBarcode>(item)) {
            this.display.addError('Empty barcode')
        } else {
            this.items.push(item)
            await this.display.addPrice(item.asString())
        }
    }

    public total() {
        if (this.items.length === 0) {
            this.display.addError('No Scanned Products')

        } else {
            const total = this.items.map(i => i.price()).reduce((carry, curr) => carry + curr, 0)
            const cents = (total * 100) % 100
            const euros = ((total * 100) - cents) / 100
            const centsStr = cents.toPrecision(2).split('.').join('')
            this.display.addTotal(`TOTAL: ${ euros },${ centsStr }€`)
        }
    }
}
