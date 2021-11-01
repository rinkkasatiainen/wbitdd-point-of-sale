export interface Item {
}

export class NoItemFound {
}

export interface Stock {
    findItem: (barcode: string) => Promise<Item | NoItemFound>
}