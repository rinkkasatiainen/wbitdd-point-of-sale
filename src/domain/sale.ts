import { BarCodeReadError, BarCodeReadErrorType, Item, NoItemFound } from './repository/stock'
import { ListensToSaleEvents } from './output/ListensToSaleEvents'
import { Price } from './price'

function isError<T extends BarCodeReadErrorType>(result: any): result is BarCodeReadError<T> {
    return ('_type' in result) && result._type === BarCodeReadErrorType.EmptyBarcode
}

export class Sale {
    private readonly prices: Price[]

    public constructor(private readonly listensToSaleEvents: ListensToSaleEvents) {
        this.prices = []
    }

    public async add(item: Item | BarCodeReadError<BarCodeReadErrorType>) {
        if (isError(item)) {
            this.listensToSaleEvents.addError('Empty barcode')
        } else {
            await this.listensToSaleEvents.addPrice(item.asString())
            if (!(item instanceof NoItemFound)) {
                this.prices.push(new Price(item.price()))
            }
        }
    }

    public total(): void {
        if (this.prices.length === 0) {
            this.listensToSaleEvents.addError('No Scanned Products')
        } else {
            const price = this.calculateTotal()
            this.listensToSaleEvents.addTotal(`TOTAL: ${ price.asString() }€`)
        }
    }

    private calculateTotal() {
        return this.prices.reduce((p, curr) => p.plus(curr), new Price(0))
    }
}

