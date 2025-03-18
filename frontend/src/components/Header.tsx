import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogoClick = () => {
    window.location.href = window.location.origin;
  };

  return (
    <header className="w-full py-4 px-4 md:px-8 bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleLogoClick}
        >
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold text-gradient dark:text-gray-100">VerifiAI</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </a>
          <a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            How it Works
          </a>
          <a href="#about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            About
          </a>
          <a 
            href="http://www.prasenjeetsingh.me" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Creator
          </a>
          <div className="border-l border-gray-200 dark:border-gray-700 h-5 mx-1"></div>
          <ThemeToggle />
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <div className="border p-1 rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <ThemeToggle />
          </div>
          <button 
            className="text-gray-600 dark:text-gray-300 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden absolute left-0 right-0 bg-white dark:bg-gray-900 shadow-md transition-all duration-300 ease-in-out overflow-hidden",
        mobileMenuOpen ? "max-h-64 py-4" : "max-h-0"
      )}>
        <nav className="flex flex-col space-y-4 px-4">
          <a 
            href="#" 
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={toggleMobileMenu}
          >
            Home
          </a>
          <a 
            href="#how-it-works" 
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={toggleMobileMenu}
          >
            How it Works
          </a>
          <a 
            href="#about" 
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={toggleMobileMenu}
          >
            About
          </a>
          <a 
            href="http://www.prasenjeetsingh.me" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={toggleMobileMenu}
          >
            Creator
          </a>
        </nav>
      </div>
    </header>
  );
};