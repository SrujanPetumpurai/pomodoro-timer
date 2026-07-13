"use client";

import { useState } from "react";

const MODES = [
  { key: "pomodoro", label: "pomodoro" },
  { key: "short_break", label: "short break" },
  { key: "long_break", label: "long break" },
] as const;

export type ModeKey = (typeof MODES)[number]["key"];

interface ModeTabsProps {
  value?: ModeKey;
  onChange?: (mode: ModeKey) => void;
}

export default function ModeTabs({ value, onChange }: ModeTabsProps) {
  const [internal, setInternal] = useState<ModeKey>("pomodoro");
  const active = value ?? internal;

  const select = (key: ModeKey) => {
    setInternal(key);
    onChange?.(key);
  };

  return (
    <div className="flex gap-3 font-pixelify font-bold">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          onClick={() => select(mode.key)}
          className={`
            px-5 py-3 rounded-xl text-md
            border-b-4
            active:border-b-0 active:translate-y-1
            transition-all duration-100
            ${
              active === mode.key
                ? "bg-[#D67941] border-[#9D5021] text-[#7E3F19]"
                : "bg-[#CACACA] border-[#999999] text-[#4F4F4E] hover:bg-zinc-300"
            }
          `}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}