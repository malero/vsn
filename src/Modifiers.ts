
export class Modifier {
    public readonly name: string;
    public readonly arguments: string[];

    constructor(modifier: string) {
        const [name, ...args] = modifier.split(',');
        this.name = name;
        this.arguments = args;
    }

    public getArguments(fallback: string[] = []): string[] {
        return this.arguments.length ? this.arguments : fallback;
    }
}

export class Modifiers {
    protected modifiers: Map<string, Modifier> = new Map<string, Modifier>();

    constructor(modifiers: string[] = []) {
        for (const modifier of modifiers) {
            this.add(modifier);
        }
    }

    public add(modifier: string) {
        const m = new Modifier(modifier);
        this.modifiers.set(m.name, m);
    }

    public has(name: string): boolean {
        return this.modifiers.has(name);
    }

    public get(name: string): Modifier {
        return this.modifiers.get(name);
    }

    public get iter(): Modifier[] {
        return Array.from(this.modifiers.values());
    }

    public get names(): string[] {
        return this.iter.map(m => m.name);
    }

    public get length(): number {
        return this.modifiers.size;
    }

    public static fromAttribute(attribute: string): Modifiers {
        return new Modifiers(attribute.split('|').splice(1));
    }
}
