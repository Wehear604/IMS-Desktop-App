import React, { useEffect, useMemo, useState } from 'react';
import { fetchHrmsProjects } from '../../apis/item.api';
import { Autocomplete, Box, Card, CardContent, Chip, TextField, Typography, Grid } from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { callApiAction } from '../../store/actions/commonAction';
import { useDispatch } from 'react-redux';

const ProjectAnalysisUi = ({ data, setData, fields, setFields }) => {
    const groupedByProject = useMemo(() => {
        const map = {};
        data.forEach(item => {
            const key = item.projectName || 'Unknown';
            if (!map[key]) {
                map[key] = {
                    projectName: key,
                    totalQuantity: 0,
                    totalAmount: 0,
                    items: []
                };
            }
            map[key].totalQuantity += item.quantity;
            map[key].totalAmount += item.amount;
            map[key].items.push({
                item_name: item.materialDetails?.name || 'Unnamed',
                quantity: item.quantity,
            });
        });
        return Object.values(map);
    }, [data]);

    const groupedByMaterial = useMemo(() => {
        if (!fields?.projectId) return [];
        const map = {};
        data
            .filter(item => item.projectId === fields.projectId)
            .forEach(item => {
                const key = item.materialDetails?.name || 'Unnamed';
                if (!map[key]) {
                    map[key] = {
                        materialName: key,
                        totalQuantity: 0,
                        totalAmount: 0
                    };
                }
                map[key].totalQuantity += item.quantity;
                map[key].totalAmount += item.amount;
            });
        return Object.values(map);
    }, [data, fields]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const p = payload[0].payload;
            return (
                <Box sx={{ background: '#fff', p: 2, border: '1px solid #ccc' }}>
                    {p.projectName && (
                        <>
                            <Typography variant="subtitle2"><strong>Project:</strong> {p.projectName}</Typography>
                            <Typography variant="body2"><strong>Total Qty:</strong> {p.totalQuantity}</Typography>
                            <Typography variant="body2"><strong>Total Amount:</strong> {p.totalAmount}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Items:</strong></Typography>
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                                {p.items?.map((i, idx) => (
                                    <li key={idx}>{i.item_name} — Qty: {i.quantity}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    {p.materialName && (
                        <>
                            <Typography variant="subtitle2"><strong>Material:</strong> {p.materialName}</Typography>
                            <Typography variant="body2"><strong>Quantity:</strong> {p.totalQuantity}</Typography>
                            <Typography variant="body2"><strong>Amount:</strong> {p.totalAmount}</Typography>
                        </>
                    )}
                </Box>
            );
        }
        return null;
    };

    const chartData = fields?.projectId ? groupedByMaterial : groupedByProject;
    const dataKey = "totalQuantity";
    const nameKey = fields?.projectId ? "materialName" : "projectName";

    const dynamicColors = useMemo(() => {
        const baseColor = { h: 200, s: 60, l: 45 };
        const count = chartData.length;
        if (count === 0) return [];
        if (count === 1) return [`hsl(${baseColor.h}, ${baseColor.s}%, ${baseColor.l}%)`];

        const minL = Math.max(baseColor.l - 20, 20);
        const maxL = Math.min(baseColor.l + 20, 80);
        return Array.from({ length: count }, (_, i) => {
            const l = count === 1
                ? baseColor.l
                : minL + ((maxL - minL) * i) / (count - 1);
            return `hsl(${baseColor.h}, ${baseColor.s}%, ${l}%)`;
        });
    }, [chartData]);

    const [project, SetProject] = useState([]);
    const dispatch = useDispatch();

    const fetchProductList = () => {
        dispatch(
            callApiAction(
                async () => await fetchHrmsProjects({ allStatus: true }),
                (response) => {
                    SetProject(response.result);
                },
                (err) => {
                    console.log("Fetch error", err);
                }
            )
        );
    };

    useEffect(() => {
        fetchProductList();
    }, []);


    return (
        <>
            <Box mt={4}>
                <Autocomplete
                    sx={{ width: "100%" }}
                    options={project ?? []}
                    getOptionLabel={(option) => option.project_name}
                    onChange={(event, value) => {
                        setFields({
                            projectId: value ? value._id : null,
                            projectName: value ? value.name : null,
                        });
                    }}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                            <Chip label={option.project_name} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            margin="dense"
                            label="Select Project*"
                            variant="outlined"
                            placeholder="Select Project*"
                        />
                    )}
                />
            </Box>
            {chartData.length === 0 ? <Grid xs={12} display="flex"
                justifyContent="center"
                width="100%"
                height={"30vh"}
                alignItems="center">
                <Typography variant="h3">No data available for chart</Typography>
            </Grid> : <Box sx={{ mt: 4 }}>
                {chartData.length === 0 ? (
                    <Grid
                        xs={12}
                        display="flex"
                        justifyContent="center"
                        width="100%"
                        height={"30vh"}
                        alignItems="center"
                    >
                        <Typography variant="h3">No data available for chart</Typography>
                    </Grid>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={chartData.length > 4 ? 6 : 5}>
                            <Grid container spacing={2}>
                                {chartData.map((item, index) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={chartData.length > 4 ? 6 : 12}
                                        key={index}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Card
                                            sx={{
                                                width: "100%",
                                                maxWidth: 350,
                                                height: "auto",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                p: 2,
                                            }}
                                        >
                                            <CardContent sx={{ width: "100%" }}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {fields?.projectId ? "Material:" : "Project:"}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {fields?.projectId
                                                                ? item?.materialName
                                                                : item?.projectName}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Total Amount:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2">
                                                            {item?.totalAmount}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Total Quantity:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2">
                                                            {item?.totalQuantity}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        {chartData.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        '& .recharts-wrapper': { outline: 'none', userSelect: 'none' },
                                        '& svg': { outline: 'none' },
                                    }}
                                >
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                dataKey={dataKey}
                                                nameKey={nameKey}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label
                                                onClick={(e) => e?.preventDefault?.()}
                                                style={{ cursor: 'default' }}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={dynamicColors[index]}
                                                        style={{ outline: 'none', stroke: 'none' }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>}


        </>
    );
};

export default ProjectAnalysisUi;
