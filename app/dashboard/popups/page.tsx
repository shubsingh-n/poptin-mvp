'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Copy, MousePointer2, ExternalLink } from 'lucide-react';

interface Site {
  _id: string;
  name: string;
  siteId: string;
}

interface Popup {
  _id: string;
  siteId: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

function PopupsContent() {
  const searchParams = useSearchParams();
  const siteIdParam = searchParams.get('siteId');
  const router = useRouter();

  const [sites, setSites] = useState<Site[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState(siteIdParam || '');
  const [loading, setLoading] = useState(true);

  // UI States
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      fetchPopups(selectedSiteId);
    } else {
      fetchAllPopups();
    }
  }, [selectedSiteId]);


  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      if (data.success) {
        setSites(data.data);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchPopups = async (siteId: string) => {
    try {
      const res = await fetch(`/api/popups?siteId=${siteId}`); // Fixed API Call
      const data = await res.json();
      if (data.success) {
        setPopups(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching popups:', error);
      setLoading(false);
    }
  };

  const fetchAllPopups = async () => {
    try {
      const res = await fetch('/api/popups');
      const data = await res.json();
      if (data.success) {
        setPopups(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching popups:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;

    try {
      const res = await fetch(`/api/popups/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPopups(prev => prev.filter(p => p._id !== id));
      } else {
        alert(data.error || 'Failed to delete popup');
      }
    } catch (error) {
      console.error('Error deleting popup:', error);
      alert('Failed to delete popup');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/popups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setPopups(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleRename = async (id: string) => {
    if (!tempTitle.trim()) return;
    try {
      const res = await fetch(`/api/popups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tempTitle }),
      });
      if (res.ok) {
        setPopups(prev => prev.map(p => p._id === id ? { ...p, title: tempTitle } : p));
        setEditingTitleId(null);
      }
    } catch (error) {
      console.error('Error renaming:', error);
    }
  };

  const startRename = (popup: Popup, e: React.MouseEvent) => {
    e.stopPropagation(); // Ensure we don't trigger row clicks if any
    setEditingTitleId(popup._id);
    setTempTitle(popup.title);
  };

  const copyEmbedLink = (popup: Popup, e: React.MouseEvent) => {
    e.stopPropagation();
    const code = `<script src="${window.location.origin}/popup.js" data-site-id="${popup.siteId}"></script>`;
    navigator.clipboard.writeText(code);
    alert('Embed code copied to clipboard!');
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Popups</h1>
        <Link
          href={`/dashboard/popups/new${selectedSiteId ? `?siteId=${selectedSiteId}` : ''}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span> Create Popup
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-visible">
        {popups.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No popups found. Create one to get started!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Embed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {popups.map((popup) => {
                const site = sites.find((s) => s.siteId === popup.siteId);
                return (
                  <tr key={popup._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingTitleId === popup._id ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={tempTitle}
                            onChange={e => setTempTitle(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => handleRename(popup._id)} className="text-green-600">Save</button>
                          <button onClick={() => setEditingTitleId(null)} className="text-gray-500">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          {popup.title}
                          <button
                            onClick={(e) => startRename(popup, e)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {site?.name || popup.siteId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleToggleStatus(popup._id, popup.isActive, e)}
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                            ${popup.isActive ? 'bg-green-600' : 'bg-gray-200'}
                          `}
                        >
                          <span
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                              ${popup.isActive ? 'translate-x-5' : 'translate-x-0'}
                            `}
                          />
                        </button>
                        <span className="text-sm text-gray-500">{popup.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => copyEmbedLink(popup, e)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy Embed Code"
                      >
                        <Copy size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/popups/${popup._id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Design"
                        >
                          <Edit size={18} />
                        </Link>
                        <Link
                          href={`/dashboard/popups/${popup._id}/triggers`}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                          title="Edit Triggers"
                        >
                          <MousePointer2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(popup._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Popup"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function PopupsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <PopupsContent />
    </Suspense>
  );
}

