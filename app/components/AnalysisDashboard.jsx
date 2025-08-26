import React, { useState } from 'react';
import { PiBrainBold, PiStarBold, PiClockBold, PiWarningCircleBold, PiLightbulbBold, PiPlayBold, PiSpinnerBold } from 'react-icons/pi';
import { loadApiKey, loadSelectedModel } from '../utils/localStorage';
import { getAllModels } from '../utils/api';

const AnalysisDashboard = ({ 
  analysisStats, 
  onAnalyzePrompt, 
  onBatchAnalyze, 
  unanalyzedPrompts = [] 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [analysisResults, setAnalysisResults] = useState(null);

  // Get stored API configuration
  const apiKey = loadApiKey();
  const selectedModel = loadSelectedModel();
  const hasValidConfig = apiKey && selectedModel;

  const handleBatchAnalysis = async () => {
    if (!hasValidConfig || unanalyzedPrompts.length === 0) return;
    
    setIsAnalyzing(true);
    setBatchProgress({ current: 0, total: unanalyzedPrompts.length });
    
    try {
      const result = await onBatchAnalyze(
        apiKey, 
        selectedModel,
        (current, total, error) => {
          setBatchProgress({ current, total });
          if (error) {
            console.warn(`Analysis error for prompt ${current}:`, error);
          }
        }
      );
      
      setAnalysisResults(result);
    } catch (error) {
      console.error('Batch analysis failed:', error);
      setAnalysisResults({ success: false, error: error.message });
    } finally {
      setIsAnalyzing(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  const getQualityColor = (score) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400'; 
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getApplicabilityColor = (score) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-[#2a2a2a] border border-[#404040] rounded-lg p-4 mb-4 z-50 translate-y-[150px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PiBrainBold className="text-blue-400 text-xl" />
          <h3 className="text-lg font-medium text-white">AI Analysis</h3>
        </div>
        
        {/* Batch Analysis Button */}
        {unanalyzedPrompts.length > 0 && hasValidConfig && (
          <button
            onClick={handleBatchAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            {isAnalyzing ? (
              <>
                <PiSpinnerBold className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <PiPlayBold />
                <span>Analyze {unanalyzedPrompts.length} Prompts</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isAnalyzing && batchProgress.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Analyzing prompts...</span>
            <span>{batchProgress.current} / {batchProgress.total}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Configuration Warning */}
      {!hasValidConfig && (
        <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-md p-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-300">
            <PiWarningCircleBold />
            <span className="text-sm">
              Configure your API key and model in settings to enable AI analysis
            </span>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#3a3a3a] rounded-md p-3">
          <div className="text-gray-400 text-sm mb-1">Total Prompts</div>
          <div className="text-white text-xl font-bold">{analysisStats.totalPrompts}</div>
        </div>
        
        <div className="bg-[#3a3a3a] rounded-md p-3">
          <div className="text-gray-400 text-sm mb-1">Analyzed</div>
          <div className="text-blue-400 text-xl font-bold">{analysisStats.analyzedPrompts}</div>
        </div>
        
        <div className="bg-[#3a3a3a] rounded-md p-3">
          <div className="text-gray-400 text-sm mb-1">Pending</div>
          <div className="text-orange-400 text-xl font-bold">{analysisStats.pendingAnalysis}</div>
        </div>
        
        <div className="bg-[#3a3a3a] rounded-md p-3">
          <div className="text-gray-400 text-sm mb-1">High Quality</div>
          <div className="text-green-400 text-xl font-bold">{analysisStats.usefulPrompts}</div>
        </div>
      </div>

      {/* Quality Metrics */}
      {analysisStats.analyzedPrompts > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#3a3a3a] rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <PiStarBold className={getQualityColor(analysisStats.averageQuality)} />
              <span className="text-gray-400 text-sm">Average Quality</span>
            </div>
            <div className={`text-lg font-bold ${getQualityColor(analysisStats.averageQuality)}`}>
              {(analysisStats.averageQuality * 100).toFixed(0)}%
            </div>
          </div>
          
          <div className="bg-[#3a3a3a] rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <PiClockBold className={getApplicabilityColor(analysisStats.averageApplicability)} />
              <span className="text-gray-400 text-sm">Future Applicability</span>
            </div>
            <div className={`text-lg font-bold ${getApplicabilityColor(analysisStats.averageApplicability)}`}>
              {(analysisStats.averageApplicability * 100).toFixed(0)}%
            </div>
          </div>
          
          <div className="bg-[#3a3a3a] rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <PiWarningCircleBold className="text-red-400" />
              <span className="text-gray-400 text-sm">Risk Factors</span>
            </div>
            <div className="text-red-400 text-lg font-bold">
              {analysisStats.riskyPrompts}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="bg-[#3a3a3a] rounded-md p-3">
          <h4 className="text-white font-medium mb-2">Last Analysis Results</h4>
          {analysisResults.success ? (
            <div className="text-green-400 text-sm">
              ✓ Successfully analyzed {analysisResults.analyzed} of {analysisResults.total} prompts
            </div>
          ) : (
            <div className="text-red-400 text-sm">
              ✗ Analysis failed: {analysisResults.error}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {analysisStats.totalPrompts === 0 && (
        <div className="text-center py-8">
          <PiLightbulbBold className="text-gray-400 text-4xl mx-auto mb-2" />
          <div className="text-gray-400">No prompts to analyze yet</div>
          <div className="text-gray-500 text-sm">Add some prompts to get started with AI analysis</div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;