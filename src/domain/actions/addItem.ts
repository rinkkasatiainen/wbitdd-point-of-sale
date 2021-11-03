import {LCDDisplay} from '../output/LCDDisplay'
import {Item, Stock} from '../repository/stock'

export interface AddItem {
    onReadBarcode: (barCode: string) => Promise<void>;
}

export class AddItemWithBarcode implements AddItem {
    // TODO: Not really a display, but something that plays role of 'I want to know when an item is added'
    public constructor(private readonly display: LCDDisplay, private readonly stock: Stock) {

    }

    public async onReadBarcode(barCode: string): Promise<void> {
        const item: Item  = await this.stock.findItem(barCode)

        await this.display.addPrice(item.asString())
    }
}
