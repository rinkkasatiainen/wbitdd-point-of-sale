import { ListensToSaleEvents } from '../output/ListensToSaleEvents'
import { Stock } from '../repository/stock'
import { Sale } from '../sale'

export interface AddItem {
    onReadBarcode: (barCode: string) => Promise<void>;
}

export class AddItemWithBarcode implements AddItem {
    private sale: Sale

    public constructor(listensToSaleEvents: ListensToSaleEvents, private readonly stock: Stock, sale: Sale) {
        this.sale = sale
    }

    public async onReadBarcode(barCode: string) {
        const item = await this.stock.findItem(barCode)
        await this.sale.add(item)
    }
}


