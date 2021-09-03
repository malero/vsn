"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmarkResultsAll = exports.benchmarkResultsMatch = exports.benchmarkResults = exports.benchmarkEnd = exports.benchmarkStart = exports.benchmark = exports.BENCHMARKS = void 0;
var VisionHelper_1 = require("./helpers/VisionHelper");
exports.BENCHMARKS = [];
var BENCHMARK_STARTS = {};
function totags(tags) {
    tags = tags instanceof Array ? tags : tags && [tags] || [];
    return tags.map(function (tag) { return tag.toLowerCase(); });
}
function topath(name, tags) {
    tags = __spreadArray([], totags(tags));
    tags.sort();
    return tags.length && (name + "." + tags.join('.')).toLowerCase() || name && name.toLowerCase() || 'nopath';
}
function todata(name, tags, timeOrStart, end) {
    if (end === void 0) { end = null; }
    if (end instanceof Date || Number.isFinite(end)) {
        if (!Number.isFinite(timeOrStart) && timeOrStart instanceof Date)
            timeOrStart = timeOrStart.getTime();
        if (!Number.isFinite(end) && end instanceof Date)
            end = end.getTime();
        timeOrStart = end - timeOrStart;
    }
    tags = totags(tags);
    return {
        name: name,
        tags: tags,
        path: topath(name, tags),
        time: timeOrStart
    };
}
function hasTags(fullList, toMatch) {
    fullList = totags(fullList);
    toMatch = totags(toMatch);
    for (var tag in toMatch) {
        if (fullList.indexOf(tag) === -1)
            return false;
    }
    return true;
}
function benchmark(name, tags, print) {
    if (print === void 0) { print = false; }
    return function (target, key, descriptor) {
        if (VisionHelper_1.VisionHelper.doBenchmark) {
            var method_1 = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                name = target.__BENCHMARK_NAME__ || name || key;
                tags = totags(tags);
                if (target.__BENCHMARK_NAME__ || target.__BENCHMARK_TAGS__) {
                    tags.push(name || key);
                    tags.push.apply(tags, target.__BENCHMARK_TAGS__);
                }
                var start = new Date();
                var result = method_1.apply(this, args);
                var end = new Date();
                var data = todata(name, tags, start, end);
                exports.BENCHMARKS.push(data);
                if (print)
                    console.log(data);
                return result;
            };
        }
    };
}
exports.benchmark = benchmark;
function benchmarkStart(name, tags) {
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        name = topath(name, tags);
        BENCHMARK_STARTS[name] = new Date();
    }
}
exports.benchmarkStart = benchmarkStart;
function benchmarkEnd(name, tags, print) {
    if (print === void 0) { print = null; }
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        var path = topath(name, tags);
        var start = BENCHMARK_STARTS[path];
        var end = new Date();
        var data = todata(name, tags, start, end);
        exports.BENCHMARKS.push(data);
        if (print || (print === null && data.time > 10)) {
            var debugName = data.path ? name + "[" + data.path + "]" : name;
            console.warn(debugName + " took " + data.time + "ms to complete.");
        }
        // Benchmark chaining
        benchmarkStart(name);
        return data;
    }
}
exports.benchmarkEnd = benchmarkEnd;
function benchmarkResults(name, tags) {
    if (tags === void 0) { tags = null; }
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        var path = topath(name, tags);
        var calls = 0;
        var time = 0;
        for (var _i = 0, BENCHMARKS_1 = exports.BENCHMARKS; _i < BENCHMARKS_1.length; _i++) {
            var bm = BENCHMARKS_1[_i];
            if ((!tags && bm.name === name) || bm.path === path || !name && hasTags(bm.tags, tags)) {
                calls++;
                time += bm.time;
            }
        }
        return {
            name: name,
            calls: calls,
            time: time,
            average: time / calls
        };
    }
}
exports.benchmarkResults = benchmarkResults;
function benchmarkResultsMatch(regexp) {
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        var data = {};
        var calls = 0;
        var time = 0;
        for (var _i = 0, BENCHMARKS_2 = exports.BENCHMARKS; _i < BENCHMARKS_2.length; _i++) {
            var bm = BENCHMARKS_2[_i];
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
exports.benchmarkResultsMatch = benchmarkResultsMatch;
function benchmarkResultsAll() {
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        var data = {};
        var calls = 0;
        var time = 0;
        for (var _i = 0, BENCHMARKS_3 = exports.BENCHMARKS; _i < BENCHMARKS_3.length; _i++) {
            var bm = BENCHMARKS_3[_i];
            if (!data[bm.name]) {
                var name_1 = bm.path ? bm.name + "." + bm.path : bm.name;
                data[name_1] = benchmarkResults(bm.name, bm.tags);
                calls += data[name_1].calls;
                time += data[name_1].time;
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
exports.benchmarkResultsAll = benchmarkResultsAll;
if (VisionHelper_1.VisionHelper.doBenchmark && VisionHelper_1.VisionHelper.window) {
    window['benchmark'] = benchmark;
    window['benchmarks'] = exports.BENCHMARKS;
    window['benchmarkStart'] = benchmarkStart;
    window['benchmarkEnd'] = benchmarkEnd;
    window['benchmarkResults'] = benchmarkResults;
    window['benchmarkResultsMatch'] = benchmarkResultsMatch;
    window['benchmarkResultsAll'] = benchmarkResultsAll;
}
//# sourceMappingURL=Bencmark.js.map