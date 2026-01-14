import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ConsultAdvisor from "./components/ConsultAdvisor";
import BirkinLoader from "./components/BirkinLoader";

import { FiSearch, FiMenu, FiX } from "react-icons/fi";

/* ================= CONFIG ================= */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const REGIMES = { Expansion: 1.15, Standard: 1, Contraction: 0.85 };
const HARDWARE_CONFIG = ["Palladium", "Gold", "Rose Gold", "Brushed Gold"];
const SPECIALS = ["Classic Leather", "Precious Skin", "Collector/LE"];
const MODELS = ["Birkin 25", "Birkin 30", "Birkin 35", "Birkin 40"];
const CATEGORIES = { Retail: 1, Secondary: 1.1 };

/* ================= LOGIC ================= */
function computeData(regime, hardware, category, baseData) {
  const hardwareFactor =
    hardware === "Palladium" || hardware === "Gold" ? 1 : 1.25;
  const multiplier = REGIMES[regime] * hardwareFactor * CATEGORIES[category];

  return baseData.map((d) => ({
    ...d,
    price: Math.round(d.price * multiplier),
    label: d.month ? `${d.month} ${d.year}` : `${d.year}`,
  }));
}

/* ================= PYTHON FETCH ================= */
async function fetchGeminiData() {
  try {
    const res = await fetch(
      "https://crosslisting-backend-aacranbzdyd3ffbd.centralindia-01.azurewebsites.net/api/autofill/birkin-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // send empty JSON if no payload required
      }
    );

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to fetch data");
    }

    return json.data;
  } catch (err) {
    console.error("Flask fetch failed:", err);
    return {};
  }
}

/* ================= APP ================= */
export default function App() {
  const [regime, setRegime] = useState("Standard");
  const [selectedModel, setModel] = useState(MODELS[0]);
  const [selectedHardware, setHardware] = useState(HARDWARE_CONFIG[0]);
  const [selectedSpecial, setSpecial] = useState(SPECIALS[0]);
  const [category, setCategory] = useState("Retail");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openConsult, setOpenConsult] = useState(false);
  const [allModelData, setAllModelData] = useState(
    JSON.parse(localStorage.getItem("birkinData") || "{}")
  );
  const [chartData, setChartData] = useState([]);

  const [loading, setLoading] = useState(false);
  const handleFetchGemini = async () => {
    setLoading(true);

    try {
      // Get stored data
      const stored = JSON.parse(localStorage.getItem("birkinData") || "{}");
      const lastUpdated = stored.lastUpdated; // e.g., "2026-01-14"
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

      if (lastUpdated === today && stored.data) {
        // Use cached data if already fetched today
        console.log("✅ Using cached data from localStorage");

        // Mimic a small fetch delay (e.g., 500ms) so loader shows
        await new Promise((resolve) => setTimeout(resolve, 500));

        setAllModelData(stored.data);
        setChartData(
          stored.data?.[selectedModel]?.[selectedHardware]?.[selectedSpecial] ||
            []
        );
      } else {
        // Fetch new data
        console.log("🚀 Fetching new data from API");
        const data = await fetchGeminiData();

        // Save in localStorage with lastUpdated date
        localStorage.setItem(
          "birkinData",
          JSON.stringify({ data, lastUpdated: today })
        );

        setAllModelData(data);
        setChartData(
          data?.[selectedModel]?.[selectedHardware]?.[selectedSpecial] || []
        );
      }
    } catch (err) {
      console.error("❌ Gemini fetch failed:", err);
    }

    setLoading(false);
  };
  useEffect(() => {
    handleFetchGemini();
  }, []);
  /* ================= MODEL CHANGE ================= */
  const handleModelChange = (model) => {
    setModel(model);
    setChartData(allModelData[model] || []);
  };
  function cleanData(rawData) {
    const seen = new Set();
    return (
      rawData
        .map((d) => {
          if (d.month) {
            // Correct month label
            const monthName = d.month.split(" ")[0]; // "Jan"
            const label = `${monthName} ${d.year}`;
            return { ...d, label };
          } else {
            return { ...d, label: `${d.year}` };
          }
        })
        // Remove duplicates by label
        .filter((d) => {
          if (seen.has(d.label)) return false;
          seen.add(d.label);
          return true;
        })
    );
  }

  const baseData =
    allModelData?.[selectedModel]?.[selectedHardware]?.[selectedSpecial] || [];

  const cleanedData = cleanData(baseData);
  const data = computeData(regime, selectedHardware, category, cleanedData);

  const latestPrice = data[data.length - 1]?.price || 0;

  return (
    <>
      <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col">
        {/* Show loader as overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <BirkinLoader />
          </div>
        )}
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-xl md:text-2xl italic font-serif">
              The Birkin Index
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {Object.keys(REGIMES).map((r) => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                className={`px-3 py-1 rounded-lg text-sm border ${
                  regime === r ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {r}
              </button>
            ))}

            {/* <button
              onClick={handleFetchGemini}
              className="px-3 py-1 rounded-lg text-sm bg-orange-500 text-white"
            >
              {loading ? "Loading..." : "Fetch Data"}
            </button> */}
          </div>

          <p className="text-xs text-gray-500 uppercase hidden md:block">
            UNIT_VALUATION: PER_PIECE
          </p>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`fixed inset-0 z-30 md:static md:flex-shrink-0 bg-[#F9F7F2] md:px-6 space-y-6 transition-transform transform ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 md:w-72`}
          >
            <div className="flex justify-between items-center md:hidden mb-4">
              <h2 className="font-semibold">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 md:hidden">
              {Object.keys(REGIMES).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegime(r)}
                  className={`px-3 py-1 rounded-lg text-sm border ${
                    regime === r ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={handleFetchGemini}
              className="w-full px-4 py-2 mb-4 rounded-lg bg-orange-500 text-white md:hidden"
            >
              {loading ? "Loading..." : "Fetch Data"}
            </button>

            {/* Model Selector */}
            <Selector
              title="Model Selection"
              options={MODELS}
              active={selectedModel}
              onChange={handleModelChange}
            />

            {/* Hardware */}
            <div>
              <p className="text-xs uppercase mb-2 text-gray-500">
                Hardware & Materials
              </p>
              <div className="grid grid-cols-2 gap-2">
                {HARDWARE_CONFIG.map((hw) => (
                  <button
                    key={hw}
                    onClick={() => setHardware(hw)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      selectedHardware === hw
                        ? "bg-black text-white"
                        : "bg-white border"
                    }`}
                  >
                    {hw}
                  </button>
                ))}
              </div>
            </div>

            {/* Specials */}
            <div>
              {/* <p className="text-xs uppercase mb-2 text-gray-500">
              Classic Leather
            </p> */}
              {SPECIALS.map((item) => (
                <button
                  key={item}
                  onClick={() => setSpecial(item)}
                  className={`block w-full mb-2 px-4 py-2 rounded-lg text-sm ${
                    selectedSpecial === item
                      ? "bg-black text-white"
                      : "bg-white border"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div>
              <button
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg text-sm font-semibold"
                onClick={() => setOpenConsult(true)}
              >
                Liquidate Your Birkin
              </button>
            </div>
          </aside>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main */}
          <main className="flex-1 flex flex-col overflow-auto p-4 md:p-6">
            {/* Stats */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <Stat
                label="Spot Valuation"
                value={`$${latestPrice.toLocaleString()}`}
              />
              <Stat
                label="Net Exit Floor"
                value={`$${Math.round(latestPrice * 0.92).toLocaleString()}`}
              />
              <Stat
                label="Annualized Yield"
                value={
                  data.length > 1
                    ? `${Math.round(
                        ((latestPrice / data[0].price - 1) * 100) / data.length
                      )}%`
                    : "0%"
                }
              />
            </div>

            {/* Chart */}
            <div className="w-full mb-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E85D22" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#E85D22" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />

                  <YAxis
                    orientation="left"
                    tickFormatter={(v) => `$${(v / 1000).toLocaleString()}k`}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#E85D22"
                    strokeWidth={3}
                    fill="url(#g)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Unit Intelligence */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Unit Intelligence</h2>
              <p className="text-sm text-gray-600 mb-3">
                Request per-piece advisory for this specific hardware/size
                configuration. Analysis utilizes secondary market aggregation
                and auction floor data.
              </p>
              <button
                className="flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm space-x-2"
                onClick={() => setOpenConsult(true)}
              >
                <FiSearch />
                <span>Consult Advisor</span>
              </button>

              {/* ✅ MODAL SHOULD BE HERE */}
              <ConsultAdvisor
                open={openConsult}
                onClose={() => setOpenConsult(false)}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

/* ================= HELPERS ================= */
function Selector({ title, options, active, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs uppercase mb-2 text-gray-500">{title}</p>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`block w-full mb-2 px-4 py-2 rounded-lg text-sm ${
            active === o ? "bg-black text-white" : "bg-white border"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex-1 flex flex-col items-start border-b md:border-b-0 md:border-r p-3 md:p-4 rounded-lg bg-white">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <h2 className="text-2xl md:text-3xl italic font-serif">{value}</h2>
    </div>
  );
}
