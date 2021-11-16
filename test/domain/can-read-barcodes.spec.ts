import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { AddItemWithBarcode } from '../../src/domain/actions/addItem'
import { Item, NoItemFound, Stock } from '../../src/domain/repository/stock'
import { LCDDisplay } from '../../src/domain/output/LCDDisplay'

chai.use(sinonChai)

interface FakeStock extends Stock {
    on: (barcode: string) => {
        returns: (x: Item | NoItemFound) => FakeStock;
    };
}

const fakeStock: (items?: Record<string, Item | NoItemFound>) => FakeStock =
    (items: Record<string, Item | NoItemFound> = {}) => ({
        findItem: (actual) => {
            if (actual in items) {
                return Promise.resolve(items[actual])
            }
            throw new Error('Stock empty')
        },
        on: (barcode => ({
            returns: (item: Item | NoItemFound) => fakeStock({ ...items, [barcode]: item }),
        })),
    })

describe('AddItemWithBarcode', () => {
    let display: LCDDisplay

    beforeEach(() => {
        display = {
            addPrice: sinon.spy(),
        }
    })

    it('gets and item and sends the price to display', async () => {
        const item: Item = {
            price: () => 1.89,
            asString: () => '1,89€',
        }
        const addItem = new AddItemWithBarcode(display, fakeStock().on('123').returns(item))

        await addItem.onReadBarcode('123')

        expect(display.addPrice).to.have.been.calledWith('1,89€')
    })

    it('when there are no items', async () => {

        const noItemFound = new NoItemFound('321')

        const addItem = new AddItemWithBarcode(display, fakeStock().on('321').returns(noItemFound))

        await addItem.onReadBarcode('321')

        expect(display.addPrice).to.have.been.calledWith('Product not found: 321')
    })


    describe('calculates total', () => {
        const getStock = (foundItem: Item) => fakeStock().on('123').returns(foundItem)

        it('with one product', async () => {
            const foundItem: Item = {
                price: () => 10.90,
                asString: () => '10,90€',
            }
            const addItem = new AddItemWithBarcode(display, getStock(foundItem))

            await addItem.onReadBarcode('123')

            const total = addItem.total()
            expect(total).to.eql(`TOTAL: ${ foundItem.asString() }`)
        })

        it('with another product', async () => {
            const foundItem: Item = {
                price: () => 10.95,
                asString: () => '10,95€',
            }
            const addItem = new AddItemWithBarcode(display, getStock(foundItem))

            await addItem.onReadBarcode('123')

            const total = addItem.total()
            expect(total).to.eql(`TOTAL: ${ foundItem.asString() }`)
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
                const addItem = new AddItemWithBarcode(display, stock)

                await addItem.onReadBarcode('123')
                await addItem.onReadBarcode('234')

                const total = addItem.total()

                expect(total).to.eql('TOTAL: 12,00€')

            })
        })
    })
})
