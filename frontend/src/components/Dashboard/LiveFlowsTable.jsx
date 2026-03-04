import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Collapse, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format } from 'date-fns';
import { flowService } from '../../services/api';

export default function LiveFlowsTable() {
    const [flows, setFlows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        const fetchFlows = async () => {
            try {
                const response = await flowService.getLatestFlows(20);
                setFlows(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch flows", err);
                setError("Could not load latest flows.");
            } finally {
                setLoading(false);
            }
        };

        fetchFlows();
        // Polling every 5 seconds for live feel
        const interval = setInterval(fetchFlows, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-slate-400 p-4">Loading Live Flows...</div>;
    if (error) return <div className="text-red-400 p-4">{error}</div>;

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg border-none overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider w-10"></th>
                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Time</th>
                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Source</th>
                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Destination</th>
                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-center">Protocol</th>
                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Application</th>
                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Size (KB)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {flows.map((row) => (
                            <React.Fragment key={row.id}>
                                <tr className="hover:bg-slate-700/30 transition-colors duration-150">
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        <IconButton
                                            aria-label="expand row"
                                            size="small"
                                            onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                            className="text-slate-400"
                                        >
                                            {expandedRow === row.id ? <KeyboardArrowUpIcon style={{ color: '#94a3b8' }} /> : <KeyboardArrowDownIcon style={{ color: '#94a3b8' }} />}
                                        </IconButton>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                                        {row.last_seen ? format(new Date(row.last_seen), 'HH:mm:ss') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.src_ip}:{row.src_port}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.dst_ip}:{row.dst_port}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {row.protocol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                                        {row.application_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-emerald-400">
                                        {(row.total_bytes / 1024).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={7} className="p-0 border-none">
                                        <Collapse in={expandedRow === row.id} timeout="auto" unmountOnExit>
                                            <div className="bg-slate-900/40 p-6 m-2 rounded-lg border border-slate-700">
                                                <h4 className="text-white font-medium mb-4 flex items-center">
                                                    <span className="bg-blue-600/20 text-blue-400 p-1.5 rounded mr-2">Deep Packet Flow Details</span>
                                                    Flow ID: {row.id}
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                                                    <div>
                                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">App Category</p>
                                                        <p className="font-medium text-purple-400">{row.application_category || 'Unknown'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Duration</p>
                                                        <p className="font-mono text-slate-200">{row.flow_duration} ms</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Bytes Sent / Rcvd</p>
                                                        <p className="font-mono text-emerald-400">⬆ {(row.bytes_sent / 1024).toFixed(1)} KB / ⬇ {(row.bytes_received / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">First Seen</p>
                                                        <p className="font-mono text-slate-200">{row.first_seen ? format(new Date(row.first_seen), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Raw Flow Context</p>
                                                    <div className="bg-black/50 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto">
                                                        {`[${row.protocol}] ${row.src_ip}:${row.src_port} -> ${row.dst_ip}:${row.dst_port} | App: ${row.application_name} | Total Payload: ${row.total_bytes} bytes`}
                                                    </div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
