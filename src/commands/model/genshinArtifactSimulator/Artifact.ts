import {Substat} from "./Substat";
import {Mainstat} from "./Mainstat";
import {ArtifactType} from "./ArtifactType";

export class Artifact {
    private readonly location: string
    private stats: Record<string, [string, number][]> = {
        "Flower": [
            ["HP", 1200]
        ],
        "Feather":[
            ["ATK", 1200]
        ],
        "Sands": [
            ["HP%", 320],
            ["ATK%", 320],
            ["DEF%", 320],
            ["Energy Recharge%", 120],
            ["Elemental Mastery", 120]
        ],
        "Goblet": [
            ["HP%", 231],
            ["ATK%", 231],
            ["DEF%", 228],
            ["Pyro DMG Bonus%", 60],
            ["Electro DMG Bonus%", 60],
            ["Cryo DMG Bonus%", 60],
            ["Hydro DMG Bonus%", 60],
            ["Dendro DMG Bonus%", 60],
            ["Anemo DMG Bonus%", 60],
            ["Geo DMG Bonus%", 60],
            ["Physical DMG Bonus%", 60],
            ["Elemental Mastery", 30],
        ],
        "Circlet": [
            ["HP%", 264],
            ["ATK%", 264],
            ["DEF%", 264],
            ["CRIT Rate%", 120],
            ["CRIT DMG%", 120],
            ["Healing Bonus%", 120],
            ["Elemental Mastery", 48]
        ]
    }
    private availableSubstats: [string, number][] = [
        ["HP", 6],
        ["ATK", 6],
        ["DEF", 6],
        ["HP%", 4],
        ["ATK%", 4],
        ["DEF%", 4],
        ["Energy Recharge%", 4],
        ["Elemental Mastery", 4],
        ["CRIT Rate%", 3],
        ["CRIT DMG%", 3]
    ]
    private types: string[] = [
        "Flower",
        "Feather",
        "Sands",
        "Goblet",
        "Circlet"
    ]
    type: ArtifactType
    set: string
    mainstat: Mainstat
    substats: Substat[]

    constructor(
        firstSet: string,
        secondSet: string|null = null,
        artifactType: string|null = null,
        mainstat: [string, number]|null = null,
        substats: [string, number, number][] = []
    ) {
        this.location = secondSet === null ? "Strongbox" : "Domain"
        this.set = secondSet === null ? firstSet : Math.random() < 0.5 ? firstSet : secondSet
        this.type = artifactType === null ? new ArtifactType(this.types[Math.floor(Math.random() * 5)]) : new ArtifactType(artifactType)
        this.mainstat = mainstat === null ? this.generateMainstat(this.type) : new Mainstat(mainstat[0], mainstat[1])
        if (substats.length > 0) {
            this.substats = []
            for(let i = 0; i < substats.length; i++) {
                this.substats.push(new Substat(substats[i][0], substats[i][1], substats[i][2]))
            }
        } else {
            this.substats = this.generateSubstats(this.mainstat)
        }
    }

    public getSubstatValues(): [string, number, number][] {
        let substats : [string, number, number][] = []
        this.substats.forEach(substat => substats.push([substat.toString(), substat.getRolls(), substat.getLevel()]))
        return substats
    }

    public levelArtifact() {
        if (this.mainstat.getLevel() < 20) {
            this.mainstat.levelUp()
            if (this.mainstat.getLevel() % 4 === 0) {
                this.levelSubstats()
            }
        }
    }
    private levelSubstats() {
        if (this.substats.length === 3) {
            let substat: Substat = this.generateSubstat(this.mainstat, this.substats)
            if(substat.toString() !== "Error") {
                this.substats.push(substat)
            }
        } else {
            this.substats[Math.floor(Math.random()*4)].levelRolls()
        }
    }

    private generateMainstat(type: ArtifactType): Mainstat {
        let mainstats: [string, number][] = this.stats[type.toString()]
        let randomNumber: number = Math.random() * 1200
        let acc: number = 0
        for (let i: number = 0; i < mainstats.length; i++) {
            acc += mainstats[i][1]
            if (randomNumber <= acc) {
                return new Mainstat(mainstats[i][0])
            }
        }
        // shouldn't ever get to this point but if it does, it's at Lvl -1 so that I know it's a wrong artifact
        return new Mainstat("Error", -1)
    }
    // Only called when initializing artifact, not when artifact exists already
    private generateSubstats(mainstat: Mainstat, substats: Substat[] = []): Substat[] {
        let sourceDifference = this.location === "Strongbox" ? 10 : 12
        let substatAmount = Math.random() * 15 > sourceDifference ? 4 : 3
        while (substats.length < substatAmount) {
            let substat: Substat = this.generateSubstat(mainstat, substats)
            if(substat.toString() !== "Error") {
                substats.push(substat)
            }
        }
        return substats
    }

    private generateSubstat(mainstat: Mainstat, substats: Substat[]): Substat {
        let availableSubstats = this.availableSubstats.filter(value => {
            let substatsToString = substats.map(value => value.toString())
            return value[0] !== mainstat.toString() && !substatsToString.includes(value[0])
        })
        let weightedChance = availableSubstats.reduce((a, b) => a + b[1], 0)
        let randomNumber: number = Math.random() * weightedChance
        let acc: number = 0
        for (let i: number = 0; i < availableSubstats.length; i++) {
            acc += availableSubstats[i][1]
            if (randomNumber <= acc) {
                return new Substat(availableSubstats[i][0])
            }
        }
        // Same as in Mainstat, if Substat value is unplausible, replace it
        return new Substat("Error")
    }
}