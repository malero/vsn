
export abstract class Section {
    public readonly fYeah = true;
    abstract get sectionTypes(): number[];
    abstract get sectionExport(): number[];
}
