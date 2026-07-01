"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mic, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/auth";

interface NavbarProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const getInitials = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-[#1A1A1A] z-50 px-6 flex items-center justify-between select-none">
      
      {/* Left side: Logo */}
      <Link href="/dashboard" className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 bg-[#00FF87] rounded-full flex items-center justify-center shrink-0">
          <Mic className="h-4.5 w-4.5 text-black" />
        </div>
        <span className="text-white font-bold tracking-tight text-sm">
          InterviewAI
        </span>
      </Link>

      {/* Right side: Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="relative w-9 h-9 rounded-full overflow-hidden border border-[#1A1A1A] bg-zinc-900 flex items-center justify-center cursor-pointer outline-none hover:border-[#00FF87] transition-colors">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User Avatar"}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-[#00FF87] text-sm font-bold">
                  {getInitials()}
                </span>
              )}
            </button>
          }
        />
        <DropdownMenuContent
          className="w-52 bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-300 rounded-md p-1 shadow-2xl"
          align="end"
        >
          <div className="px-2.5 py-2 flex flex-col space-y-0.5">
            <span className="text-white text-xs font-semibold block truncate">
              {user.name || "Candidate"}
            </span>
            <span className="text-zinc-500 text-[10px] block truncate">
              {user.email}
            </span>
          </div>
          
          <DropdownMenuSeparator className="border-t border-zinc-900 my-1" />

          <DropdownMenuItem
            render={<Link href="/profile" />}
            className="flex items-center gap-2 px-2.5 py-2 hover:bg-zinc-900 cursor-pointer text-xs"
          >
            <User className="size-4 text-zinc-400" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled
            className="flex items-center gap-2 px-2.5 py-2 text-zinc-600 cursor-not-allowed text-xs"
          >
            <Settings className="size-4" />
            <span>Settings <span className="text-[9px] ml-1 font-semibold text-zinc-700">(soon)</span></span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="border-t border-zinc-900 my-1" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 px-2.5 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 cursor-pointer text-xs"
          >
            <LogOut className="size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </header>
  );
}
