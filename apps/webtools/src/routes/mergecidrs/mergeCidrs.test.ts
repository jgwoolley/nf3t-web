import assert from "node:assert/strict";
import { test } from "node:test";
import { deduplicateCIDRs, mergeCIDRs } from "./mergeCidrs";

test("drops a CIDR contained in a larger one", () => {
    assert.deepEqual(deduplicateCIDRs(["1.1.0.0/24", "1.1.0.0/16"]), ["1.1.0.0/16"]);
    assert.deepEqual(deduplicateCIDRs(["10.0.0.0/24", "10.0.0.0/8"]), ["10.0.0.0/8"]);
});

test("merges adjacent CIDRs", () => {
    assert.deepEqual(deduplicateCIDRs(["198.0.0.0/24", "198.0.1.0/24"]), ["198.0.0.0/23"]);
    assert.deepEqual(deduplicateCIDRs(["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]), ["10.0.0.0/22"]);
    assert.deepEqual(deduplicateCIDRs(["10.1.1.0/31", "10.1.1.2/31"]), ["10.1.1.0/30"]);
});

test("keeps ranges that cannot be expressed as one CIDR as several", () => {
    assert.deepEqual(deduplicateCIDRs(["127.0.0.1/32", "127.0.0.2/32", "127.0.0.3/32"]), ["127.0.0.1/32", "127.0.0.2/31"]);
    assert.deepEqual(deduplicateCIDRs(["10.1.2.2/31", "10.1.2.4/31"]), ["10.1.2.2/31", "10.1.2.4/31"]);
});

test("does not merge separate ranges", () => {
    assert.deepEqual(deduplicateCIDRs(["1.1.0.0/24", "10.0.255.0/24"]), ["1.1.0.0/24", "10.0.255.0/24"]);
});

test("handles the whole address space and 0.0.0.0", () => {
    assert.deepEqual(deduplicateCIDRs(["0.0.0.0/0"]), ["0.0.0.0/0"]);
    assert.deepEqual(deduplicateCIDRs(["0.0.0.0/32"]), ["0.0.0.0/32"]);
    assert.deepEqual(deduplicateCIDRs(["255.255.255.255/32", "255.255.255.254/32"]), ["255.255.255.254/31"]);
    assert.deepEqual(deduplicateCIDRs(["128.0.0.0/1", "0.0.0.0/1"]), ["0.0.0.0/0"]);
});

test("ignores host bits", () => {
    assert.deepEqual(deduplicateCIDRs(["10.0.0.5/24"]), ["10.0.0.0/24"]);
});

test("is order and duplicate insensitive", () => {
    assert.deepEqual(deduplicateCIDRs(["10.0.1.0/24", "10.0.0.0/24", "10.0.1.0/24"]), ["10.0.0.0/23"]);
});

test("empty and invalid input does not throw", () => {
    assert.deepEqual(mergeCIDRs([]), { cidrs: [], invalid: [] });
    assert.deepEqual(mergeCIDRs(["", "  "]), { cidrs: [], invalid: [] });
    assert.deepEqual(mergeCIDRs(["hello/3", "1.2.3/24", "1.2.3.4", "1.2.3.4/33", "256.0.0.0/8", "1.1.1.0/24"]), {
        cidrs: ["1.1.1.0/24"],
        invalid: ["hello/3", "1.2.3/24", "1.2.3.4", "1.2.3.4/33", "256.0.0.0/8"],
    });
});
