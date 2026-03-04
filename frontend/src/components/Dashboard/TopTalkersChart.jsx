import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';
import { statsService } from '../../services/api';

export default function TopTalkersChart({ hours = 24 }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statsService.getTopTalkers(hours);
                const parsedData = response.data.map(item => ({
                    ...item,
                    total_bytes: Number(item.total_bytes),
                    mb: (Number(item.total_bytes) / 1024 / 1024).toFixed(2)
                }));
                setData(parsedData);
            } catch (err) {
                console.error("Failed to fetch top talkers", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [hours]);

    if (loading) return <Typography>Loading Top Talkers...</Typography>;

    return (
        <Card className="bg-slate-800 text-white rounded-xl shadow-lg border-none" sx={{ height: '100%', background: '#1e293b', color: 'white' }}>
            <CardContent>
                <Typography variant="h6" className="text-slate-200 font-semibold mb-4">Top Talkers (IPs by Bandwidth)</Typography>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="src_ip" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                formatter={(value) => `${value} MB`}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                cursor={{ fill: '#334155' }}
                            />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
                            <Bar dataKey="mb" name="Total Data (MB)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
