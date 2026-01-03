
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NewNotificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [siteId, setSiteId] = useState(searchParams.get('siteId') || '');
    const [sites, setSites] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        body: '',
        link: '',
        icon: ''
    });

    useEffect(() => {
        fetch('/api/sites').then(r => r.json()).then(d => {
            if (d.success) {
                setSites(d.data);
                if (!siteId && d.data.length > 0) setSiteId(d.data[0].siteId);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, siteId }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/dashboard/notifications?siteId=${siteId}`);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <h1 className="text-2xl font-bold mb-6">Create Push Broadcast</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Site</label>
                    <select
                        value={siteId}
                        onChange={e => setSiteId(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        required
                    >
                        {sites.map(s => <option key={s._id} value={s.siteId}>{s.domain}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Notification Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Flash Sale ⚡"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Message (Body)</label>
                    <textarea
                        value={formData.body}
                        onChange={e => setFormData({ ...formData, body: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Get 50% off all items for the next 24 hours!"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Link URL (Optional)</label>
                    <input
                        type="url"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://yoursite.com/sale"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Icon URL (Optional)</label>
                    <input
                        type="url"
                        value={formData.icon}
                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://yoursite.com/icon.png"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/dashboard/notifications" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Draft'}
                    </button>
                </div>
            </form>
        </div>
    );
}
