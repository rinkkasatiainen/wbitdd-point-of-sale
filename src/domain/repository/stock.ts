export interface Item {
    price: string;
}

export class NoItemFound {
    public price: string;

    public constructor(barcode: string) {
        this.price = `Product not found: ${barcode}`
    }
}

export interface Stock {
    findItem: (barcode: string) => Promise<Item | NoItemFound>;
}
