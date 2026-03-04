import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { deepPacketService } from '../services/api';
import { Alert, CircularProgress } from '@mui/material';

export default function DeepPacketKnowledge() {
    const [activeTab, setActiveTab] = useState('ALL');
    const [packets, setPackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tabs = ['ALL', 'DNS', 'LLMNR', 'HTTP', 'HTTPS/TLS', 'DHCP', 'NetBIOS'];

    useEffect(() => {
        const fetchPackets = async () => {
            setLoading(true);
            try {
                let res;
                if (activeTab === 'ALL') {
                    res = await deepPacketService.getRecent(100);
                } else {
                    res = await deepPacketService.getByProtocol(activeTab, 100);
                }
                setPackets(res.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching deep packets:", err);
                setError("Failed to load deep packet data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackets();
        const interval = setInterval(fetchPackets, 5000);
        return () => clearInterval(interval);
    }, [activeTab]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Deep Packet Knowledge</h2>
                    <p className="text-slate-400 mt-2">Explore the actual payload contents extracted from the network wire.</p>
                </div>
            </div>

            {/* Protocol Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Display */}
            <div className="min-h-[500px]">
                {loading && packets.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <CircularProgress sx={{ color: '#3b82f6' }} />
                    </div>
                ) : error ? (
                    <Alert severity="error" className="bg-red-900/20 text-red-200 border border-red-800">
                        {error}
                    </Alert>
                ) : packets.length === 0 ? (
                    <div className="text-center p-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                        <p className="text-slate-400 text-lg">No {activeTab !== 'ALL' ? activeTab : ''} payloads recently detected.</p>
                        <p className="text-slate-500 text-sm mt-2">Waiting for traffic across the network interface...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {packets.map((pkt) => (
                            <div key={pkt.id} className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-xl overflow-hidden font-mono text-sm leading-relaxed">
                                {/* Packet Header */}
                                <div className="bg-slate-800/80 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-md text-xs font-bold ring-1 ring-indigo-500/30">
                                            {pkt.protocol}
                                        </span>
                                        <span className="text-emerald-400 font-semibold">{pkt.src_ip.replace('::ffff:', '')}:{pkt.src_port || '*'}</span>
                                        <span className="text-slate-500 text-xs">→</span>
                                        <span className="text-yellow-400 font-semibold">{pkt.dst_ip.replace('::ffff:', '')}:{pkt.dst_port || '*'}</span>
                                    </div>
                                    <div className="text-slate-400 text-xs tracking-wider">
                                        {pkt.timestamp ? format(new Date(pkt.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS') : 'N/A'}
                                    </div>
                                </div>

                                {/* Deep Decoded Knowledge */}
                                {pkt.decoded_data && (
                                    <div className="p-6 bg-blue-950/20 border-b border-blue-900/30">
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <p className="text-blue-300 text-xs mb-1 font-sans uppercase tracking-widest font-semibold flex items-center">
                                                    <span className="mr-2">🔓 Extracted Plaintext</span>
                                                </p>
                                                <p className="text-white text-base bg-blue-900/20 inline-block px-3 py-1.5 rounded whitespace-pre-wrap">
                                                    {pkt.decoded_data}
                                                </p>
                                            </div>
                                            {pkt.insight && (
                                                <div className="flex items-start gap-3 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                                    <div className="text-amber-400 text-lg">💡</div>
                                                    <div>
                                                        <p className="text-amber-100/90 text-[13px]">{pkt.decoded_explanation}</p>
                                                        <p className="text-slate-400 text-xs mt-1 italic">{pkt.insight}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Raw Hex/ASCII Dump */}
                                {pkt.hex_dump && (
                                    <div className="p-6 overflow-x-auto">
                                        <p className="text-slate-500 text-xs mb-3 font-sans uppercase tracking-widest flex justify-between">
                                            <span>📦 Payload Hex Dump ({pkt.payload_size} Bytes)</span>
                                            <span>ASCII Representation</span>
                                        </p>
                                        <div className="flex gap-4">
                                            <pre className="text-slate-400 text-[13px]">
                                                {pkt.hex_dump}
                                            </pre>
                                            <div className="w-px bg-slate-700/50 mx-2"></div>
                                            <pre className="text-teal-200/70 text-[13px]">
                                                {pkt.ascii_dump}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
