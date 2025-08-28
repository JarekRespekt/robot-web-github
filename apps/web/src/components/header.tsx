import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🤖</span>
              </div>
              <span className="font-bold text-xl text-primary">ROBOT</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <Link 
                href="/" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Головна
              </Link>
              <Link 
                href="/tasks" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Завдання
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks">
                Переглянути завдання
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}