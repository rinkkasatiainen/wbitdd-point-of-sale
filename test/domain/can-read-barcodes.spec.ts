import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {AddItemWithBarcode} from '../../src/domain/actions/addItem'
import {Item, NoItemFound, Stock} from '../../src/domain/repository/stock'
import {LCDDisplay} from '../../src/domain/output/LCDDisplay'

chai.use(sinonChai)

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
        const item: Item = {
            asString: () => '1,89€',
        }
        const addItem = new AddItemWithBarcode(display, fakeStock.on('123').returns(item))

        await addItem.onReadBarcode('123')

        expect(display.addPrice).to.have.been.calledWith('1,89€')
    })

    it('when there are no items', async () => {

        const noItemFound = new NoItemFound('321')

        const addItem = new AddItemWithBarcode(display, fakeStock.on('321').returns(noItemFound))

        await addItem.onReadBarcode('321')

        expect(display.addPrice).to.have.been.calledWith('Product not found: 321')
    })


    describe('calculates total', () => {
        it('with one product', async () => {
            const foundItem: Item = {
                asString: () => '10,90€',
            }
            const addItem = new AddItemWithBarcode(display, fakeStock.on('123').returns(foundItem))

            await addItem.onReadBarcode('123')

            const total = addItem.total()
            expect( total ).to.eql( `TOTAL: ${foundItem.asString()}`)
        })
        it('with another product', async () => {
            const foundItem: Item = {
                asString: () => '10,90€',
            }
            const addItem = new AddItemWithBarcode(display, fakeStock.on('123').returns(foundItem))

            await addItem.onReadBarcode('123')

            const total = addItem.total()
            expect( total ).to.eql( `TOTAL: ${foundItem.asString()}`)
        })

    })
})
