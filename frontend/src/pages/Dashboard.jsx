import LiveFlowsTable from '../components/Dashboard/LiveFlowsTable';
import AppPieChart from '../components/Dashboard/AppPieChart';
import TopTalkersChart from '../components/Dashboard/TopTalkersChart';

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Network Dashboard</h2>
                <p className="text-slate-400 mt-2">Real-time Deep Packet Inspection Metrics</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="min-h-[400px]">
                    <AppPieChart hours={24} />
                </div>
                <div className="min-h-[400px]">
                    <TopTalkersChart hours={24} />
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-xl font-semibold text-slate-200 mb-4">Live Flows</h3>
                <LiveFlowsTable />
            </div>
        </div>
    );
}
