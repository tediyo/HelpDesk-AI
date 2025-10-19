'use client';

import { useState, useEffect } from 'react';

interface RateLimitAnalytics {
  totalRequests: number;
  totalAllowed: number;
  totalBlocked: number;
  uniqueIPs: number;
  averageRequestsPerMinute: number;
  peakRequestsPerMinute: number;
  topIPs: Array<{ ip: string; requests: number; percentage: number }>;
  hourlyStats: Array<{ hour: string; requests: number; allowed: number; blocked: number }>;
  recentActivity: Array<{ ip: string; timestamp: number; allowed: boolean; userAgent?: string }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    blockedPercentage: number;
    averageResponseTime: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<RateLimitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showQuickLinksModal, setShowQuickLinksModal] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/rate-limits');
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Network error while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const resetStats = async () => {
    try {
      const response = await fetch('/api/analytics/rate-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchAnalytics();
      } else {
        setError(result.error || 'Failed to reset statistics');
      }
    } catch (err) {
      setError('Network error while resetting statistics');
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQuickLinksModal) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowQuickLinksModal(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickLinksModal]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rate Limit Analytics</h1>
              <p className="text-gray-600 mt-2">Real-time monitoring and usage statistics</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick Links Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickLinksModal(!showQuickLinksModal)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span>🔗</span>
                  <span>Quick Links</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showQuickLinksModal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showQuickLinksModal && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-40 md:hidden"
                      onClick={() => setShowQuickLinksModal(false)}
                    ></div>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <a 
                        href="/" 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 group"
                        onClick={() => setShowQuickLinksModal(false)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm">💬</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">Chat Interface</div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      
                      <a 
                        href="/admin" 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
                        onClick={() => setShowQuickLinksModal(false)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm">⚙️</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">Admin Panel</div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      
                      <a 
                        href="/safety" 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 group"
                        onClick={() => setShowQuickLinksModal(false)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm">🛡️</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">Safety Dashboard</div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">Auto-refresh</span>
                </div>
                
                <button
                  onClick={fetchAnalytics}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={resetStats}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  🗑️ Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className={`text-2xl font-bold ${getStatusColor(analytics.systemHealth.status).split(' ')[0]}`}>
                  {analytics.systemHealth.status.toUpperCase()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(analytics.systemHealth.status)}`}>
                {analytics.systemHealth.status}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.totalRequests.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked Requests</p>
              <p className="text-2xl font-bold text-red-600">{analytics.totalBlocked.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{analytics.systemHealth.blockedPercentage}% of total</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique IPs</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.uniqueIPs}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Rate</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average/min</span>
                <span className="font-medium">{analytics.averageRequestsPerMinute}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak/min</span>
                <span className="font-medium">{analytics.peakRequestsPerMinute}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Success Rate</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Allowed</span>
                <span className="font-medium text-green-600">{analytics.totalAllowed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blocked</span>
                <span className="font-medium text-red-600">{analytics.totalBlocked.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${100 - analytics.systemHealth.blockedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top IPs</h3>
            <div className="space-y-2">
              {analytics.topIPs.slice(0, 5).map((ip, index) => (
                <div key={ip.ip} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">{ip.ip}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{ip.requests}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full" 
                        style={{ width: `${ip.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Stats Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">24-Hour Activity</h3>
          <div className="grid grid-cols-12 gap-2">
            {analytics.hourlyStats.map((hour, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{hour.hour}</div>
                <div className="space-y-1">
                  <div 
                    className="bg-blue-600 rounded-sm" 
                    style={{ height: `${Math.max(2, (hour.requests / Math.max(...analytics.hourlyStats.map(h => h.requests))) * 40)}px` }}
                    title={`${hour.requests} requests`}
                  ></div>
                  <div className="text-xs text-gray-400">{hour.requests}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">IP Address</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">User Agent</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentActivity.map((activity, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 text-sm text-gray-800">{activity.ip}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.allowed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activity.allowed ? 'ALLOWED' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="py-2 text-sm text-gray-600 truncate max-w-xs">
                      {activity.userAgent || 'Unknown'}
                    </td>
                    <td className="py-2 text-sm text-gray-500">
                      {formatTimestamp(activity.timestamp)}
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
