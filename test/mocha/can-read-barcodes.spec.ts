import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {AddItemWithBarcode} from '../../src/domain/actions/addItem'
import {Item, NoItemFound, Stock} from '../../src/domain/repository/stock'
import {LCDDisplay} from '../../src/domain/output/LCDDisplay'

chai.use(sinonChai)
const item: Item = {
    price: '1,89€',
}

const fakeStock: {
    on: (barcode: string) => ({
        returns: (x: Item | NoItemFound) => Stock;
    });
} = {

    on: (barcode => ({
        returns: (resultFoundInStock) => ({
            findItem(actual) {
                if (barcode === actual) {
                    return Promise.resolve(resultFoundInStock)
                }
                throw new Error('mismatch in expectations')
            },
        }),
    })),
}

describe('AddItemWithBarcode', () => {
    let display: LCDDisplay

    beforeEach(() => {
        display = {
            addPrice: sinon.spy(),
        }
    })

    it('gets and item and sends the price to display', async () => {
        const addItem = new AddItemWithBarcode(display, fakeStock.on('123\n').returns(item))

        await addItem.onReadBarcode('123\n')

        expect(display.addPrice).to.have.been.calledWith('1,89€')
    })

    it('when there are no items', async () => {

        const noItemFound = new NoItemFound()

        const addItem = new AddItemWithBarcode(display, fakeStock.on('321\n').returns(noItemFound))

        await addItem.onReadBarcode('321\n')

        expect(display.addPrice).to.not.have.been.called
    })
})
