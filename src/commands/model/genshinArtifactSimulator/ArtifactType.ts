export class ArtifactType {
    type: string

    constructor(type: string) {
        this.type = type
    }

    public toString(): string {
        return this.type
    }
}