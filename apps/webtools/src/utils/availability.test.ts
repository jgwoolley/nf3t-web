import assert from "node:assert/strict";
import { test } from "node:test";
import { availabilityPercent, downtimeHoursForAvailability, downtimeToHours, formatAvailability, formatDowntime, isValidDowntimeHours } from "./availability";

test("converts units to hours", () => {
    assert.equal(downtimeToHours(2, "days"), 48);
    assert.equal(downtimeToHours(90, "minutes"), 1.5);
    assert.equal(downtimeToHours(3600, "seconds"), 1);
});

test("availability matches the common SLA targets", () => {
    for (const target of [99, 99.9, 99.99, 99.999]) {
        const hours = downtimeHoursForAvailability(target);
        assert.equal(formatAvailability(availabilityPercent(hours)), `${target}%`);
    }
    assert.equal(Number(downtimeHoursForAvailability(99).toPrecision(10)), 87.6);
    assert.equal(formatAvailability(availabilityPercent(0)), "100%");
});

test("formats downtime, including values under a minute", () => {
    assert.equal(formatDowntime(0), "0 downtime");
    assert.equal(formatDowntime(downtimeToHours(30, "seconds")), "30 seconds per year");
    assert.equal(formatDowntime(downtimeToHours(1, "seconds")), "1 second per year");
    assert.equal(formatDowntime(8.76), "8 hours, 45 minutes, 36 seconds per year");
    assert.equal(formatDowntime(downtimeToHours(59.9999, "minutes")), "1 hour per year");
    assert.equal(formatDowntime(25), "1 day, 1 hour per year");
});

test("does not round very high availability to 100%", () => {
    assert.equal(formatAvailability(availabilityPercent(downtimeToHours(5, "seconds"))), "99.9999841%");
});

test("rejects downtime longer than a year or negative", () => {
    assert.equal(isValidDowntimeHours(8760), true);
    assert.equal(isValidDowntimeHours(8760.01), false);
    assert.equal(isValidDowntimeHours(-1), false);
    assert.equal(isValidDowntimeHours(NaN), false);
});
