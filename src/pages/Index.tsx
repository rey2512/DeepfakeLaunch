import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisResult } from "@/components/AnalysisResult";
import { pipeline } from "@huggingface/transformers";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelected = async (file: File) => {
    setAnalyzing(true);
    try {
      // For demo purposes, we'll simulate the analysis
      // In a real app, you'd use the actual model here
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fakeScore = Math.floor(Math.random() * 100);
      setResult(fakeScore);
      
      toast({
        title: "Analysis Complete",
        description: "We've successfully analyzed your content.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze the content. Please try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16 animate-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Detect Digital Manipulation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your content and let our advanced AI analyze it for signs of manipulation.
            Get instant results with detailed insights.
          </p>
        </section>

        <div className="max-w-2xl mx-auto space-y-8">
          <UploadZone onFileSelected={handleFileSelected} />
          
          {analyzing && (
            <div className="text-center py-8 animate-pulse">
              <p className="text-gray-600">Analyzing your content...</p>
            </div>
          )}
          
          {result !== null && !analyzing && (
            <AnalysisResult score={result} />
          )}
        </div>

        <section className="mt-24 text-center">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
            {[
              {
                title: "Upload",
                description: "Drop your image or video file into our secure upload zone."
              },
              {
                title: "Analyze",
                description: "Our AI model processes the content using advanced detection algorithms."
              },
              {
                title: "Results",
                description: "Get detailed insights about potential manipulations and authenticity scores."
              }
            ].map((step, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-xl hover-lift"
              >
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;