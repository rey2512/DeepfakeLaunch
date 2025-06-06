import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisResult as AnalysisResultComponent } from "@/components/AnalysisResult";
import { Footer } from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Zap, BarChart3, AlertTriangle, CheckCircle, Info, Coffee } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalysisResult } from "@/types";
import API from "@/lib/api";

interface HistoryItem {
  file: {
    name: string;
    type: string;
    size: number;
  };
  result: AnalysisResult;
  timestamp: string;
}

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();
  const [serverStatus, setServerStatus] = useState<'checking' | 'awake' | 'sleeping'>('checking');
  
  // Check API connection on component mount
  useEffect(() => {
    console.log("Checking API connection...");
    const checkConnection = async () => {
      try {
        await API.get('/');
        console.log("API connection successful");
        setServerStatus('awake');
      } catch (error) {
        console.error("API connection failed:", error);
        setServerStatus('sleeping');
      }
    };
    
    checkConnection();
  }, []);
    
  const handleFileSelected = (file: File, analysisResult: AnalysisResult) => {
    setSelectedFile(file);
    setAnalysisResult(analysisResult);
    setAnalyzing(false);
    setServerStatus('awake');
    
    // Add to history
    const historyItem: HistoryItem = {
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
      result: analysisResult,
      timestamp: new Date().toISOString(),
    };
    
    setHistory(prev => [historyItem, ...prev].slice(0, 10)); // Keep only last 10 analyses
  };
  
  const handleResetAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
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
        
        {serverStatus === 'sleeping' && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Coffee className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Server is in sleep mode</h3>
                <p className="text-xs text-amber-600 dark:text-amber-300 mb-2">
                  This application uses a free hosting plan that puts the server to sleep after 15 minutes of inactivity. 
                  When you try to analyze a file, the server will automatically wake up, but this can take up to 60 seconds.
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-300">
                  Please be patient during the first analysis - this is normal behavior for free tier hosting.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-2xl mx-auto space-y-8">
          {!analysisResult ? (
            <UploadZone 
              onFileSelected={handleFileSelected} 
              loading={analyzing}
              setLoading={setAnalyzing}
            />
          ) : (
            <div className="space-y-6">
              <AnalysisResultComponent 
                score={analysisResult.score} 
                loading={false}
                fileType={analysisResult.file_type}
                frameScores={analysisResult.frame_scores || []}
                framesAnalyzed={analysisResult.frames_analyzed || 0}
                featureContributions={analysisResult.feature_contributions}
              />
              <div className="flex justify-center">
                <button 
                  onClick={handleResetAnalysis}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Analyze Another File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature section */}
        <section className="mt-20 max-w-4xl mx-auto" id="how-it-works">
          <h2 className="text-3xl font-bold text-center mb-10 text-gradient dark:text-gray-100">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 dark:text-gray-100">Advanced Detection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI uses a hybrid approach combining neural networks and traditional forensic techniques to spot manipulated media.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 dark:text-gray-100">Real-Time Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant results with detailed breakdown of manipulation markers found in your image or video.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 dark:text-gray-100">Detailed Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View comprehensive insights about the analysis, including frame-by-frame breakdown for videos.
              </p>
            </div>
          </div>
        </section>
        
        {/* About section */}
        <section className="mt-20 max-w-4xl mx-auto" id="about">
          <h2 className="text-3xl font-bold text-center mb-10 text-gradient dark:text-gray-100">
            About VerifiAI
          </h2>
          <div className="glass-card p-8 rounded-xl">
            <div className="prose dark:prose-invert max-w-none">
              <p>
                As deepfake technology becomes more sophisticated, the need for reliable detection methods grows ever more important. 
                VerifiAI combines state-of-the-art deep learning with traditional forensic techniques to provide a hybrid solution
                that excels at identifying synthetic media.
              </p>
              
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
                
                <div className="p-4" style={{ background: 'rgba(214, 137, 16, 0.1)', borderColor: 'rgba(214, 137, 16, 0.3)' }}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#D68910' }}></div>
                    <h4 className="font-medium dark:text-gray-100">Authentic but Noise (50-80%)</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Content is authentic but contains normal background noise and processing artifacts.
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
              
              <div className="mt-8">
                <h3 className="text-xl font-medium mb-4 dark:text-gray-100">Privacy & Data</h3>
                <p>
                  Your privacy is important to us. All uploaded files are processed on our secure servers and are not stored permanently.
                  We retain analysis results for a limited time to improve our detection algorithms, but we never share your data with third parties.
                </p>
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