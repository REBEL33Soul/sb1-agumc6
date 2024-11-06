import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-gray-400" />
          </button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonPopover: "bg-gray-900 border border-gray-800",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}