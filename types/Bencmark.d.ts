export interface IBenchmark {
    name: string;
    tags: string[];
    path: string;
    time: number;
}
export declare type TTag = string[] | string;
export declare const BENCHMARKS: IBenchmark[];
export declare function benchmark(name?: string, tags?: TTag, print?: boolean): (target: any, key?: string, descriptor?: PropertyDescriptor) => void;
export declare function benchmarkAsync(name?: string, tags?: TTag, print?: boolean): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function benchmarkStart(name: string, tags?: TTag): void;
export declare function benchmarkEnd(name: string, tags?: TTag, print?: boolean): IBenchmark;
export declare function benchmarkResults(name: string | null, tags?: TTag): any;
export declare function benchmarkResultsMatch(regexp: RegExp): any;
export declare function benchmarkResultsAll(): any;
