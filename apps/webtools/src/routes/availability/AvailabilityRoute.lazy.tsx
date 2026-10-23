import { createLazyRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import Spacing from "../../components/Spacing";
import {
    availabilityPercent,
    DowntimeUnit,
    downtimeHoursForAvailability,
    downtimeToHours,
    downtimeUnits,
    formatAvailability,
    formatDowntime,
    hoursToDowntime,
    isValidDowntimeHours,
} from "../../utils/availability";

export const Route = createLazyRoute("/availability")({
    component: AvailabilityComponent,
})

const commonTargets = [99, 99.9, 99.99, 99.999];

function AvailabilityComponent() {
    const [value, setValue] = useState("");
    const [unit, setUnit] = useState<DowntimeUnit>("hours");

    const downtimeHours = useMemo(() => downtimeToHours(Number(value) || 0, unit), [value, unit]);
    const valid = isValidDowntimeHours(downtimeHours);

    // Use the unit that reads best for the target, so 99.999% is minutes rather than 0.09 hours.
    const setTarget = (target: number) => {
        const hours = downtimeHoursForAvailability(target);
        const newUnit: DowntimeUnit = hours >= 1 ? "hours" : "minutes";
        setUnit(newUnit);
        setValue(String(Number(hoursToDowntime(hours, newUnit).toPrecision(10))));
    };

    return (
        <>
            <Nf2tHeader to="/availability" />
            <Spacing />
            <div style={{ display: "flex", gap: "0.5em", maxWidth: "30em" }}>
                <TextField
                    fullWidth
                    type="number"
                    label="Annual downtime"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    inputProps={{ min: 0, step: "any" }}
                    error={!valid}
                    helperText={valid ? undefined : "Downtime must be between 0 and one year."}
                />
                <TextField
                    select
                    label="Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as DowntimeUnit)}
                    style={{ minWidth: "8em" }}
                >
                    {downtimeUnits.map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
            </div>

            <Spacing />
            <Paper style={{ padding: "1em", maxWidth: "30em", textAlign: "center" }}>
                <Typography variant="caption">Uptime</Typography>
                <Typography variant="h3" component="div">
                    {valid ? formatAvailability(availabilityPercent(downtimeHours)) : "-"}
                </Typography>
                <Typography variant="body2">{valid ? formatDowntime(downtimeHours) : ""}</Typography>
            </Paper>

            <h3>Common SLA targets</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em" }}>
                {commonTargets.map(target => (
                    <Button key={target} variant="outlined" onClick={() => setTarget(target)}>
                        <span>
                            <b>{target}%</b>
                            <br />
                            <small>{formatDowntime(downtimeHoursForAvailability(target)).replace(" per year", "")}</small>
                        </span>
                    </Button>
                ))}
            </div>

            <Spacing />
            <Button variant="outlined" onClick={() => { setValue(""); setUnit("hours"); }}>Reset</Button>
        </>
    );
}
