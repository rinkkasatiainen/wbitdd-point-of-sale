export interface LCDDisplay {
    addPrice: (price: string) => Promise<void>;
}
