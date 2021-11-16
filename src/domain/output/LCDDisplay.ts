export interface LCDDisplay {
    addPrice: (price: string) => Promise<void>;

    addTotal(total: string): void;
}
