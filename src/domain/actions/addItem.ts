import {LCDDisplay} from '../output/LCDDisplay'
import {Item, Stock} from '../repository/stock'

export interface AddItem {
    onReadBarcode: (barCode: string) => Promise<void>;
    total: () => string
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
        return `TOTAL: ${this.items[0].asString()}`
    }
}
