import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";
  
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-8 h-8 rounded-full transition-all duration-500"
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full">
        <Sun className="absolute inset-0 m-auto h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:rotate-90 dark:scale-0 text-yellow-500" />
        <Moon className="absolute inset-0 m-auto h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-blue-400" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 