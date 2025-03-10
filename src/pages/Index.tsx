import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisResult } from "@/components/AnalysisResult";
import { Footer } from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Zap, BarChart3, AlertTriangle, CheckCircle, Info } from "lucide-react";

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
    [key: string]: number;
  };
}

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelected = (file: File, analysisResult: AnalysisData) => {
    // Clear any previous errors
    setError(null);
    
    // Create a URL for the uploaded file to display
    const fileUrl = URL.createObjectURL(file);
    setUploadedFile(fileUrl);
    
    // Set the analysis result
    setResult(analysisResult);
    
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <section className="text-center mb-16 animate-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            VerifiAI: Deepfake Detection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
            <div className="text-center py-8 animate-pulse">
              <p className="text-gray-600">Analyzing your content...</p>
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
                        src={`http://localhost:8000${result.thumbnail_path}`}
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
          <h2 className="text-2xl font-semibold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Shield className="w-10 h-10 text-blue-500" />,
                title: "Upload",
                description: "Drop your image or video file into our secure upload zone. We support various formats for comprehensive analysis."
              },
              {
                icon: <Zap className="w-10 h-10 text-yellow-500" />,
                title: "Analyze",
                description: "Our hybrid system combines deep learning with signal processing to detect manipulation with higher accuracy."
              },
              {
                icon: <BarChart3 className="w-10 h-10 text-green-500" />,
                title: "Results",
                description: "Get detailed insights with feature-level breakdown and frame-by-frame analysis for videos."
              }
            ].map((step, index) => (
              <div
                key={index}
                className="glass-card p-8 rounded-xl hover-lift flex flex-col items-center"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section id="about" className="mt-24 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-center">About VerifiAI</h2>
            
            <div className="glass-card p-8 rounded-xl">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-medium mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    The Deepfake Challenge
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Deepfakes represent a growing challenge in our digital world. These AI-generated 
                    synthetic media can convincingly replace faces, voices, and manipulate content in ways 
                    that are increasingly difficult to detect with the human eye.
                  </p>
                  <p className="text-gray-600">
                    As this technology becomes more accessible, the potential for misuse in spreading 
                    misinformation, creating fake news, or impersonating individuals poses significant 
                    risks to trust in digital media.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Our Hybrid Solution
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our deepfake detection system uses a hybrid approach that combines deep learning with 
                    traditional signal processing techniques to analyze content from multiple perspectives.
                  </p>
                  <p className="text-gray-600">
                    By examining frequency domain inconsistencies, noise patterns, edge artifacts, and 
                    texture analysis alongside deep learning features, our system provides more robust 
                    and accurate detection than single-method approaches.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-medium mb-4 flex items-center">
                  <Info className="w-5 h-5 text-blue-500 mr-2" />
                  Understanding Results
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mt-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <h4 className="font-medium">Likely Authentic (0-50%)</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Content shows few or no signs of manipulation and is likely to be authentic.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <h4 className="font-medium">Potentially Manipulated (50-80%)</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Content shows some signs of manipulation and should be treated with caution.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <h4 className="font-medium">Likely Manipulated (80-100%)</h4>
                    </div>
                    <p className="text-sm text-gray-600">
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