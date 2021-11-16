import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
import { ListensToSaleEvents } from '../../src/domain/output/ListensToSaleEvents'
import { AddItem, AddItemWithBarcode } from '../../src/domain/actions/addItem'
import { Item, NoItemFound, Stock } from '../../src/domain/repository/stock'

chai.use(sinonChai)
const notCalledEver = '-1.999€'

class TestSpecificLCDDisplay implements ListensToSaleEvents {
    private lastPrice: string = notCalledEver

    public lastCall() {
        return this.lastPrice
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async addPrice(price: string) {
        this.lastPrice = price
    }

    public addError(error: string): void {
    }

    public addTotal(total: string): void {
    }
}

const fakeStockWith: (barcodesByPrice: Record<string, Item>) => Stock =
    (barcodesByPrice) => ({
        findItem: (barcode: string) => {
            if (barcode in barcodesByPrice) {
                return Promise.resolve(barcodesByPrice[barcode])
            }
            return Promise.resolve(new NoItemFound(barcode))
        },
    })


const getItem: (price: number, asString: string) => Item = (price, asString) => ({
    price: () => price,
    asString: () => asString,
})

describe('Point of Sale system', () => {
    it('should print the price in the LCD', async () => {
        const stock = fakeStockWith({ 12345: getItem(10.50, '10,50€') })
        const lcdDisplay: TestSpecificLCDDisplay = new TestSpecificLCDDisplay()
        const onReadBarcode: AddItem = new AddItemWithBarcode(lcdDisplay, stock)

        await onReadBarcode.onReadBarcode('12345')

        const expected = lcdDisplay.lastCall()
        expect(expected).to.eql('10,50€')
    })

    it('should not print the price of an iteM that is not found', async () => {
        const stock = fakeStockWith({ 12345: getItem(10.50, '10,50€') })
        const lcdDisplay = new TestSpecificLCDDisplay()
        const onReadBarcode = new AddItemWithBarcode(lcdDisplay, stock)

        await onReadBarcode.onReadBarcode('54321')

        const expected = lcdDisplay.lastCall()
        expect(expected).to.eql('Product not found: 54321')
    })

    describe('can sell multiple items', () => {

        it('should print the total and individual prices', async () => {
            const stock = fakeStockWith(
                {
                    12345: getItem(10.50, '10,50€'),
                    23456: getItem(1.40, '1,40€'),
                    34567: getItem(17.15, '17,05€'),
                },
            )
            const lcdDisplay = new TestSpecificLCDDisplay()
            const onReadBarcode = new AddItemWithBarcode(lcdDisplay, stock)

            await onReadBarcode.onReadBarcode('12345')
            await onReadBarcode.onReadBarcode('23456')
            await onReadBarcode.onReadBarcode('34567')

            // const pointOfSale
            // const expected = await pointOfSale.total()

            // expect(expected).to.eql('Product not found: 54321')
        })


        // 0, 1, many, ∞, 💥
        it('should print total even if one item is not found')
        it('can be possible to override price of an item')
        it('pressing total when no items read, should not do a thing')
        it('when empty barcode!')
        it('should notify if product is not found')
    })
})

