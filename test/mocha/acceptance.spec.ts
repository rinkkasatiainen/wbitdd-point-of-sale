import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import {LCDDisplay} from '../../src/domain/output/LCDDisplay'
import {AddItem, AddItemWithBarcode} from '../../src/domain/actions/addItem'
import {NoItemFound, Stock} from '../../src/domain/repository/stock'

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

const stock: Stock = {
    findItem: (barcode: string) => {
        if (barcode === '12345\n') {
            return Promise.resolve({price: '10,50€'})
        }
        return Promise.resolve(new NoItemFound())
    },
}

describe('Point of Sale system', () => {
    it('should print the price in the LCD', async () => {
        const lcdDisplay: TestSpecificLCDDisplay = new TestSpecificLCDDisplay()
        const onReadBarcode: AddItem = new AddItemWithBarcode(lcdDisplay, stock)

        await onReadBarcode.onReadBarcode('12345\n')

        const expected = lcdDisplay.lastCall()
        expect(expected).to.eql('10,50€')
    })

    it('should not print the price of an iteM that is not found', async () => {
        const lcdDisplay = new TestSpecificLCDDisplay()
        const onReadBarcode = new AddItemWithBarcode(lcdDisplay, stock)

        await onReadBarcode.onReadBarcode('54321\n')

        const expected = lcdDisplay.lastCall()
        expect(expected).to.eql(notCalledEver)
    })
})

