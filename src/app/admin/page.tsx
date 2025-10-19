'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
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
        setMessage(`Evaluation completed: ${result.summary.passedTests}/${result.summary.totalTests} tests passed (${result.summary.successRate}%)`);
      } else {
        setMessage(`Evaluation failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Evaluation failed: ${error}`);
    } finally {
      setRunningEval(false);
    }
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Evaluation Results</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{evaluationResults.summary.totalTests}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{evaluationResults.summary.passedTests}</div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{evaluationResults.summary.failedTests}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{evaluationResults.summary.successRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {evaluationResults.results.map((result: any, index: number) => (
                    <div key={index} className={`p-3 rounded border-l-4 ${
                      result.success ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{result.description}</div>
                          <div className="text-sm text-gray-600">{result.question}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? 'PASS' : 'FAIL'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Expected: {result.expectedSources.join(', ')} | 
                        Found: {result.sourcesFound.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
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
