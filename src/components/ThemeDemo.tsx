import { useTheme } from "~/hooks/useTheme";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeDemo = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="w-full max-w-md shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Current Theme: {theme}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={theme === "light" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTheme("light")}
            className="flex items-center gap-2"
          >
            <Sun className="w-4 h-4" />
            Light
          </Button>
          <Button 
            variant={theme === "dark" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTheme("dark")}
            className="flex items-center gap-2"
          >
            <Moon className="w-4 h-4" />
            Dark
          </Button>
          <Button 
            variant={theme === "system" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTheme("system")}
            className="flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            System
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="h-8 w-full bg-primary rounded-md"></div>
          <div className="h-8 w-full bg-accent rounded-md"></div>
          <div className="h-8 w-full bg-secondary rounded-md"></div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          This demonstrates the new azure blue theme system that adapts to both light and dark modes.
        </p>
      </CardContent>
    </Card>
  );
};

export default ThemeDemo;