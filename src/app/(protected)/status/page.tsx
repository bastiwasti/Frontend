'use client';

import { useState, useEffect } from 'react';

interface Run {
  id: number;
  agent: string;
  cities: string | null;
  created_at: string;
  raw_summary_id: number | null;
  duration: number | null;
  events_found: number | null;
  valid_events: number | null;
  start_time: string | null;
  end_time: string | null;
}

export default function StatusPage() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    async function fetchRuns() {
      const runsRes = await fetch('/api/runs');
      const runsData = await runsRes.json();
      setRuns(runsData);
    }
    fetchRuns();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Run Status</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cities</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events Found</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Events</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{run.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.agent}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.cities || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(run.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.duration ? `${run.duration.toFixed(2)}s` : 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.events_found ?? 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.valid_events ?? 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.start_time ? new Date(run.start_time).toLocaleString() : 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.end_time ? new Date(run.end_time).toLocaleString() : 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{run.raw_summary_id ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {runs.length === 0 && (
            <p className="text-center text-gray-500 py-12">No runs found</p>
          )}
        </div>
      </div>
    </div>
  );
}
