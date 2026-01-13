"use client";

import { Search, User, Settings, LogOut } from "lucide-react";
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
import { useSession } from "./AuthProvider";
import { authClient } from "~/server/better-auth/client";
import Logo from "~/components/Logo";

const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    void authClient.signOut()
  };

  const {
      data: session, //refetch the session
    } = useSession();

  const handleLogoClick = () => {
    // Navigate to appropriate dashboard based on user role
    if (session?.user.role === "GUIDE") {
      router.push("/student/dashboard");
    } else if (session?.user.role === "ORGANIZATION") {
      router.push("/business/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-soft">{" "}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Column - Logo */}
        <div className="flex items-center shrink-0">
          <button
            onClick={handleLogoClick}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" showText className="hidden sm:flex" />
            <Logo size="sm" showText={false} className="flex sm:hidden" />
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
        <div className="flex items-center shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {session?.user.name}
                </p>
                <p className="text-xs text-muted-foreground">{session?.user.email}</p>
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
