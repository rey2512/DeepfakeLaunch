import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AlertTriangle, CheckCircle, Info, BarChart, Brain, Activity, Scan, Grid3X3, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  fileType?: "image" | "video";
  frameScores?: number[];
  framesAnalyzed?: number;
  featureContributions?: FeatureContributions;
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

  const getStatusColor = (score: number) => {
    if (score > 80) return "rgb(220, 38, 38)"; // Red for likely fake
    if (score > 50) return "rgb(234, 179, 8)"; // Yellow for uncertain
    return "rgb(22, 163, 74)"; // Green for likely real
  };

  const getStatusText = (score: number) => {
    if (score > 80) return "Likely Manipulated";
    if (score > 50) return "Potentially Manipulated";
    return "Likely Authentic";
  };

  const color = getStatusColor(score);

  // Feature icons and descriptions
  const featureInfo = {
    cnn_score: {
      icon: <Brain className="w-4 h-4" />,
      name: "Deep Learning",
      description: "Analysis from convolutional neural networks trained on deepfake datasets"
    },
    fft_score: {
      icon: <Activity className="w-4 h-4" />,
      name: "Frequency Analysis",
      description: "Detection of inconsistencies in frequency domain that may indicate manipulation"
    },
    noise_score: {
      icon: <Scan className="w-4 h-4" />,
      name: "Noise Analysis",
      description: "Evaluation of noise patterns that are often inconsistent in manipulated media"
    },
    edge_score: {
      icon: <Grid3X3 className="w-4 h-4" />,
      name: "Edge Consistency",
      description: "Analysis of edge artifacts that can appear in manipulated images"
    },
    texture_score: {
      icon: <Layers className="w-4 h-4" />,
      name: "Texture Analysis",
      description: "Detection of texture inconsistencies that may indicate manipulation"
    }
  };

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
              textColor: color,
              trailColor: "#f3f4f6",
            })}
          />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {score > 80 ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : score > 50 ? (
              <Info className="w-5 h-5 text-yellow-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <h3 className="text-xl font-semibold">{getStatusText(score)}</h3>
          </div>
          <p className="text-sm text-gray-500">
            Our AI model has analyzed the {fileType} and provided a manipulation probability score.
          </p>
          
          {/* Feature Contributions Section */}
          {featureContributions && (
            <div className="mt-4">
              <button
                onClick={() => setShowFeatureDetails(!showFeatureDetails)}
                className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 mx-auto"
              >
                <Layers className="w-4 h-4" />
                {showFeatureDetails ? "Hide" : "Show"} analysis breakdown
              </button>
              
              {showFeatureDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-sm font-medium mb-2">Hybrid Analysis Breakdown:</p>
                  <div className="space-y-3">
                    {Object.entries(featureContributions).map(([key, value]) => {
                      if (value === undefined) return null;
                      const featureKey = key as keyof typeof featureInfo;
                      const info = featureInfo[featureKey];
                      
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-gray-600">
                              {info?.icon || <Info className="w-4 h-4" />}
                            </div>
                            <div className="text-sm font-medium">{info?.name || key}:</div>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full" 
                                style={{ 
                                  width: `${value}%`,
                                  backgroundColor: getStatusColor(value)
                                }}
                              />
                            </div>
                            <div className="text-xs font-medium" style={{ color: getStatusColor(value) }}>
                              {value.toFixed(1)}%
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 ml-6">{info?.description}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    Our hybrid system combines deep learning with traditional signal processing techniques for more accurate detection.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Frame Analysis Section (for videos) */}
          {fileType === "video" && frameScores.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowFrameDetails(!showFrameDetails)}
                className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 mx-auto"
              >
                <BarChart className="w-4 h-4" />
                {showFrameDetails ? "Hide" : "Show"} frame analysis
              </button>
              
              {showFrameDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-sm font-medium mb-2">Frame-by-frame analysis:</p>
                  <div className="space-y-2">
                    {frameScores.map((frameScore, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 w-16">Frame {index + 1}:</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${frameScore}%`,
                              backgroundColor: getStatusColor(frameScore)
                            }}
                          />
                        </div>
                        <div className="text-xs font-medium" style={{ color: getStatusColor(frameScore) }}>
                          {frameScore.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Analyzed {framesAnalyzed} frames from the video
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 text-sm">
            <p className="font-medium">What does this mean?</p>
            <ul className="text-left mt-2 space-y-1 text-gray-600">
              {score > 80 ? (
                <>
                  <li>• High probability of digital manipulation</li>
                  <li>• Significant indicators of synthetic content</li>
                  <li>• Likely created using AI or deepfake technology</li>
                </>
              ) : score > 50 ? (
                <>
                  <li>• Moderate indicators of manipulation</li>
                  <li>• Some suspicious patterns detected</li>
                  <li>• Further verification recommended</li>
                </>
              ) : (
                <>
                  <li>• Low probability of manipulation</li>
                  <li>• Few or no indicators of synthetic content</li>
                  <li>• Likely an authentic {fileType}</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};