import { BarCodeReadError, BarCodeReadErrorType, Item } from './repository/stock'
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
            this.prices.push(new Price(item.price()))
            await this.listensToSaleEvents.addPrice(item.asString())
        }
    }

    public total(): void {
        if (this.prices.length === 0) {
            this.listensToSaleEvents.addError('No Scanned Products')
        } else {
            const { euros, centsStr } = this.calculateTotal()
            this.listensToSaleEvents.addTotal(`TOTAL: ${ euros },${ centsStr }€`)
        }
    }

    private calculateTotal() {
        const t = this.prices.reduce((p, curr) => p.plus(curr), new Price(0))
        return { euros: t.euros, centsStr: t.centsStr }
    }
}

