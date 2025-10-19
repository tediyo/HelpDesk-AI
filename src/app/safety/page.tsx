'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';

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
  const [showQuickLinksModal, setShowQuickLinksModal] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Safety Dashboard</h2>
          <p className="text-gray-600">Analyzing security metrics and threat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Safety Dashboard Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchSafetyReport}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Safety Data</h2>
          <p className="text-gray-600 mb-6">Safety metrics are not available at this time.</p>
          <button
            onClick={fetchSafetyReport}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🔄 Load Data
          </button>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex flex-col">
          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
            {/* Professional Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl sm:text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Safety Dashboard</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">AI-powered safety monitoring and threat detection system</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {autoRefresh ? 'Live monitoring active' : 'Monitoring paused'}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
            
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
                  {/* Quick Links Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowQuickLinksModal(!showQuickLinksModal)}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
                    >
                      <span>🔗</span>
                      <span>Quick Links</span>
                      <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showQuickLinksModal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        href="/analytics" 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 group"
                        onClick={() => setShowQuickLinksModal(false)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm">📊</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">Rate Limit Analytics </div>
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-xl">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Auto-refresh</span>
                    </div>
                    
                    <button
                      onClick={fetchSafetyReport}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      onClick={resetSafetyMetrics}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      🗑️ Reset
                    </button>
                  </div>
            </div>
          </div>
        </div>

            {/* Safety Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-xl">🛡️</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-3xl font-bold text-green-700">{report.summary.safetyRate}%</div>
                    <div className="text-xs sm:text-sm text-green-600 font-medium">Safety Rate</div>
                  </div>
                </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${report.summary.safetyRate}%` }}
              ></div>
            </div>
          </div>
          
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-xl">📊</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-3xl font-bold text-blue-700">{report.summary.totalScans.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-blue-600 font-medium">Total Scans</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  All-time safety checks performed
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-xl">🎯</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-3xl font-bold text-purple-700">{report.summary.averageConfidence}%</div>
                    <div className="text-xs sm:text-sm text-purple-600 font-medium">Avg Confidence</div>
                  </div>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${report.summary.averageConfidence}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-xl">⚠️</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-3xl font-bold text-red-700">{report.summary.riskDistribution.critical}</div>
                    <div className="text-xs sm:text-sm text-red-600 font-medium">Critical Threats</div>
                  </div>
                </div>
                <div className="text-xs text-red-600">
                  High-priority security issues
                </div>
              </div>
        </div>

            {/* Risk Distribution & Top Threats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-lg">📊</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Risk Distribution</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(report.summary.riskDistribution).map(([risk, count]) => {
                    const percentage = report.summary.totalScans > 0 ? (count / report.summary.totalScans) * 100 : 0;
                    return (
                      <div key={risk} className="group">
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(risk)}`}>
                              {risk.toUpperCase()}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600">{count} threats</span>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-gray-700">{percentage.toFixed(1)}%</span>
                        </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          risk === 'low' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          risk === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          risk === 'high' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-lg">⚠️</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Top Threats</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {report.topThreats.slice(0, 5).map((threat, index) => {
                    const maxCount = Math.max(...report.topThreats.map(t => t.count));
                    const percentage = (threat.count / maxCount) * 100;
                    return (
                      <div key={index} className="group p-3 sm:p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-800 flex-1 pr-2">{threat.pattern}</span>
                          <span className="text-xs sm:text-sm font-bold text-red-600 bg-red-200 px-2 py-1 rounded-full">
                            {threat.count}
                          </span>
                        </div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(10, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm sm:text-lg">💡</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Security Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {report.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-200">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-blue-800 font-medium">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Features */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm sm:text-lg">🛡️</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Active Safety Features</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="group p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg sm:text-xl">🔍</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Content Filtering</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Detects harmful, inappropriate, and off-topic content with AI-powered analysis</p>
                </div>
            
                <div className="group p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg sm:text-xl">🛡️</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Prompt Injection Protection</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Prevents attempts to manipulate system behavior and bypass safety measures</p>
                </div>
                
                <div className="group p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg sm:text-xl">🎯</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Context Awareness</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Ensures responses are relevant to our service scope and business context</p>
                </div>
                
                <div className="group p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg sm:text-xl">📊</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Confidence Scoring</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Measures response reliability and safety with advanced confidence metrics</p>
                </div>
                
                <div className="group p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg sm:text-xl">⚡</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Real-time Monitoring</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Continuous threat detection and analysis with live security updates</p>
                </div>
                
                <div className="group p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg sm:text-xl">💡</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Smart Suggestions</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Provides helpful alternatives and guidance for blocked or inappropriate queries</p>
                </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
