import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  score: number;
  loading?: boolean;
}

export const AnalysisResult = ({ score, loading }: AnalysisResultProps) => {
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

  return (
    <div className={cn(
      "glass-card p-8 rounded-xl w-full max-w-md mx-auto",
      "animate-in"
    )}>
      <div className="flex flex-col items-center gap-6">
        <div className="w-48 h-48">
          <CircularProgressbar
            value={score}
            text={`${score}%`}
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
            Our AI model has analyzed the content and provided a manipulation probability score.
          </p>
        </div>
      </div>
    </div>
  );
};