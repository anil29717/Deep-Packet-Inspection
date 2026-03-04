import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';
import { statsService } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#E040FB', '#00E5FF', '#FF3D00', '#76FF03', '#1DE9B6'];

export default function AppPieChart({ hours = 24 }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statsService.getTopApps(hours);
                // Ensure values are numbers for recharts
                const parsedData = response.data.map(item => ({
                    ...item,
                    total_bytes: Number(item.total_bytes)
                }));
                setData(parsedData);
            } catch (err) {
                console.error("Failed to fetch app stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [hours]);

    if (loading) return <Typography>Loading Chart...</Typography>;

    return (
        <Card className="bg-slate-800 text-white rounded-xl shadow-lg border-none" sx={{ height: '100%', background: '#1e293b', color: 'white' }}>
            <CardContent>
                <Typography variant="h6" className="text-slate-200 font-semibold mb-4">Bandwidth by Application</Typography>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="total_bytes"
                                nameKey="application_name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `${(value / 1024 / 1024).toFixed(2)} MB`}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
