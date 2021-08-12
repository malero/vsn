export interface IBenchmark {
    name: string;
    time: number;
}
export declare const BENCHMARKS: IBenchmark[];
export declare function benchmark(name?: string, print?: boolean): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function benchmarkResults(name: string): any;
export declare function benchmarkResultsMatch(regexp: RegExp): any;
export declare function benchmarkResultsAll(): any;
