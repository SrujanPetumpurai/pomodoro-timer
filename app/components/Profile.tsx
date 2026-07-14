import { useState } from "react";
import Login from "./Login";

const OPTIONS = [
  { id: "login", label: "login", icon: UserIcon, component: Login },
];

export default function ProfileComponent({ onClose = () => {} }) {
  const [activeId, setActiveId] = useState(OPTIONS[0].id);

  const active = OPTIONS.find((o) => o.id === activeId);
  const ActiveComponent = active?.component;

  return (
    <div className="min-h-[500px] bg-cover flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-10 font-['Silkscreen',_monospace]">
        <h1 className="text-2xl text-gray-800 mb-8 capitalize">{active?.label}</h1>

        <div className="flex gap-8">
          {/* sidebar — profile owns this */}
          <div className="w-56 shrink-0">
            <div className="bg-gray-100 rounded-xl p-2 flex flex-col gap-1">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = opt.id === activeId;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setActiveId(opt.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-white shadow-sm text-orange-500"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* right side — whichever option component is active renders here */}
          <div className="flex-1">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-6 py-2.5 text-sm"
        >
          close
        </button>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}