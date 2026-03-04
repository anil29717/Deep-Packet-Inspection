import React, { useState, useEffect } from 'react';
import AppPieChart from '../components/Dashboard/AppPieChart';
import TopTalkersChart from '../components/Dashboard/TopTalkersChart';
import LiveFlowsTable from '../components/Dashboard/LiveFlowsTable';

export default function Analytics() {
    const [timeRange, setTimeRange] = useState(24); // default 24 hours

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Deep Traffic Analytics</h2>
                    <p className="text-slate-400 mt-2">Historical exploration, Protocol Analysis, and Application Usage.</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                    {[1, 12, 24, 48, 168].map(hours => (
                        <button
                            key={hours}
                            onClick={() => setTimeRange(hours)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timeRange === hours
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                }`}
                        >
                            {hours === 168 ? '7 Days' : `${hours}h`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Protocol / App Distribution */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm min-h-[450px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Application Protocols ({timeRange}h)</h3>
                    <div className="h-[350px]">
                        <AppPieChart hours={timeRange} />
                    </div>
                </div>

                {/* Top Talkers */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm min-h-[450px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Originating IPs ({timeRange}h)</h3>
                    <div className="h-[350px]">
                        <TopTalkersChart hours={timeRange} />
                    </div>
                </div>
            </div>

            {/* Comprehensive Table */}
            <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Detailed Flow Analyzer</h3>
                    <div className="flex space-x-2">
                        {/* Future Filters could go here */}
                    </div>
                </div>
                <div className="h-[600px] overflow-hidden rounded-lg border border-slate-700/50">
                    <LiveFlowsTable limit={500} />
                </div>
            </div>
        </div>
    );
}
