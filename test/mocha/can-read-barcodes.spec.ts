import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {AddItemWithBarcode} from '../../src/actions/addItem'
import {Item, Stock} from '../../src/repository/stock'
import {LCDDisplay} from '../../src/domain/output/LCDDisplay'

chai.use(sinonChai)
const item: Item = {
    price: '1,89€',
}
const stock: Stock = {
    findItem() {
        return Promise.resolve(item)
    },
}

const display: LCDDisplay = {
    addPrice: sinon.spy(),
}
describe('AddItemWithBarcode', () => {

    it('gets and item and sends the price to display', async () => {
        const addItem = new AddItemWithBarcode(display, stock)

        await addItem.onReadBarcode('123\n')

        expect(display.addPrice).to.have.been.calledWith('1,89€')
    })

})
