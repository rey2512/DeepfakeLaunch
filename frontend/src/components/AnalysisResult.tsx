import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AlertTriangle, CheckCircle, Info, BarChart, Brain, Activity, Scan, Grid3X3, Layers, Fingerprint, Code, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AnalysisResult as AnalysisData } from "@/types";

interface FeatureContributions {
  cnn_score: number;
  fft_score: number;
  noise_score: number;
  edge_score: number;
  texture_score: number;
}

interface AnalysisResultProps {
  score: number;
  loading?: boolean;
  fileType?: string;
  frameScores?: number[];
  framesAnalyzed?: number;
  featureContributions?: AnalysisData['feature_contributions'];
}

export const AnalysisResult = ({ 
  score, 
  loading, 
  fileType = "image",
  frameScores = [],
  framesAnalyzed = 0,
  featureContributions
}: AnalysisResultProps) => {
  const [showFrameDetails, setShowFrameDetails] = useState(false);
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can safely check for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (score: number, isDark = false) => {
    if (score >= 80) return isDark ? "rgb(248, 113, 113)" : "rgb(220, 38, 38)"; // Red for likely fake
    if (score >= 60) return isDark ? "rgb(250, 204, 21)" : "rgb(234, 179, 8)"; // Yellow for uncertain
    if (score >= 40) return isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)"; // Blue for somewhat uncertain
    return isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)"; // Green for likely real
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return "Likely Manipulated";
    if (score >= 60) return "Potentially Manipulated";
    if (score >= 40) return "Uncertain";
    return "Likely Authentic";
  };

  const isDark = mounted && theme === "dark";
  const color = getStatusColor(score, isDark);
  const trailColor = isDark ? "#374151" : "#f3f4f6";

  // Feature icons and descriptions
  const featureInfo = {
    noise_analysis: {
      name: "Noise Analysis",
      icon: <Activity className="w-4 h-4" />,
      description: "Detection of inconsistent noise patterns that indicate manipulation.",
      explanation: "AI-generated images often have unnatural noise patterns. High scores indicate abnormal noise distribution."
    },
    facial_features: {
      name: "Facial Analysis",
      icon: <Brain className="w-4 h-4" />,
      description: "Analysis of facial features for signs of AI generation.",
      explanation: "Examines facial symmetry, eye details, and skin texture. AI faces often have subtle imperfections."
    },
    compression_artifacts: {
      name: "Compression Analysis",
      icon: <Grid3X3 className="w-4 h-4" />,
      description: "Identification of irregular compression artifacts.",
      explanation: "Deepfakes often show unusual compression patterns where the manipulated areas meet the original content."
    },
    temporal_consistency: {
      name: "Temporal Consistency",
      icon: <BarChart className="w-4 h-4" />,
      description: "Measurement of consistency between frames in videos.",
      explanation: "For videos, this checks if motion flows naturally. Deepfakes may show inconsistent movement between frames."
    },
    metadata_analysis: {
      name: "Metadata Analysis",
      icon: <Scan className="w-4 h-4" />,
      description: "Analysis of file metadata for inconsistencies.",
      explanation: "Examines file headers and encoding information which may reveal manipulation or generation artifacts."
    }
  };

  // Evidence explanations based on score range
  const getEvidenceExplanation = () => {
    if (score >= 80) {
      return {
        title: "Strong Evidence of Manipulation",
        points: [
          "High anomaly scores across multiple detection methods",
          "Inconsistent noise patterns typical of AI generation",
          "Unnatural artifacts in key visual elements",
          featureContributions && featureContributions.facial_features > 70 ? "Facial feature inconsistencies detected" : "Statistical patterns matching known deepfakes",
          featureContributions && featureContributions.compression_artifacts > 70 ? "Suspicious compression artifacts around edited regions" : "Digital fingerprints consistent with AI tools"
        ]
      };
    } else if (score >= 60) {
      return {
        title: "Moderate Evidence of Manipulation",
        points: [
          "Some anomalies detected in visual patterns",
          featureContributions && featureContributions.noise_analysis > 60 ? "Unusual noise distribution in parts of the content" : "Partial inconsistencies in content structure",
          "Some statistical markers of digital alteration",
          "Moderate confidence in manipulation detection",
          "Further verification with alternate methods recommended"
        ]
      };
    } else if (score >= 40) {
      return {
        title: "Inconclusive Analysis",
        points: [
          "Mixed signals from different detection methods",
          "Some anomalies present but not conclusive",
          "Potential legitimate editing vs. deepfake indistinguishable",
          "Analysis limited by file quality or resolution",
          "Results fall within margin of error - cannot determine authenticity"
        ]
      };
    } else {
      return {
        title: "Signs of Authenticity",
        points: [
          "Natural noise patterns consistent with camera sensors",
          "No statistical anomalies in visual elements",
          "Consistent quality throughout the content",
          "No detection of known AI generation patterns",
          "High confidence in content authenticity"
        ]
      };
    }
  };

  const evidence = getEvidenceExplanation();

  return (
    <div className={cn(
      "glass-card p-8 rounded-xl w-full max-w-md mx-auto",
      "animate-in"
    )}>
      <div className="flex flex-col items-center gap-6">
        <div className="w-48 h-48">
          <CircularProgressbar
            value={score}
            text={`${score.toFixed(1)}%`}
            styles={buildStyles({
              pathColor: color,
              textColor: isDark ? "#f9fafb" : color,
              trailColor: trailColor,
              pathTransitionDuration: 0.5,
            })}
          />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {score >= 80 ? (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : score >= 60 ? (
              <Info className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            ) : score >= 40 ? (
              <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
            <h3 className="text-xl font-semibold dark:text-gray-100">{getStatusText(score)}</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Our multi-layer analysis shows this {fileType} has a {score.toFixed(1)}% manipulation probability.
          </p>
          
          {/* Detailed Explanation Button */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="mt-4 flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mx-auto"
          >
            <Fingerprint className="w-4 h-4" />
            {showExplanation ? "Hide" : "Show"} detailed analysis
          </button>
          
          {/* Detailed Explanation Panel */}
          {showExplanation && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left animate-in fade-in-50 duration-300">
              <p className="font-medium text-sm dark:text-gray-200 mb-2">
                {evidence.title}:
              </p>
              <ul className="space-y-1.5 mb-3">
                {evidence.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                Analysis confidence may vary based on file quality, compression, and content type.
              </p>
            </div>
          )}
          
          {/* Feature Contributions Section */}
          {featureContributions && (
            <div className="mt-4">
              <button
                onClick={() => setShowFeatureDetails(!showFeatureDetails)}
                className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mx-auto"
              >
                <Code className="w-4 h-4" />
                {showFeatureDetails ? "Hide" : "Show"} detection metrics
              </button>
              
              {showFeatureDetails && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left animate-in fade-in-50 duration-300">
                  <p className="text-sm font-medium mb-3 dark:text-gray-200">Technical Analysis Metrics:</p>
                  <div className="space-y-4">
                    {Object.entries(featureContributions).map(([key, value]) => {
                      if (value === undefined) return null;
                      const featureKey = key as keyof typeof featureInfo;
                      const info = featureInfo[featureKey];
                      
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-gray-600 dark:text-gray-400">
                              {info?.icon || <Info className="w-4 h-4" />}
                            </div>
                            <div className="text-sm font-medium dark:text-gray-200">{info?.name || key}:</div>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500 ease-out" 
                                style={{ 
                                  width: `${value}%`,
                                  backgroundColor: getStatusColor(value, isDark)
                                }}
                              />
                            </div>
                            <div className="text-xs font-medium w-10 text-right" style={{ color: getStatusColor(value, isDark) }}>
                              {value.toFixed(1)}%
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{info?.description}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 ml-6 italic mt-0.5">{info?.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Our system combines multiple detection techniques for higher accuracy. No single metric determines the final score.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Frame Analysis Section (for videos) */}
          {fileType === "video" && frameScores && frameScores.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowFrameDetails(!showFrameDetails)}
                className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mx-auto"
              >
                <BarChart className="w-4 h-4" />
                {showFrameDetails ? "Hide" : "Show"} frame analysis
              </button>
              
              {showFrameDetails && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium dark:text-gray-200">Frame-by-frame analysis:</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {framesAnalyzed} frames analyzed
                    </p>
                  </div>
                  
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                    {frameScores.map((frameScore, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 w-16">Frame {index + 1}:</div>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300 ease-out" 
                            style={{ 
                              width: `${frameScore}%`,
                              backgroundColor: getStatusColor(frameScore, isDark)
                            }}
                          />
                        </div>
                        <div className="text-xs font-medium w-10 text-right" style={{ color: getStatusColor(frameScore, isDark) }}>
                          {frameScore.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                    Variation between frames may indicate localized manipulation or inconsistent editing.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 text-sm px-4 py-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
            <p className="font-medium dark:text-gray-200 mb-2">Interpretation Guide:</p>
            <ul className="text-left space-y-1.5 text-gray-600 dark:text-gray-300 text-sm">
              {score >= 80 ? (
                <>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    High probability of synthetic content or manipulation
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Multiple detection systems flagged this content
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Likely created using AI or deepfake technology
                  </li>
                </>
              ) : score >= 60 ? (
                <>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Moderate indicators of potential manipulation
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Some suspicious patterns detected but not conclusive
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Further verification with alternate methods recommended
                  </li>
                </>
              ) : score >= 40 ? (
                <>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Analysis results are inconclusive
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Some anomalies detected but within normal range
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Cannot confidently determine authenticity
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Low probability of digital manipulation
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    No significant indicators of synthetic content
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Characteristics consistent with authentic media
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};