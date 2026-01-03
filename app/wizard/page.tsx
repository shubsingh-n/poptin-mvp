'use client';

import { useState, useEffect } from 'react';
import { Loader2, Users, Globe, MessageSquare, MousePointer, Target, Bell } from 'lucide-react';

export default function WizardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/wizard/stats');
            if (res.status === 401) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (data.success) {
                setStats(data);
                setIsAuthenticated(true);
                setError('');
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/wizard/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (data.success) {
                await fetchStats();
            } else {
                setError(data.error);
                setLoading(false);
            }
        } catch (err) {
            setError('Login failed');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Wizard Login</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <div>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Wizard Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Wizard Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Access Wizard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const handleSignOut = () => {
        // Clear cookie call to API normally, but we can just redirect or reload for simple basic auth cookie clear?
        // Actually, we set a cookie, so we need to clear it.
        // Let's create a logout endpoint or just expire the cookie.
        // For now, let's just create a simple function to handle this on client side if possible, 
        // but better to have an API route. 
        // Wait, I can just expire it via document.cookie for simple usage or 
        // call an API. Let's add a logout button that calls a logout API.
        // Or simpler: just reload page if we delete cookie client side? HttpOnly prevents that.
        // So we need an API route for wizard logout. 
        // Let's create it in next step. For now, UI button.
        fetch('/api/wizard/logout', { method: 'POST' }).then(() => {
            window.location.reload();
        });
    };

    const toggleBlockStatus = async (userId: string, currentStatus: boolean, name: string) => {
        const action = currentStatus ? 'unblock' : 'block';
        if (!confirm(`Are you sure you want to ${action} ${name}?`)) return;

        try {
            const res = await fetch('/api/wizard/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action }),
            });
            const data = await res.json();

            if (data.success) {
                // Refresh local stats to reflect change
                setStats((prev: any) => ({
                    ...prev,
                    users: prev.users.map((u: any) =>
                        u._id === userId ? { ...u, isBlocked: !currentStatus } : u
                    )
                }));
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Action failed');
        }
    };

    const { global, users } = stats || {};

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Wizard Dashboard</h1>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={global?.totalUsers} icon={<Users />} />
                    <StatCard title="Total Sites" value={global?.totalSites} icon={<Globe />} />
                    <StatCard title="Total Popups" value={global?.totalPopups} icon={<MessageSquare />} />
                    <StatCard title="Total Leads" value={global?.totalLeads} icon={<MousePointer />} />
                    <StatCard title="Total Triggers" value={global?.totalEvents} icon={<Target />} />
                    <StatCard title="Subscribers" value={global?.totalSubscribers} icon={<Users className="text-purple-500" />} />
                    <StatCard title="Campaigns" value={global?.totalCampaigns} icon={<Bell />} />
                    <StatCard title="Notifications Sent" value={global?.totalSentNotifications} icon={<Target className="text-green-500" />} />
                </div>

                {/* User List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-medium text-gray-900">Users</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sites</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popups</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribers</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Notifs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users?.map((user: any) => (
                                    <tr key={user._id} className={user.isBlocked ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.stats.sites}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.stats.popups}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.stats.leads}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.stats.campaigns}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.stats.subscribers || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.stats.sentNotifications || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {user.isBlocked ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Blocked
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => toggleBlockStatus(user._id, user.isBlocked, user.name)}
                                                className={`${user.isBlocked
                                                    ? 'text-green-600 hover:text-green-900'
                                                    : 'text-red-600 hover:text-red-900'
                                                    }`}
                                            >
                                                {user.isBlocked ? 'Activate' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: any }) {
    return (
        <div className="bg-white overflow-hidden rounded-lg shadow p-5 border border-gray-100">
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-600 rounded-lg p-3 text-white shadow-md">
                    {icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className="text-2xl font-bold text-gray-900">{value || 0}</dd>
                    </dl>
                </div>
            </div>
        </div>
    );
}
