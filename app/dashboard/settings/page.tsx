'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Settings,
    Layers,
    Bell,
    Copy,
    CheckCircle,
    AlertCircle,
    Download,
    RefreshCcw,
    Globe
} from 'lucide-react';

export default function SettingsPage() {
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verifyingPopup, setVerifyingPopup] = useState(false);
    const [verifyingPush, setVerifyingPush] = useState(false);

    const searchParams = useSearchParams();
    const siteIdParam = searchParams.get('siteId');

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const res = await fetch('/api/sites');
            const data = await res.json();
            if (data.success) {
                setSites(data.data);
                const current = siteIdParam
                    ? data.data.find((s: any) => s.siteId === siteIdParam)
                    : data.data[0];
                setSelectedSite(current);
            }
        } catch (error) {
            console.error('Error fetching sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPopup = async () => {
        if (!selectedSite) return;
        setVerifyingPopup(true);
        try {
            const res = await fetch(`/api/sites/${selectedSite._id}/verify-popup`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert('Popup integration verified!');
                fetchSites();
            } else {
                alert('Verification Failed: ' + data.error);
            }
        } catch (e) {
            alert('Error during verification.');
        } finally {
            setVerifyingPopup(false);
        }
    };

    const handleVerifyPush = async () => {
        if (!selectedSite) return;
        setVerifyingPush(true);
        try {
            const res = await fetch(`/api/sites/${selectedSite._id}/verify-push`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert('Push Notification integration verified!');
                fetchSites();
            } else {
                alert('Verification Failed: ' + data.error);
            }
        } catch (e) {
            alert('Error during verification.');
        } finally {
            setVerifyingPush(false);
        }
    };

    const downloadSW = async () => {
        try {
            const res = await fetch('/firebase-messaging-sw.js');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'firebase-messaging-sw.js';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert('Failed to download file.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    if (!selectedSite) {
        return (
            <div className="p-12 text-center bg-white rounded-xl shadow-sm border">
                <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Site Selected</h2>
                <p className="text-gray-500 mb-6">Please add a site first to see setup instructions.</p>
                <a href="/dashboard/sites" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Go to Sites
                </a>
            </div>
        );
    }

    const popupCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/popup.js" data-site-id="${selectedSite.siteId}"></script>`;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <Settings size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
                </div>
                <p className="text-gray-500">Manage your integration and verification for <strong>{selectedSite.name}</strong></p>
            </header>

            {/* Site Selector */}
            {sites.length > 1 && (
                <div className="mb-8 flex items-center gap-3">
                    <label className="text-sm font-bold text-gray-700">Switch Site:</label>
                    <select
                        value={selectedSite.siteId}
                        onChange={(e) => {
                            const site = sites.find(s => s.siteId === e.target.value);
                            setSelectedSite(site);
                        }}
                        className="bg-white border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {sites.map(s => <option key={s._id} value={s.siteId}>{s.name}</option>)}
                    </select>
                </div>
            )}

            <div className="space-y-8">
                {/* Popup Integration */}
                <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="bg-blue-50/50 px-6 py-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Layers size={20} className="text-blue-600" />
                            <h2 className="font-bold text-gray-900">Popup Integration</h2>
                        </div>
                        {selectedSite.isPopupVerified ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                <CheckCircle size={14} /> VERIFIED
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                <AlertCircle size={14} /> SETUP REQUIRED
                            </span>
                        )}
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-4">Paste this script tag into the <code>&lt;head&gt;</code> or just before the <code>&lt;/body&gt;</code> tag of your website.</p>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 font-mono text-xs mb-6 relative group shadow-inner">
                            <button
                                onClick={() => copyToClipboard(popupCode)}
                                className="absolute right-3 top-3 p-2 bg-gray-800 text-gray-400 hover:text-blue-400 rounded-lg shadow-sm border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy"
                            >
                                <Copy size={16} />
                            </button>
                            <div className="pr-10 leading-relaxed overflow-x-auto whitespace-pre text-blue-400">
                                {popupCode}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed">
                            <div className="text-sm">
                                <p className="font-bold text-gray-900">Verify Installation</p>
                                <p className="text-gray-500 text-xs">Is the script live on {selectedSite.domain}?</p>
                            </div>
                            <button
                                onClick={handleVerifyPopup}
                                disabled={verifyingPopup}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold disabled:opacity-50"
                            >
                                {verifyingPopup ? <RefreshCcw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                {selectedSite.isPopupVerified ? 'Re-Verify' : 'Verify Now'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Push Notification Integration */}
                <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="bg-purple-50/50 px-6 py-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-purple-600" />
                            <h2 className="font-bold text-gray-900">Push Notification Setup</h2>
                        </div>
                        {selectedSite.isPushVerified ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                <CheckCircle size={14} /> VERIFIED
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                <AlertCircle size={14} /> SETUP REQUIRED
                            </span>
                        )}
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-6">Push notifications require a Service Worker file on your root domain to function correctly.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px]">1</span>
                                    Download Service Worker
                                </h3>
                                <p className="text-xs text-gray-500">Download the file and host it at <code>{selectedSite.domain}/firebase-messaging-sw.js</code></p>
                                <button
                                    onClick={downloadSW}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors text-sm font-bold"
                                >
                                    <Download size={18} /> Download JS File
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px]">2</span>
                                    Verify Service Worker
                                </h3>
                                <p className="text-xs text-gray-500">Check if the file is accessible on your domain and has the correct code.</p>
                                <button
                                    onClick={handleVerifyPush}
                                    disabled={verifyingPush}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-bold disabled:opacity-50"
                                >
                                    {verifyingPush ? <RefreshCcw size={18} className="animate-spin" /> : <Layers size={18} />}
                                    Verify Installation
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
