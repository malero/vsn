import {VisionHelper} from "./helpers/VisionHelper";

export interface IBenchmark {
    name: string;
    time: number;
}
export const BENCHMARKS: IBenchmark[] = [];

export function benchmark(name?: string, print: boolean = false) {
    return function(target: any, key: string, descriptor: PropertyDescriptor): void {
        if (VisionHelper.inDevelopment) {
            name = name || key;
            const method: (...args: any[]) => any = descriptor.value;

            descriptor.value = function (): any {
                const start: Date = new Date();
                const result = method.apply(this, arguments);
                const end: Date = new Date();
                const data = {
                    name: name,
                    time: end.getTime() - start.getTime()
                };
                BENCHMARKS.push(data);

                if (print)
                    console.log(data);

                return result;
            };
        }
    };
}

export function benchmarkResults(name: string): any {
    if (VisionHelper.inDevelopment) {
        let calls: number = 0;
        let time: number = 0;
        for (const bm of BENCHMARKS)
            if (bm.name === name) {
                calls++;
                time += bm.time;
            }

        return {
            name: name,
            calls: calls,
            time: time,
            average: time / calls
        };
    }
}

export function benchmarkResultsMatch(regexp: RegExp): any {
    if (VisionHelper.inDevelopment) {
        const data: any = {};
        let calls: number = 0;
        let time: number = 0;
        for (const bm of BENCHMARKS) {
            if (regexp.test(bm.name) && !data[bm.name]) {
                data[bm.name] = benchmarkResults(bm.name);
                calls += data[bm.name].calls;
                time += data[bm.name].time;
            }
        }

        data['ALL'] = {
            name: 'ALL',
            calls: calls,
            time: time,
            average: time / calls
        };

        return data;
    }
}

export function benchmarkResultsAll(): any {
    if (VisionHelper.inDevelopment) {
        console.log('wut');
        const data: any = {};
        let calls: number = 0;
        let time: number = 0;
        for (const bm of BENCHMARKS) {
            if (!data[bm.name]) {
                data[bm.name] = benchmarkResults(bm.name);
                calls += data[bm.name].calls;
                time += data[bm.name].time;
            }
        }

        data['ALL'] = {
            name: 'ALL',
            calls: calls,
            time: time,
            average: time / calls
        };

        return data;
    }
}

if (VisionHelper.inDevelopment && VisionHelper.window) {
    window['benchmark'] = benchmark;
    window['benchmarks'] = BENCHMARKS;
    window['benchmarkResults'] = benchmarkResults;
    window['benchmarkResultsMatch'] = benchmarkResultsMatch;
    window['benchmarkResultsAll'] = benchmarkResultsAll;
}

