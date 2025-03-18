import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisResult } from "@/components/AnalysisResult";
import { Footer } from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Zap, BarChart3, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AnalysisData {
  score: number;
  category: string;
  is_deepfake: boolean;
  file_path: string;
  file_type: "image" | "video";
  thumbnail_path?: string;
  frame_scores?: number[];
  frames_analyzed?: number;
  feature_contributions?: {
    cnn_score: number;
    fft_score: number;
    noise_score: number;
    edge_score: number;
    texture_score: number;
  };
}

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use the environment variable for the API URL, with a fallback
  const API_URL = import.meta.env.VITE_API_URL || "https://deepfakelaunch.onrender.com";

  const handleFileSelected = (file: File, analysisResult: AnalysisData) => {
    // Clear any previous errors
    setError(null);
    
    // Create a URL for the uploaded file to display
    const fileUrl = URL.createObjectURL(file);
    setUploadedFile(fileUrl);
    
    // Set the analysis result
    setResult(analysisResult);
    
    // Make sure to set analyzing to false when analysis is complete
    setAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Result: ${analysisResult.category} (${analysisResult.score}%)`,
    });
  };

  const resetAnalysis = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default behavior to avoid page navigation
    e.preventDefault();
    
    // Release object URL to prevent memory leaks
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile);
    }
    
    // Reset all states
    setResult(null);
    setUploadedFile(null);
    setError(null);
    
    // Scroll back to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <section className="text-center mb-8 animate-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient dark:text-gray-100">
            VerifiAI: Deepfake Detection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your content and let our advanced AI analyze it for signs of manipulation.
            Get instant results with detailed insights.
          </p>
        </section>
        
        <div className="max-w-2xl mx-auto space-y-8">
          {!result && (
            <>
              <UploadZone 
                onFileSelected={handleFileSelected} 
                setAnalyzing={setAnalyzing} 
              />
              
              {error && (
                <div className="text-center py-4">
                  <p className="text-red-500">{error}</p>
                </div>
              )}
            </>
          )}
          
          {analyzing && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Analyzing your content...</p>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 relative">
                  <div className="w-16 h-16 rounded-full absolute border-4 border-blue-400 dark:border-blue-600 opacity-20"></div>
                  <div className="w-16 h-16 rounded-full absolute border-t-4 border-blue-600 dark:border-blue-400 animate-spin"></div>
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Processing with our hybrid AI model...
                </div>
              </div>
            </div>
          )}
          
          {result && !analyzing && (
            <div className="space-y-8">
              {uploadedFile && result.file_type === "image" && (
                <div className="rounded-lg overflow-hidden shadow-lg max-w-md mx-auto">
                  <img 
                    src={uploadedFile} 
                    alt="Uploaded image" 
                    className="w-full h-auto"
                  />
                </div>
              )}
              
              {result.file_type === "video" && (
                <div className="rounded-lg overflow-hidden shadow-lg max-w-md mx-auto">
                  {uploadedFile ? (
                    <video 
                      src={uploadedFile} 
                      controls
                      className="w-full h-auto"
                    />
                  ) : result.thumbnail_path ? (
                    <div className="relative">
                      <img 
                        src={`${API_URL}${result.thumbnail_path}`}
                        alt="Video thumbnail" 
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm">Video preview</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              
              <AnalysisResult 
                score={result.score} 
                fileType={result.file_type}
                frameScores={result.frame_scores}
                framesAnalyzed={result.frames_analyzed}
                featureContributions={result.feature_contributions}
              />
              
              <div className="text-center">
                <button
                  onClick={resetAnalysis}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Analyze Another File
                </button>
              </div>
            </div>
          )}
        </div>

        <section id="how-it-works" className="mt-24 text-center scroll-mt-20">
          <h2 className="text-2xl font-semibold mb-8 dark:text-gray-100">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Shield className="w-10 h-10 text-blue-500 dark:text-blue-400" />,
                title: "Upload",
                description: "Drop your image or video file into our secure upload zone. We support various formats for comprehensive analysis."
              },
              {
                icon: <Zap className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />,
                title: "Analyze",
                description: "Our hybrid system combines deep learning with signal processing to detect manipulation with higher accuracy."
              },
              {
                icon: <BarChart3 className="w-10 h-10 text-green-500 dark:text-green-400" />,
                title: "Results",
                description: "Get detailed insights with feature-level breakdown and frame-by-frame analysis for videos."
              }
            ].map((step, index) => (
              <div
                key={index}
                className="glass-card p-8 rounded-xl hover-lift flex flex-col items-center dark:bg-gray-800/40 dark:backdrop-blur-lg dark:border-gray-700"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section id="about" className="mt-24 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-center dark:text-gray-100">About VerifiAI</h2>
            
            <div className="glass-card p-8 rounded-xl dark:bg-gray-800/40 dark:backdrop-blur-lg dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-medium mb-4 flex items-center dark:text-gray-100">
                    <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
                    The Deepfake Challenge
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Deepfakes represent a growing challenge in our digital world. These AI-generated 
                    synthetic media can convincingly replace faces, voices, and manipulate content in ways 
                    that are increasingly difficult to detect with the human eye.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    As this technology becomes more accessible, the potential for misuse in spreading 
                    misinformation, creating fake news, or impersonating individuals poses significant 
                    risks to trust in digital media.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-4 flex items-center dark:text-gray-100">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" />
                    Our Hybrid Solution
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Our deepfake detection system uses a hybrid approach that combines deep learning with 
                    traditional signal processing techniques to analyze content from multiple perspectives.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    By examining frequency domain inconsistencies, noise patterns, edge artifacts, and 
                    texture analysis alongside deep learning features, our system provides more robust 
                    and accurate detection than single-method approaches.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-medium mb-4 flex items-center dark:text-gray-100">
                  <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
                  Understanding Results
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mt-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <h4 className="font-medium dark:text-gray-100">Likely Authentic (0-50%)</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Content shows few or no signs of manipulation. Low scores indicate the media is likely genuine.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <h4 className="font-medium dark:text-gray-100">Potentially Manipulated (50-80%)</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Content shows some signs of manipulation and should be treated with caution.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <h4 className="font-medium dark:text-gray-100">Likely Manipulated (80-100%)</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Content shows strong signs of manipulation and is likely to be synthetic.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;