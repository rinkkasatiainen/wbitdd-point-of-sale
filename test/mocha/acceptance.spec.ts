import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
import { LCDDisplay } from '../../src/domain/output/LCDDisplay'
import { AddItem, AddItemWithBarcode } from '../../src/domain/actions/addItem'
import { NoItemFound, Stock } from '../../src/domain/repository/stock'

chai.use(sinonChai)
const notCalledEver = '-1.999€'

class TestSpecificLCDDisplay implements LCDDisplay {
    private lastPrice: string = notCalledEver

    public lastCall() {
        return this.lastPrice
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async addPrice(price: string) {
        this.lastPrice = price
    }
}

const fakeStockWith: (barcodesByPrice: Record<string, string>) => Stock =
    (barcodesByPrice) => ({
        findItem: (barcode: string) => {
            if (barcode in barcodesByPrice) {
                return Promise.resolve({ asString: () => barcodesByPrice[barcode] })
            }
            return Promise.resolve(new NoItemFound(barcode))
        },
    })


describe('Point of Sale system', () => {
    it('should print the price in the LCD', async () => {
        const stock = fakeStockWith({ 12345: '10,50€' })
        const lcdDisplay: TestSpecificLCDDisplay = new TestSpecificLCDDisplay()
        const onReadBarcode: AddItem = new AddItemWithBarcode(lcdDisplay, stock)

        await onReadBarcode.onReadBarcode('12345')

        const expected = lcdDisplay.lastCall()
        expect(expected).to.eql('10,50€')
    })

    it('should not print the price of an iteM that is not found', async () => {
        const stock = fakeStockWith({ 12345: '10.45' })
        const lcdDisplay = new TestSpecificLCDDisplay()
        const onReadBarcode = new AddItemWithBarcode(lcdDisplay, stock)

        await onReadBarcode.onReadBarcode('54321')

        const expected = lcdDisplay.lastCall()
        expect(expected).to.eql('Product not found: 54321')
    })

    describe('can sell multiple items', () => {

        it.skip('should print the total and individual prices', async () => {
            const stock = fakeStockWith(
                {
                    12345: '10.45',
                    23456: '1.40',
                    34567: '81.10',
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
        it( 'when empty barcode!')
    })
})

