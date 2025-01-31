import { Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full py-6 px-8 flex justify-between items-center glass-card">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-gray-700" />
        <span className="text-xl font-semibold text-gradient">VerifiAI</span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 hover-lift">
          How it Works
        </a>
        <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 hover-lift">
          About
        </a>
        <a href="http://www.prasenjeetsingh.me" className="text-sm text-gray-600 hover:text-gray-900 hover-lift">
        Creator
        </a>
      </nav>
    </header>
  );
};