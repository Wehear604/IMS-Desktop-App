// DeviceActivityConsole.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
    Box, Button, IconButton, Typography, Select, MenuItem, TextField,
    List, ListItem, ListItemText, Divider, Stack, Tooltip
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

/**
 * DeviceActivityConsole
 * Props:
 *  - initialDeviceId (string|null) optional: preselect device filter
 *  - historyLimit (number) optional: how many logs to fetch (default 300)
 *  - maxInMemory (number) optional: cap for in-memory logs (default 2000)
 */
export default function DeviceActivityConsole({
    initialDeviceId = null,
    historyLimit = 300,
    maxInMemory = 2000
}) {
    const [logs, setLogs] = useState([]); // oldest -> newest
    const [paused, setPaused] = useState(false);
    const [filterDevice, setFilterDevice] = useState(initialDeviceId || "all");
    const [filterLevel, setFilterLevel] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(null);
    const listContainerRef = useRef(null);
    const mountedRef = useRef(false);

    // Fetch backlog once on mount (or when filterDevice changes)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const payload = {
                    deviceId: filterDevice === "all" ? null : filterDevice,
                    limit: historyLimit
                };
                const history = await window.electronAPI.getBleActivityHistory(payload);
                if (cancelled) return;
                // ensure chronological order (oldest first)
                setLogs(Array.isArray(history) ? history : []);
                // scroll to bottom after initial load
                setTimeout(() => {
                    const el = listContainerRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                }, 50);
            } catch (e) {
                console.warn("Failed to load activity history", e);
            }
        })();
        return () => { cancelled = true; };
    }, [filterDevice, historyLimit]);

    // Live subscription
    useEffect(() => {
        mountedRef.current = true;
        const unsub = window.electronAPI.onBleActivity((entry) => {
            if (!mountedRef.current) return;
            // If user is filtering by device and this entry doesn't match, still keep in memory but not displayed.
            setLogs(prev => {
                const next = [...prev, entry].slice(-maxInMemory);
                return next;
            });
            if (!paused) {
                // auto-scroll to bottom
                setTimeout(() => {
                    const el = listContainerRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                }, 0);
            }
        });
        return () => {
            mountedRef.current = false;
            try { unsub(); } catch (e) { /* ignore */ }
        };
    }, [paused, maxInMemory]);

    // Derived list after filtering/search
    const visibleLogs = useMemo(() => {
        const q = (search || "").trim().toLowerCase();
        return logs.filter((l) => {
            if (!l) return false;
            if (filterDevice !== "all" && l.deviceId !== filterDevice) return false;
            if (filterLevel !== "all" && l.level !== filterLevel) return false;
            if (q) {
                const hay = `${l.msg || ""} ${JSON.stringify(l.meta || {})}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [logs, filterDevice, filterLevel, search]);

    // Device options extracted from logs (most recent first)
    const deviceOptions = useMemo(() => {
        const seen = new Set();
        const list = [];
        for (let i = logs.length - 1; i >= 0; i--) {
            const d = logs[i];
            const id = d?.deviceId || "__nogadget";
            if (!seen.has(id)) {
                seen.add(id);
                list.push(id);
            }
        }
        return list;
    }, [logs]);

    function clearLogs() {
        setLogs([]);
        setSelectedIndex(null);
    }

    function copySelected() {
        if (selectedIndex == null) return;
        const entry = visibleLogs[selectedIndex];
        if (!entry) return;
        const text = JSON.stringify(entry, null, 2);
        navigator.clipboard?.writeText(text).catch(() => { });
    }

    function togglePause() { setPaused(p => !p); }

    return (
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">Device Activity</Typography>

                <Select size="small" value={filterDevice} onChange={e => setFilterDevice(e.target.value)} sx={{ minWidth: 140 }}>
                    <MenuItem value="all">All devices</MenuItem>
                    <MenuItem value="__nogadget">No device</MenuItem>
                    {deviceOptions.map(d => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                </Select>

                <Select size="small" value={filterLevel} onChange={e => setFilterLevel(e.target.value)} sx={{ minWidth: 120 }}>
                    <MenuItem value="all">All levels</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warn">Warn</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                </Select>

                <TextField size="small" placeholder="search message/meta..." value={search} onChange={e => setSearch(e.target.value)} sx={{ minWidth: 200 }} />

                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                    <Tooltip title={paused ? "Resume live" : "Pause live"}>
                        <IconButton size="small" onClick={togglePause}>
                            {paused ? <PlayArrowIcon /> : <PauseIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Copy selected">
                        <IconButton size="small" onClick={copySelected} disabled={selectedIndex == null}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Clear in-memory logs">
                        <IconButton size="small" onClick={clearLogs}>
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Stack>

            <Divider />

            <Box id="activity-list-container" ref={listContainerRef} sx={{
                overflowY: "auto",
                height: "calc(100% - 96px)",
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px solid rgba(0,0,0,0.06)",
                p: 1
            }}>
                <List dense disablePadding>
                    {visibleLogs.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No activity yet" />
                        </ListItem>
                    ) : visibleLogs.map((entry, idx) => {
                        const key = `${entry.ts}-${idx}`;
                        const primary = `${entry.ts} ${entry.deviceId ? `[${entry.deviceId}]` : ""} ${entry.level?.toUpperCase() || ""}`;
                        const secondary = entry.msg + (entry.meta ? ` — ${JSON.stringify(entry.meta)}` : "");
                        const isSelected = idx === selectedIndex;
                        return (
                            <React.Fragment key={key}>
                                <ListItem
                                    button
                                    selected={isSelected}
                                    onClick={() => setSelectedIndex(isSelected ? null : idx)}
                                    sx={{
                                        bgcolor: isSelected ? "rgba(25,118,210,0.08)" : "transparent",
                                        borderLeft: entry.level === "error" ? "4px solid rgba(211,47,47,0.76)" : (entry.level === "warn" ? "4px solid rgba(245,124,0,0.76)" : "4px solid rgba(0,0,0,0.0)"),
                                        pr: 2
                                    }}
                                >
                                    <ListItemText
                                        primary={<Typography variant="caption" sx={{ fontFamily: "monospace" }}>{primary}</Typography>}
                                        secondary={<Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{secondary}</Typography>}
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Showing {visibleLogs.length} / {logs.length} entries
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button size="small" onClick={() => {
                    // copy entire visible list
                    const text = JSON.stringify(visibleLogs, null, 2);
                    navigator.clipboard?.writeText(text).catch(() => { });
                }}>Copy All Visible</Button>
            </Box>
        </Box>
    );
}
