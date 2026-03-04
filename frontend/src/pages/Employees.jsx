import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Divider, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { employeeService } from '../services/api';

export default function EmployeeMapping() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchEmployees = async () => {
        try {
            const response = await employeeService.getAll();
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to load employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage('');
        try {
            const response = await employeeService.uploadCSV(file);
            setMessage(response.data.message);
            // Refresh list
            fetchEmployees();
        } catch (error) {
            setMessage('Failed to upload file.');
        } finally {
            setUploading(false);
            // Reset file input
            event.target.value = null;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Employee IP Mapping</h2>
                <p className="text-slate-400 mt-2">Map devices and IP addresses to staff members</p>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg border-none p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Upload Mapping</h3>
                <p className="text-slate-400 mb-6 text-sm">
                    Upload a CSV file containing Employee ID, Name, Department, and IP Address.
                </p>

                <div className="flex items-center gap-4">
                    <label className={`
                        flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 cursor-pointer
                        ${uploading
                            ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20'}
                    `}>
                        {uploading ? (
                            <CircularProgress size={20} color="inherit" className="mr-2" />
                        ) : (
                            <CloudUploadIcon className="mr-2" fontSize="small" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload CSV'}
                        <input
                            type="file"
                            hidden
                            accept=".csv"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                    {message && (
                        <span className="text-emerald-400 text-sm font-medium">{message}</span>
                    )}
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg border-none overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-200">Current Mappings</h3>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <CircularProgress />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        No employees mapped. Upload a CSV to get started.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-700/50">
                        {employees.map((emp) => (
                            <li key={emp.id} className="p-6 hover:bg-slate-700/30 transition-colors duration-150">
                                <div className="flex flex-col">
                                    <span className="text-lg font-medium text-slate-200">{emp.name}</span>
                                    <span className="text-sm text-slate-400 mt-1">
                                        {emp.department} • IP(s): {emp.mapped_ips || 'None'}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
