'use client';

import { useState, useEffect } from 'react';

interface SafetyReport {
  summary: {
    totalScans: number;
    safetyRate: number;
    averageConfidence: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  topThreats: Array<{ pattern: string; count: number }>;
  recommendations: string[];
}

export default function SafetyPage() {
  const [report, setReport] = useState<SafetyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSafetyReport = async () => {
    try {
      const response = await fetch('/api/analytics/safety');
      const result = await response.json();
      
      if (result.success) {
        setReport(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch safety report');
      }
    } catch (err) {
      setError('Network error while fetching safety report');
    } finally {
      setLoading(false);
    }
  };

  const resetSafetyMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchSafetyReport();
      } else {
        setError(result.error || 'Failed to reset safety metrics');
      }
    } catch (err) {
      setError('Network error while resetting safety metrics');
    }
  };

  useEffect(() => {
    fetchSafetyReport();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSafetyReport, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading safety report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🛡️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSafetyReport}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No safety data available</p>
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
              <h1 className="text-3xl font-bold text-gray-900">🛡️ Safety Dashboard</h1>
              <p className="text-gray-600 mt-2">AI-powered safety monitoring and threat detection</p>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                Auto-refresh (10s)
              </label>
              <button
                onClick={fetchSafetyReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🔄 Refresh
              </button>
              <button
                onClick={resetSafetyMetrics}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🗑️ Reset Metrics
              </button>
            </div>
          </div>
        </div>

        {/* Safety Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Rate</p>
                <p className="text-2xl font-bold text-green-600">{report.summary.safetyRate}%</p>
              </div>
              <div className="text-3xl">🛡️</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-2xl font-bold text-blue-600">{report.summary.totalScans.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-600">{report.summary.averageConfidence}%</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Threats</p>
              <p className="text-2xl font-bold text-red-600">{report.summary.riskDistribution.critical}</p>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
            <div className="space-y-3">
              {Object.entries(report.summary.riskDistribution).map(([risk, count]) => (
                <div key={risk} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk)}`}>
                      {risk.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          risk === 'low' ? 'bg-green-500' :
                          risk === 'medium' ? 'bg-yellow-500' :
                          risk === 'high' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ 
                          width: `${report.summary.totalScans > 0 ? (count / report.summary.totalScans) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Threats</h3>
            <div className="space-y-2">
              {report.topThreats.slice(0, 5).map((threat, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm text-gray-700 truncate">{threat.pattern}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">{threat.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-red-500 h-1 rounded-full" 
                        style={{ 
                          width: `${Math.max(10, (threat.count / Math.max(...report.topThreats.map(t => t.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 Recommendations</h3>
            <div className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 text-sm">💡</span>
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Features */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🛡️ Active Safety Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Content Filtering</h4>
              <p className="text-sm text-gray-600">Detects harmful, inappropriate, and off-topic content</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Prompt Injection Protection</h4>
              <p className="text-sm text-gray-600">Prevents attempts to manipulate system behavior</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Context Awareness</h4>
              <p className="text-sm text-gray-600">Ensures responses are relevant to our service scope</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Confidence Scoring</h4>
              <p className="text-sm text-gray-600">Measures response reliability and safety</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Real-time Monitoring</h4>
              <p className="text-sm text-gray-600">Continuous threat detection and analysis</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Smart Suggestions</h4>
              <p className="text-sm text-gray-600">Provides helpful alternatives for blocked queries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
