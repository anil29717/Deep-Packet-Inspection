import { useState } from 'react';
import { Box, Typography, Card, CardContent, Switch, FormGroup, FormControlLabel, Button, TextField } from '@mui/material';

export default function Settings() {
    const [darkMode, setDarkMode] = useState(false);
    const [alertThreshold, setAlertThreshold] = useState('500');

    const handleSave = () => {
        // In a real app, this would post to an API
        alert(`Settings saved! Alerts: >${alertThreshold} MB`);
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-slate-400 mt-2">Manage your application preferences and thresholds</p>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg border-none p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-700">Preferences</h3>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-slate-200 font-medium">Dark Theme</p>
                        <p className="text-slate-400 text-sm">Force the entire application into dark mode.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={darkMode}
                            onChange={(e) => setDarkMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg border-none p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-700">Configuration</h3>

                <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Alert Threshold (MB)
                        </label>
                        <input
                            type="number"
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            value={alertThreshold}
                            onChange={(e) => setAlertThreshold(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
