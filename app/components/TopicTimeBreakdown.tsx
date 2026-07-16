"use client";

import { useEffect, useState } from "react";

type TopicStat = {
  topicId: string | null;
  name: string;
  color: string;
  totalMinutes: number;
  sessionCount: number;
};

type ApiResponse = {
  range: string;
  totalMinutes: number;
  topics: TopicStat[];
};

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const RANGES = [
  { key: "week", label: "7 days" },
  { key: "month", label: "30 days" },
  { key: "all", label: "all time" },
] as const;

export default function TopicTimeBreakdown() {
  const [range, setRange] =
    useState<(typeof RANGES)[number]["key"]>("week");

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setUnauthorized(false);
      setError("");

      try {
        const res = await fetch(`/api/stats/topic-name?range=${range}`);

        if (res.status === 401) {
          setUnauthorized(true);
          setData(null);
          return;
        }

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const json: ApiResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Failed to load topic statistics.");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [range]);

  const maxMinutes = data?.topics[0]?.totalMinutes ?? 1;

  return (
    <div className="w-full max-w-md rounded-3xl bg-white/70 backdrop-blur-md shadow-lg p-6">
      <h3 className="font-pixel text-lg text-slate-800 mb-4">
        time by topic
      </h3>

      <div className="flex gap-2 mb-5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`flex-1 rounded-full py-2 text-sm font-pixel transition-colors ${
              range === r.key
                ? "bg-[#D97757] text-white"
                : "bg-slate-200/70 text-slate-600 hover:bg-slate-300/70"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-sm font-pixel text-slate-500">
          loading...
        </p>
      )}

      {!loading && unauthorized && (
        <p className="text-sm font-pixel text-slate-500">
          Login to view topic statistics.
        </p>
      )}

      {!loading && error && (
        <p className="text-sm font-pixel text-red-500">
          {error}
        </p>
      )}

      {!loading &&
        !unauthorized &&
        !error &&
        data &&
        data.topics.length === 0 && (
          <p className="text-sm font-pixel text-slate-500">
            No focus sessions yet.
          </p>
        )}

      {!loading &&
        !unauthorized &&
        !error &&
        data &&
        data.topics.length > 0 && (
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#D97757]" />
              <span className="text-sm font-pixel text-slate-700">
                Total: {formatMinutes(data.totalMinutes)}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {data.topics.map((t) => (
                <div key={t.topicId ?? "uncategorized"}>
                  <div className="mb-1.5 flex justify-between text-sm font-pixel text-slate-700">
                    <span>{t.name}</span>
                    <span>{formatMinutes(t.totalMinutes)}</span>
                  </div>

                  <div className="h-4 w-full rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all duration-500"
                      style={{
                        width: `${(t.totalMinutes / maxMinutes) * 100}%`,
                        backgroundColor: t.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
    </div>
  );
}