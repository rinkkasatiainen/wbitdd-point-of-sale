export interface Item {
    price: () => number;
    asString: () => string;
}

export enum BarCodeReadErrorType {
    EmptyBarcode = 'EmptyBarcode'
}
export interface BarCodeReadError<T extends BarCodeReadErrorType> { _type: T}

export class EmptyBarCode implements BarCodeReadError<BarCodeReadErrorType.EmptyBarcode>{
    public _type: BarCodeReadErrorType.EmptyBarcode

    public constructor() {
        this._type = BarCodeReadErrorType.EmptyBarcode
    }
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
    findItem: (barcode: string) => Promise<Item | BarCodeReadError<BarCodeReadErrorType>>;

}
