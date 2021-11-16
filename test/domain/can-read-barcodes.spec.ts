import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { AddItemWithBarcode } from '../../src/domain/actions/addItem'
import { EmptyBarCode, Item, NoItemFound, Stock } from '../../src/domain/repository/stock'
import { ListensToSaleEvents } from '../../src/domain/output/ListensToSaleEvents'
import { Sale } from '../../src/domain/sale'

chai.use(sinonChai)

interface FakeStock extends Stock {
    on: (barcode: string) => {
        returns: (x: Item | NoItemFound) => FakeStock;
    };
}

const fakeStock: (items?: Record<string, EmptyBarCode | Item>) => FakeStock =
    (items = {}) => ({
        findItem: (barcode) => {
            if (barcode === '') {
                return Promise.resolve(new EmptyBarCode())
            }
            if (barcode in items) {
                return Promise.resolve(items[barcode])
            }
            return Promise.resolve(new NoItemFound(barcode))
        },
        on: (barcode => ({
            returns: (item: Item | NoItemFound) => fakeStock({ ...items, [barcode]: item }),
        })),
    })

function getDisplay(): ListensToSaleEvents {
    return {
        addError: sinon.spy(),
        addPrice: sinon.spy(),
        addTotal: sinon.spy(),
    }
}

describe('AddItemWithBarcode', () => {
    let display: ListensToSaleEvents
    let sale: Sale
    beforeEach(() => {
        display = getDisplay()
        sale = new Sale(display)
    })

    describe('Reading barcodes', () => {
        it('gets and item and sends the price to display', async () => {
            const item: Item = {
                price: () => 1.89,
                asString: () => '1,89€',
            }
            const addItem = new AddItemWithBarcode(display, fakeStock().on('123').returns(item), sale)

            await addItem.onReadBarcode('123')

            expect(display.addPrice).to.have.been.calledWith('1,89€')
        })

        it('when there are no items', async () => {

            const noItemFound = new NoItemFound('321')

            const addItem = new AddItemWithBarcode(display, fakeStock().on('321').returns(noItemFound), sale)

            await addItem.onReadBarcode('321')

            expect(display.addPrice).to.have.been.calledWith('Product not found: 321')
        })

        it('displays EmptyBarCodeError', async () => {
            // eslint-disable-next-line no-undef
            const addItem = new AddItemWithBarcode(display, fakeStock(), sale)

            await addItem.onReadBarcode('')

            expect(display.addError).to.have.been.calledWith('Empty barcode')
        })
    })

    describe('calculates total', () => {
        it('with one product', async () => {
            const foundItem: Item = {
                price: () => 10.90,
                asString: () => '10,90€',
            }
            const addItem = new AddItemWithBarcode(display, fakeStock().on('123').returns(foundItem), sale)

            await addItem.onReadBarcode('123')
            sale.total()

            expect(display.addTotal).to.have.been.calledWith(`TOTAL: ${ foundItem.asString() }`)
        })

        it('with another product', async () => {
            const foundItem: Item = {
                price: () => 10.05,
                asString: () => '10,05€',
            }
            const addItem = new AddItemWithBarcode(display, fakeStock().on('123').returns(foundItem), sale)

            await addItem.onReadBarcode('123')
            sale.total()

            expect(display.addTotal).to.have.been.calledWith(`TOTAL: ${ foundItem.asString() }`)
        })

        it('shows error, if no products', () => {
            sale.total()

            expect(display.addError).to.have.been.calledWith('No Scanned Products')
            expect(display.addTotal).to.not.have.been.called
        })

        it('shows error, if no products', async () => {
            const addItem = new AddItemWithBarcode(display, fakeStock(), sale)

            await addItem.onReadBarcode('123')
            sale.total()

            expect(display.addError).to.have.been.calledWith('No Scanned Products')
            expect(display.addTotal).to.not.have.been.called
        })

        describe('with multiple items', () => {
            const item123: Item = {
                price: () => 10.90,
                asString: () => '10,90€',
            }
            const item234: Item = {
                price: () => 1.10,
                asString: () => '1,10€',
            }
            it('sums up the total', async () => {
                const stock = fakeStock().on('123').returns(item123).on('234').returns(item234)
                const addItem = new AddItemWithBarcode(display, stock, sale)

                await addItem.onReadBarcode('123')
                await addItem.onReadBarcode('234')

                sale.total()

                expect(display.addTotal).to.have.been.calledWith('TOTAL: 12,00€')
            })
        })
    })

    // 0, 1, many, ∞, 💥
    it('should print total even if one item is not found')
    it('can be possible to override price of an item')
    it('pressing total when no items read, should not do a thing')
    it('when empty barcode!')
    it('should notify if product is not found')

})
