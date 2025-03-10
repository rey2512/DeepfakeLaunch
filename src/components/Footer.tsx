import { Github, Mail, Shield, FileCode, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleVerifiAIClick = () => {
    window.location.href = window.location.origin;
  };

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> 
              <span 
                className="cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleVerifiAIClick}
              >
                VerifiAI
              </span>
            </h3>
            <p className="text-gray-300 mb-4">
              Our advanced AI system helps you identify manipulated media content with high accuracy.
              Protect yourself from digital deception.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/rey2512" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="mailto:info@verifiai.tech" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileCode className="w-5 h-5 mr-2" /> 
              Resources
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">API Reference</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Research Papers</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Model Information</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> 
              Disclaimer
            </h3>
            <p className="text-gray-300 text-sm">
              This tool provides an estimation of the likelihood that media has been manipulated.
              Results should be interpreted with caution and not considered definitive proof.
              For critical verification, consult with digital forensics experts.
            </p>
          </div>
        </div>
        
        <div className={cn(
          "pt-8 mt-8 border-t border-gray-700 text-sm",
          "flex flex-col md:flex-row justify-between items-center"
        )}>
          <div className="text-left text-gray-400">
            <p>Contact us: <a href="mailto:info@verifiai.tech" className="text-green-400 hover:text-green-300">info@verifiai.tech</a></p>
          </div>
          
          <p className="text-gray-400 my-4 md:my-0">© {currentYear} VerifiAI. All rights reserved.</p>
          
          <div className="text-right text-gray-400">
            <p>Made in KIIT University</p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 