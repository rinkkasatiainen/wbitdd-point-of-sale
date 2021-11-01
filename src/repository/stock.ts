export interface Item {
    price: string;
}

export class NoItemFound {
}

export interface Stock {
    findItem: (barcode: string) => Promise<Item>
}