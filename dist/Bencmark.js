"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
    tags = __spreadArray([], __read(totags(tags)));
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
                    tags.push.apply(tags, __spreadArray([], __read(target.__BENCHMARK_TAGS__)));
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
    var e_1, _a;
    if (tags === void 0) { tags = null; }
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        var path = topath(name, tags);
        var calls = 0;
        var time = 0;
        try {
            for (var BENCHMARKS_1 = __values(exports.BENCHMARKS), BENCHMARKS_1_1 = BENCHMARKS_1.next(); !BENCHMARKS_1_1.done; BENCHMARKS_1_1 = BENCHMARKS_1.next()) {
                var bm = BENCHMARKS_1_1.value;
                if ((!tags && bm.name === name) || bm.path === path || !name && hasTags(bm.tags, tags)) {
                    calls++;
                    time += bm.time;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (BENCHMARKS_1_1 && !BENCHMARKS_1_1.done && (_a = BENCHMARKS_1.return)) _a.call(BENCHMARKS_1);
            }
            finally { if (e_1) throw e_1.error; }
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
    var e_2, _a;
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        var data = {};
        var calls = 0;
        var time = 0;
        try {
            for (var BENCHMARKS_2 = __values(exports.BENCHMARKS), BENCHMARKS_2_1 = BENCHMARKS_2.next(); !BENCHMARKS_2_1.done; BENCHMARKS_2_1 = BENCHMARKS_2.next()) {
                var bm = BENCHMARKS_2_1.value;
                if (regexp.test(bm.name) && !data[bm.name]) {
                    data[bm.name] = benchmarkResults(bm.name);
                    calls += data[bm.name].calls;
                    time += data[bm.name].time;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (BENCHMARKS_2_1 && !BENCHMARKS_2_1.done && (_a = BENCHMARKS_2.return)) _a.call(BENCHMARKS_2);
            }
            finally { if (e_2) throw e_2.error; }
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
    var e_3, _a;
    if (VisionHelper_1.VisionHelper.doBenchmark) {
        var data = {};
        var calls = 0;
        var time = 0;
        try {
            for (var BENCHMARKS_3 = __values(exports.BENCHMARKS), BENCHMARKS_3_1 = BENCHMARKS_3.next(); !BENCHMARKS_3_1.done; BENCHMARKS_3_1 = BENCHMARKS_3.next()) {
                var bm = BENCHMARKS_3_1.value;
                if (!data[bm.name]) {
                    var name_1 = bm.path ? bm.name + "." + bm.path : bm.name;
                    data[name_1] = benchmarkResults(bm.name, bm.tags);
                    calls += data[name_1].calls;
                    time += data[name_1].time;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (BENCHMARKS_3_1 && !BENCHMARKS_3_1.done && (_a = BENCHMARKS_3.return)) _a.call(BENCHMARKS_3);
            }
            finally { if (e_3) throw e_3.error; }
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