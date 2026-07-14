"use client";

import { Maximize, UserCircle2 } from "lucide-react";
import IconBtn from "@/app/components/IconBtn";
import Login from "./Login";

type SessionUser = {
  name?: string | null;
  image?: string | null;
} | null;

export default function NavBarClient({ user }: { user: SessionUser }) {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <nav
      className="
        flex items-center justify-between
        px-4 py-2
        rounded-2xl
        bg-slate-200/70 backdrop-blur-sm
        border border-slate-300
        w-full max-w-[675px] mx-auto mt-4 
      "
    >
      <span className="font-pixelify text-2xl text-[#E5F9FE]">
        pomo<span className="text-[#1A85D9]">bear</span>
      </span>

      <div className="flex items-center gap-3">
        <IconBtn color="gray" icon={Maximize} size="sm" onClick={handleFullscreen} />
        <IconBtn color="gray" icon={UserCircle2} size="sm" active onClick={() => {}} />
      </div>
      <Login user={user} />
    </nav>
  );
}