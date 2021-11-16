interface IPrice {
    plus: (other: Price) => Price;
    asString: () => string;
}

export class Price implements IPrice{
    private readonly cents: number
    private readonly euros: number

    public constructor(price: number) {
        this.cents = (price * 100) % 100
        this.euros = this.getEuros(price)
    }

    public plus(other: Price): Price {
        const cents = (this.cents + other.cents) / 100
        const euros = this.euros + other.euros
        return new Price(euros + cents)
    }

    public asString(): string {
        let centsStr = `${(this.cents.toPrecision(2))}`
        if (this.cents < 10){
            centsStr = `0${this.cents.toPrecision(1)}`
        }
        return `${this.euros},${centsStr}`
    }

    private getEuros(price: number) {
        return ((price * 100) - this.cents) / 100
    }

}
