'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Trash2, Download, ChevronUp, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Lead {
  _id: string;
  siteId: string;
  popupId: string;
  email?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface Site {
  _id: string;
  name: string;
  siteId: string;
}

interface Popup {
  _id: string;
  title: string;
}

type SortField = 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSiteId, setFilterSiteId] = useState('');
  const [filterPopupId, setFilterPopupId] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [filterSiteId, filterPopupId]);

  const fetchData = async () => {
    try {
      const [leadsRes, sitesRes, popupsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/sites'),
        fetch('/api/popups'),
      ]);

      const leadsData = await leadsRes.json();
      const sitesData = await sitesRes.json();
      const popupsData = await popupsRes.json();

      if (leadsData.success) setLeads(leadsData.data);
      if (sitesData.success) setSites(sitesData.data);
      if (popupsData.success) setPopups(popupsData.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSiteId) params.append('siteId', filterSiteId);
      if (filterPopupId) params.append('popupId', filterPopupId);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        setSelectedLeads(new Set());
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredAndSortedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredAndSortedLeads.map(l => l._id)));
    }
  };

  const handleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });

      const data = await res.json();
      if (data.success) {
        setLeads(leads.filter(l => l._id !== id));
        setSelectedLeads(new Set());
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} lead(s)?`)) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedLeads) }),
      });

      const data = await res.json();
      if (data.success) {
        setLeads(leads.filter(l => !selectedLeads.has(l._id)));
        setSelectedLeads(new Set());
      }
    } catch (error) {
      console.error('Error deleting leads:', error);
      alert('Failed to delete leads');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const exportToCSV = (selectedOnly = false) => {
    const leadsToExport = selectedOnly && selectedLeads.size > 0
      ? leads.filter(l => selectedLeads.has(l._id))
      : filteredAndSortedLeads;

    if (leadsToExport.length === 0) return;

    const allDataKeys = new Set<string>();
    leadsToExport.forEach(lead => {
      if (lead.data) {
        Object.keys(lead.data).forEach(key => allDataKeys.add(key));
      }
    });
    const dynamicHeaders = Array.from(allDataKeys);

    const headers = ['Email', 'Site', 'Popup', 'Created Date', 'Updated Date', ...dynamicHeaders];

    const rows = leadsToExport.map((lead) => {
      const site = sites.find((s) => s.siteId === lead.siteId);
      const popup = popups.find((p) => p._id === lead.popupId);

      const dynamicCells = dynamicHeaders.map(key => {
        const val = lead.data?.[key];
        return val !== undefined && val !== null ? String(val) : '';
      });

      return [
        lead.email || 'Anonymous',
        site?.name || lead.siteId,
        popup?.title || lead.popupId,
        new Date(lead.createdAt).toLocaleString(),
        new Date(lead.updatedAt).toLocaleString(),
        ...dynamicCells
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter by date range
  const filteredAndSortedLeads = leads
    .filter(lead => {
      if (startDate && new Date(lead.createdAt) < new Date(startDate)) return false;
      if (endDate && new Date(lead.createdAt) > new Date(endDate + 'T23:59:59')) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'email') {
        const emailA = (a.email || '').toLowerCase();
        const emailB = (b.email || '').toLowerCase();
        comparison = emailA.localeCompare(emailB);
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          {selectedLeads.size > 0 && (
            <>
              <button
                onClick={() => exportToCSV(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export Selected ({selectedLeads.size})
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Selected ({selectedLeads.size})
              </button>
            </>
          )}
          <button
            onClick={() => exportToCSV(false)}
            disabled={filteredAndSortedLeads.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={16} />
            Export All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Site
          </label>
          <select
            value={filterSiteId}
            onChange={(e) => {
              setFilterSiteId(e.target.value);
              setFilterPopupId('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sites</option>
            {sites.map((site) => (
              <option key={site._id} value={site.siteId}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Popup
          </label>
          <select
            value={filterPopupId}
            onChange={(e) => setFilterPopupId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!filterSiteId}
          >
            <option value="">All Popups</option>
            {popups.map((popup) => (
              <option key={popup._id} value={popup._id}>
                {popup.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAndSortedLeads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === filteredAndSortedLeads.length && filteredAndSortedLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortField === 'email' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Popup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Summary
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Created Date
                      {sortField === 'createdAt' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedLeads.map((lead) => {
                  const site = sites.find((s) => s.siteId === lead.siteId);
                  const popup = popups.find((p) => p._id === lead.popupId);

                  const dataSummary = lead.data ? Object.entries(lead.data)
                    .filter(([key, val]) => val && key !== 'email')
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(', ') : '';

                  return (
                    <tr key={lead._id} className={selectedLeads.has(lead._id) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead._id)}
                          onChange={() => handleSelectLead(lead._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.email || <span className="text-gray-400 italic">Anonymous</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {site?.name || lead.siteId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {popup?.title || lead.popupId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={dataSummary}>
                        {dataSummary || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteLead(lead._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredAndSortedLeads.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
        {selectedLeads.size > 0 && ` (${selectedLeads.size} selected)`}
      </div>
    </div>
  );
}
