'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [runningEval, setRunningEval] = useState(false);
  const [rateLimitStats, setRateLimitStats] = useState<any>(null);
  const [showQuickLinksModal, setShowQuickLinksModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Please select files to upload');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Successfully uploaded ${result.uploadedFiles.length} files and re-indexed knowledge base`);
        setExistingFiles(result.existingFiles);
        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setFiles(null);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Upload failed: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const handleReindex = async () => {
    setUploading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/reindex', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Successfully re-indexed ${result.documentCount} documents`);
        setExistingFiles(result.files);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Re-indexing failed: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const loadExistingFiles = async () => {
    try {
      const response = await fetch('/api/admin/files');
      const result = await response.json();
      if (response.ok) {
        setExistingFiles(result.files);
      }
    } catch (error) {
      console.error('Failed to load existing files:', error);
    }
  };

  const handleRunEvaluation = async () => {
    setRunningEval(true);
    setMessage('');

    try {
      const response = await fetch('/api/eval');
      const result = await response.json();

      if (response.ok) {
        setEvaluationResults(result);
        setMessage(`Enhanced evaluation completed: ${result.summary.passedTests}/${result.summary.totalTests} tests passed (${result.summary.successRate}%)`);
      } else {
        setMessage(`Evaluation failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Evaluation failed: ${error}`);
    } finally {
      setRunningEval(false);
    }
  };

  const handleExportEvaluation = () => {
    if (!evaluationResults) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: evaluationResults.summary,
      results: evaluationResults.results
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evaluation-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadRateLimitStats = async () => {
    try {
      const response = await fetch('/api/analytics/rate-limits');
      const result = await response.json();
      
      if (result.success) {
        setRateLimitStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load rate limit stats:', error);
    }
  };


  // Load existing files and rate limit stats on component mount
  useEffect(() => {
    loadExistingFiles();
    loadRateLimitStats();
  }, []);

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

  return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
          <div className="flex-1 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
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
                      
                      <a 
                        href="/analytics" 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 group"
                        onClick={() => setShowQuickLinksModal(false)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm">📊</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">Rate Limit Analytics</div>
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
            </div>
          </div>
          
               {/* Quick Stats */}
               {rateLimitStats && (
                 <div className="mb-6 sm:mb-8">
                   <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Quick Stats</h2>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                       <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{rateLimitStats.totalRequests}</div>
                       <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">Total Requests</div>
                     </div>
                     <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800">
                       <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{rateLimitStats.totalAllowed}</div>
                       <div className="text-xs sm:text-sm text-green-800 dark:text-green-300">Allowed</div>
                     </div>
                     <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-800">
                       <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{rateLimitStats.totalBlocked}</div>
                       <div className="text-xs sm:text-sm text-red-800 dark:text-red-300">Blocked</div>
                     </div>
                     <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                       <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{rateLimitStats.uniqueIPs}</div>
                       <div className="text-xs sm:text-sm text-purple-800 dark:text-purple-300">Unique IPs</div>
                     </div>
                   </div>
                 </div>
               )}
          
          
          {/* Upload Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Upload New Documents</h2>
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 sm:p-6">
              <input
                id="fileInput"
                type="file"
                multiple
                accept=".md,.txt"
                onChange={handleFileChange}
                className="mb-3 sm:mb-4 w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 dark:hover:file:bg-blue-900/30"
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !files || files.length === 0}
                  className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {uploading ? 'Uploading...' : 'Upload & Re-index'}
                </button>
                <button
                  onClick={handleReindex}
                  disabled={uploading}
                  className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {uploading ? 'Re-indexing...' : 'Re-index Existing Files'}
                </button>
                <button
                  onClick={handleRunEvaluation}
                  disabled={runningEval}
                  className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {runningEval ? 'Running...' : 'Run Evaluation'}
                </button>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('failed') 
                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800' 
                : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
            }`}>
              {message}
            </div>
          )}

          {/* Evaluation Results */}
          {evaluationResults && (
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Enhanced Evaluation Results</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleExportEvaluation}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs sm:text-sm hover:bg-green-700"
                  >
                    📊 Export Report
                  </button>
                  <button
                    onClick={() => setShowDetailedResults(!showDetailedResults)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs sm:text-sm hover:bg-blue-700"
                  >
                    {showDetailedResults ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 sm:p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{evaluationResults.summary.passedTests}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tests Passed</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">out of {evaluationResults.summary.totalTests}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{evaluationResults.summary.successRate}%</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">overall performance</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{evaluationResults.summary.avgResponseTime}ms</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">retrieval + generation</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{Math.round(evaluationResults.summary.avgConfidenceScore * 100)}%</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Confidence Score</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">response quality</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Category Breakdown */}
                  <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 text-sm sm:text-base">Performance by Category</h4>
                    {Object.entries(evaluationResults.summary.categoryStats || {}).map(([category, stats]: [string, any]) => (
                      <div key={category} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-100 dark:border-slate-600 last:border-b-0">
                        <div>
                          <span className="font-medium capitalize text-xs sm:text-sm text-gray-800 dark:text-gray-200">{category}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{stats.passed}/{stats.total} tests</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-medium text-green-600">{stats.successRate}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{stats.avgTime}ms avg</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 text-sm sm:text-base">Performance by Difficulty</h4>
                    {Object.entries(evaluationResults.summary.difficultyStats || {}).map(([difficulty, stats]: [string, any]) => (
                      <div key={difficulty} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-100 dark:border-slate-600 last:border-b-0">
                        <div>
                          <span className="font-medium capitalize text-xs sm:text-sm text-gray-800 dark:text-gray-200">{difficulty}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{stats.passed}/{stats.total} tests</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-medium text-green-600">{stats.successRate}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{stats.avgTime}ms avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best/Worst Tests */}
                {evaluationResults.summary.bestTest && evaluationResults.summary.worstTest && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base"> Best Performing Test</h4>
                      <p className="text-xs sm:text-sm text-green-700 mb-1">{evaluationResults.summary.bestTest.question}</p>
                      <div className="text-xs text-green-600">
                        Overall Score: {Math.round(evaluationResults.summary.bestTest.overallScore * 100)}%
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">⚠️ Needs Improvement</h4>
                      <p className="text-xs sm:text-sm text-red-700 mb-1">{evaluationResults.summary.worstTest.question}</p>
                      <div className="text-xs text-red-600">
                        Overall Score: {Math.round(evaluationResults.summary.worstTest.overallScore * 100)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Results */}
                {showDetailedResults && (
                  <div className="mt-4 sm:mt-6">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 text-sm sm:text-base">Detailed Test Results</h4>
                    <div className="space-y-3 sm:space-y-4">
                      {evaluationResults.results.map((result: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2 sm:gap-0">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">{result.question}</p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{result.description}</p>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs text-gray-700 dark:text-gray-300">
                                <div>
                                  <span className="font-medium">Category:</span> {result.category}
                                </div>
                                <div>
                                  <span className="font-medium">Difficulty:</span> {result.difficulty}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span> {result.totalTime}ms
                                </div>
                                <div>
                                  <span className="font-medium">Confidence:</span> {Math.round(result.confidenceScore * 100)}%
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-end space-y-1 sm:space-y-0 sm:space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {result.success ? 'PASS' : 'FAIL'}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Score: {Math.round(((result.performanceScore + result.confidenceScore + result.sourceRelevanceScore) / 3) * 100)}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-600">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span className="font-medium">Expected Sources:</span> {result.expectedSources.join(', ')}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Found Sources:</span> {result.sourcesFound.join(', ')}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              <span className="font-medium">Response:</span> {result.response}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Existing Files */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Current Knowledge Base</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {existingFiles.map((file, index) => (
                <div key={index} className="bg-gray-100 dark:bg-slate-700 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">✓ Indexed</span>
                  </div>
                </div>
              ))}
            </div>
            {existingFiles.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 italic">No files in knowledge base</p>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm sm:text-base">Instructions:</h3>
            <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Upload .md or .txt files to add them to the knowledge base</li>
              <li>• Files are automatically processed and indexed for search</li>
              <li>• Use "Re-index" to refresh the search index without uploading new files</li>
              <li>• The AI will use these documents to answer questions</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
