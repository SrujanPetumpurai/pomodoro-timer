"use client";

import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  color:keyof typeof colorMap;
  size?: "sm" | "md";
}
const colorMap = {
  orange: "bg-[#D67941] border-orange-700 hover:bg-orange-400 text-white",
  gray: "bg-zinc-700 border-zinc-900 hover:bg-zinc-600 text-zinc-100",
  green: "bg-green-500",
} as const;

export default function IconBtn({
  icon: Icon,
  onClick,
  active = false,
  color='orange',
  size = "md",
}: IconButtonProps) {
  const dims = size === "md" ? "w-14 h-14" : "w-11 h-11";
  const iconSize = size === "md" ? 22 : 18;

  return (
    <button
      onClick={onClick}
      className={`
        ${dims}
        flex items-center justify-center
        rounded-xl
        border-b-4
        active:border-b-0 active:translate-y-1
        transition-all duration-100
        ${colorMap[color]}
      `}
    >
      <Icon size={iconSize} strokeWidth={2.5} />
    </button>
  );
}