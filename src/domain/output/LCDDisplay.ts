export interface LCDDisplay {
    addError: (error: string) => void;

    addPrice: (price: string) => Promise<void>;

    addTotal: (total: string) => void;
}
