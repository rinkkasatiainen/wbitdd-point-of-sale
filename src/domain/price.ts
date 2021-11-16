export class Price {
    public readonly cents: number
    public readonly euros: number
    public readonly centsStr: string

    public constructor(price: number) {
        this.cents = (price * 100) % 100
        this.centsStr = this.cents.toPrecision(2).split('.').join('')
        this.euros = this.getEuros(price)
    }

    public plus(other: Price): Price {
        const cents = (this.cents + other.cents) / 100
        const euros = this.euros + other.euros
        return new Price(euros + cents)
    }

    private getEuros(price: number) {
        return ((price * 100) - this.cents) / 100
    }
}
