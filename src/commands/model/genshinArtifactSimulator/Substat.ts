export class Substat {
    private readonly name: string
    private rolls: number
    private value: Record<string, number> = {
        "HP": 298.75,
        "ATK": 19.45,
        "DEF": 23.15,
        "HP%": 5.83,
        "ATK%": 5.83,
        "DEF%": 7.29,
        "Energy Recharge%": 6.48,
        "Elemental Mastery": 23.31,
        "CRIT Rate%": 3.89,
        "CRIT DMG%": 7.77,
    }
    private level: number


    constructor(name: string, rolls: number|null = null, level: number = 0) {
        this.name = name
        this.rolls = rolls === null ? this.getSubstatLevel() : rolls
        this.level = level
    }

    public toString(): string {
        return this.name
    }
    public getRolls(): number {
        return this.rolls
    }
    public getLevel(): number {
        return this.level
    }
    public getRollsFormatted(): string {
        let decimalPlace = 0
        if (this.name.substring(this.name.length - 1) === "%") {
            decimalPlace = 1
        }
        return this.roundByDecimal(this.rolls, decimalPlace).toFixed(decimalPlace) + (decimalPlace === 1 ? "%" : "")
    }
    public levelRolls() {
        this.rolls = this.roundByDecimal(this.rolls + this.getSubstatLevel(), 2)
        this.level++
    }
    private getSubstatLevel(): number {

        return this.roundByDecimal((7 + Math.floor(Math.random() * 4)) * this.value[this.name] / 10, 2)
    }

    private roundByDecimal(number: number, decimal: number): number {
        return Math.round(number * 10 ** decimal) / 10 ** decimal;
    }
}