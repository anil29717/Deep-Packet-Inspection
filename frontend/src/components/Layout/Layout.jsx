import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CodeIcon from '@mui/icons-material/Code';

export default function Layout() {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: DashboardIcon },
        { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
        { name: 'Deep Packets', href: '/knowledge', icon: CodeIcon },
        { name: 'Employees', href: '/employees', icon: PeopleIcon },
    ];

    const secondaryNav = [
        { name: 'Settings', href: '/settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-700 bg-slate-800 transition-all duration-300">
                <div className="h-16 flex items-center px-6 border-b border-slate-700">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        SecAdmin Panel
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const active = location.pathname === item.href;
                        return (
                            <RouterLink
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-lg mb-1 transition-colors duration-200 ${active
                                    ? 'bg-blue-600/10 text-blue-400'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                                <span className="font-medium">{item.name}</span>
                            </RouterLink>
                        );
                    })}

                    <div className="mt-8 pt-6 border-t border-slate-700">
                        {secondaryNav.map((item) => {
                            const active = location.pathname === item.href;
                            return (
                                <RouterLink
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-3 py-2.5 rounded-lg mb-1 transition-colors duration-200 ${active
                                        ? 'bg-blue-600/10 text-blue-400'
                                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                                    <span className="font-medium">{item.name}</span>
                                </RouterLink>
                            );
                        })}
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                    <h1 className="text-lg font-semibold text-slate-100">Office DPI Monitor</h1>

                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
