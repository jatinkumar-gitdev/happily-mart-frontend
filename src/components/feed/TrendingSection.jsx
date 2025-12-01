import { useEffect, useMemo, useState } from "react";
import { FiTrendingUp, FiChevronDown, FiChevronUp } from "react-icons/fi";

const DEFAULT_REQUIREMENTS = [
  {
    title: "Sustainable Packaging Materials",
    sector: "FMCG",
    requests: 42,
  },
  {
    title: "Organic Cotton Suppliers",
    sector: "Textile",
    requests: 37,
  },
  {
    title: "EV Battery Components",
    sector: "Automotive",
    requests: 33,
  },
  {
    title: "Cold Storage Logistics",
    sector: "Food Tech",
    requests: 29,
  },
];

const TRENDING_TICKER = [
  "High demand for Lithium Iron Phosphate cells in APAC.",
  "D2C brands searching for Tier-2 warehousing partners.",
  "Bulk inquiry for recycled aluminum sheets (2MM).",
  "SaaS founders scouting fractional CFOs for Series A.",
  "North America buyers looking for co-manufacturing units.",
];

const TrendingSection = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TRENDING_TICKER.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const visibleTicker = useMemo(() => {
    const nextIndex = (tickerIndex + 1) % TRENDING_TICKER.length;
    return [TRENDING_TICKER[tickerIndex], TRENDING_TICKER[nextIndex]];
  }, [tickerIndex]);

  return (
    <div className="space-y-6">
      {/* Top Requirements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-sky-500" />
          Top Requirements
        </h2>
        <div className="space-y-4">
          {DEFAULT_REQUIREMENTS.map((item, index) => (
            <div
              key={item.title}
              className="flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {index + 1}. {item.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.sector}
                </p>
              </div>
              <span className="text-xs font-semibold bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300 px-2 py-1 rounded-full">
                {item.requests} requests
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Promotion */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg shadow-sm p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">
            Become A Seller Today & Start Earning
          </h2>
          <button className="mt-4 px-6 py-2 bg-white text-sky-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Apply Now
          </button>
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20">
          <div className="w-full h-full bg-white rounded-full"></div>
        </div>
      </div>

      {/* Today Trending Ticker */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Today Trending
          </h2>
          {isExpanded ? (
            <FiChevronUp className="text-gray-600 dark:text-gray-400" />
          ) : (
            <FiChevronDown className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="space-y-2">
            {visibleTicker.map((text, idx) => (
              <div
                key={`${tickerIndex}-${idx}`}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 transition-all"
              >
                {text}
              </div>
            ))}
            <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 text-right">
              Updating live every few seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingSection;
