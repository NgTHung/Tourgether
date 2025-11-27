"use client";

import { Search, User, Settings, LogOut, Compass } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import SettingsModal from "~/components/SettingsModal";

interface HeaderProps {
  userRole?: string;
}

const Header = ({ userRole }: HeaderProps) => {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/signin");
  };

  const handleLogoClick = () => {
    // Navigate to appropriate dashboard based on user role
    if (userRole === "GUIDE") {
      router.push("/student/dashboard");
    } else if (userRole === "ORGANIZATION") {
      router.push("/business/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft">{" "}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Column - Logo */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <div className="p-1.5 bg-gradient-primary rounded-lg">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">Tourgether</span>
          </button>
        </div>

        {/* Center Column - Search Bar */}
        <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tours, jobs, or people..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right Column - User Profile */}
        <div className="flex items-center flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {userRole === "GUIDE" && "Student Account"}
                  {userRole === "ORGANIZATION" && "Business Account"}
                </p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/account")}>
                <User className="w-4 h-4 mr-2" />
                View My Account
              </DropdownMenuItem>
              <SettingsModal>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </SettingsModal>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
