import { AppBar, Container, Menu, MenuItem, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import { Link, useRouter } from "@tanstack/react-router";
import ExternalLink from "./ExternalLink";
import { useState } from "react";
import { routeDescriptions, RoutePathType } from "../routes/routeDescriptions";
import WaterDropIcon from '@mui/icons-material/WaterDrop';

const linkStyles: React.CSSProperties = {
    color: "inherit",
    textDecoration: "inherit",
}

function Nf2tMenuItem({ to }: { to: RoutePathType }) {
    const route = routeDescriptions[to];

    return (
        <Tooltip title={route.shortDescription}>
            <MenuItem>
                <Link style={{ ...linkStyles }} to={route.to}>{route.shortName || route.name}</Link>
            </MenuItem>
        </Tooltip>
    )
}

function Nf2tSettingsMenu() {
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Menu options.">
                <MenuItem
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    Menu
                </MenuItem>
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <Nf2tMenuItem to="/" />
                <Nf2tMenuItem to="/unpackage" />
                <Nf2tMenuItem to="/package" />
                <Nf2tMenuItem to="/narReader" />
                <Nf2tMenuItem to="/source" />
                <Nf2tMenuItem to="/aistance" />
                <Nf2tMenuItem to="/settings" />
                <Tooltip title="External Apache Nifi Documentation.">
                    <MenuItem><ExternalLink style={{ ...linkStyles }} href="https://nifi.apache.org/docs.html">Nifi Docs</ExternalLink></MenuItem>
                </Tooltip>
                <MenuItem onClick={() => router.history.back()}>Back</MenuItem>
            </Menu>
        </>
    )
}

export function NifiAppBar() {
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters >
                    <Tooltip title={routeDescriptions["/"].shortDescription}>
                        <>
                            <WaterDropIcon sx={{mr: 1}}/>
                            <Typography variant="h6" color="inherit" component="div"><Link style={{ color: "inherit", textDecoration: "inherit" }} to="/">Nifi FlowFile Tools (Nf3t)</Link></Typography>
                        </>
                    </Tooltip>
                    <div style={{ flex: 1 }} />
                    <Stack direction="row">
                        <Nf2tSettingsMenu />
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NifiAppBar;