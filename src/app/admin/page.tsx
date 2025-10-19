'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [runningEval, setRunningEval] = useState(false);

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

  // Load existing files on component mount
  useState(() => {
    loadExistingFiles();
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>
          
          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Documents</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                id="fileInput"
                type="file"
                multiple
                accept=".md,.txt"
                onChange={handleFileChange}
                className="mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !files || files.length === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload & Re-index'}
                </button>
                <button
                  onClick={handleReindex}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Re-indexing...' : 'Re-index Existing Files'}
                </button>
                <button
                  onClick={handleRunEvaluation}
                  disabled={runningEval}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          {/* Evaluation Results */}
          {evaluationResults && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Enhanced Evaluation Results</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportEvaluation}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    📊 Export Report
                  </button>
                  <button
                    onClick={() => setShowDetailedResults(!showDetailedResults)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    {showDetailedResults ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-green-600">{evaluationResults.summary.passedTests}</div>
                    <div className="text-sm text-gray-600">Tests Passed</div>
                    <div className="text-xs text-gray-500">out of {evaluationResults.summary.totalTests}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-blue-600">{evaluationResults.summary.successRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                    <div className="text-xs text-gray-500">overall performance</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-purple-600">{evaluationResults.summary.avgResponseTime}ms</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                    <div className="text-xs text-gray-500">retrieval + generation</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(evaluationResults.summary.avgConfidenceScore * 100)}%</div>
                    <div className="text-sm text-gray-600">Confidence Score</div>
                    <div className="text-xs text-gray-500">response quality</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Category Breakdown */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-3">Performance by Category</h4>
                    {Object.entries(evaluationResults.summary.categoryStats || {}).map(([category, stats]: [string, any]) => (
                      <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium capitalize">{category}</span>
                          <div className="text-xs text-gray-500">{stats.passed}/{stats.total} tests</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{stats.successRate}%</div>
                          <div className="text-xs text-gray-500">{stats.avgTime}ms avg</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-3">Performance by Difficulty</h4>
                    {Object.entries(evaluationResults.summary.difficultyStats || {}).map(([difficulty, stats]: [string, any]) => (
                      <div key={difficulty} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium capitalize">{difficulty}</span>
                          <div className="text-xs text-gray-500">{stats.passed}/{stats.total} tests</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{stats.successRate}%</div>
                          <div className="text-xs text-gray-500">{stats.avgTime}ms avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best/Worst Tests */}
                {evaluationResults.summary.bestTest && evaluationResults.summary.worstTest && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2"> Best Performing Test</h4>
                      <p className="text-sm text-green-700 mb-1">{evaluationResults.summary.bestTest.question}</p>
                      <div className="text-xs text-green-600">
                        Overall Score: {Math.round(evaluationResults.summary.bestTest.overallScore * 100)}%
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">⚠️ Needs Improvement</h4>
                      <p className="text-sm text-red-700 mb-1">{evaluationResults.summary.worstTest.question}</p>
                      <div className="text-xs text-red-600">
                        Overall Score: {Math.round(evaluationResults.summary.worstTest.overallScore * 100)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Results */}
                {showDetailedResults && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Detailed Test Results</h4>
                    <div className="space-y-4">
                      {evaluationResults.results.map((result: any, index: number) => (
                        <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{result.question}</p>
                              <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
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
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {result.success ? 'PASS' : 'FAIL'}
                              </span>
                              <div className="text-xs text-gray-500">
                                Score: {Math.round(((result.performanceScore + result.confidenceScore + result.sourceRelevanceScore) / 3) * 100)}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Expected Sources:</span> {result.expectedSources.join(', ')}
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Found Sources:</span> {result.sourcesFound.join(', ')}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Knowledge Base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingFiles.map((file, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{file}</span>
                    <span className="text-xs text-gray-500">✓ Indexed</span>
                  </div>
                </div>
              ))}
            </div>
            {existingFiles.length === 0 && (
              <p className="text-gray-500 italic">No files in knowledge base</p>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload .md or .txt files to add them to the knowledge base</li>
              <li>• Files are automatically processed and indexed for search</li>
              <li>• Use "Re-index" to refresh the search index without uploading new files</li>
              <li>• The AI will use these documents to answer questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
