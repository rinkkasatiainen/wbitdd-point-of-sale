import {LCDDisplay} from '../output/LCDDisplay'
import {Item, Stock} from '../repository/stock'

export interface AddItem {
    onReadBarcode: (barCode: string) => Promise<void>;
    total: () => string;
}

export class AddItemWithBarcode implements AddItem {
    // TODO: Not really a display, but something that plays role of 'I want to know when an item is added'
    private items: Item[]
    public constructor(private readonly display: LCDDisplay, private readonly stock: Stock) {
        this.items = []
    }

    public async onReadBarcode(barCode: string) {
        const item: Item  = await this.stock.findItem(barCode)
        this.items.push(item)
        await this.display.addPrice(item.asString())
    }

    public total() {
        const total = this.items.map( i => i.price()).reduce( (carry, curr) => carry + curr, 0)
        const cents = (total * 100) % 100
        const euros = ((total * 100) - cents ) / 100
        const centsStr = cents.toPrecision(2).split('.').join('')
        return `TOTAL: ${euros},${centsStr}€`
    }
}
