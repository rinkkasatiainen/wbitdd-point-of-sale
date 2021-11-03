export interface Item {
    asString: () => string;
}

export class NoItemFound implements Item{
    public asString: () => string;

    public constructor(barcode: string) {
        this.asString = () => `Product not found: ${barcode}`
    }
}

export interface Stock {
    findItem: (barcode: string) => Promise<Item>;
}
