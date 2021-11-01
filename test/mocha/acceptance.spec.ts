import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import {LCDDisplay} from '../../src/domain/output/LCDDisplay'
import {AddItem, AddItemWithBarcode} from '../../src/actions/addItem'
import {NoItemFound, Stock} from '../../src/repository/stock'

chai.use(sinonChai)

class TestSpecificLCDDisplay implements LCDDisplay {
    public lastCall() {
        return ''
    }
}

describe('Point of Sale system', () => {

    xit('should do stuff', async () => {
        const lcdDisplay: TestSpecificLCDDisplay = new TestSpecificLCDDisplay()

        const stock: Stock = {
            findItem: (barcode: string) => {
                if (barcode === '12345\n') {
                    return Promise.resolve({price: '10,50€'})
                }
                return Promise.resolve(new NoItemFound())
            },
        }
        const onReadBarcode: AddItem = new AddItemWithBarcode(lcdDisplay, stock)

        await onReadBarcode.onReadBarcode('12345\n')

        const expected = lcdDisplay.lastCall()

        expect(expected).to.eql('10,50€')
    })
})

