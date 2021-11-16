export interface Item {
    price: () => number
    asString: () => string;
}

export class NoItemFound implements Item{
    public asString: () => string;
    public price: () => number;

    public constructor(barcode: string) {
        this.asString = () => `Product not found: ${barcode}`
        this.price = () => 0
    }
}

export interface Stock {
    findItem: (barcode: string) => Promise<Item>;

}
