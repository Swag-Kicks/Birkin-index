import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";

/* ================= CONFIG ================= */
const GEMINI_API_KEY = "AIzaSyDlF5Zq97EayzqxUoMGd_DnNxlCdVMBFwU"; // 🔑 Replace with your key

const REGIMES = { Expansion: 1.15, Standard: 1, Contraction: 0.85 };
const HARDWARE_CONFIG = ["Palladium", "Gold", "Rose Gold", "Brushed Gold"];
const SPECIALS = ["Precious Skin", "Collector/LE"];
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
  }));
}

/* ================= GEMINI FETCH ================= */
async function fetchGeminiData() {
  const prompt = `
You are a luxury resale pricing engine.

Generate realistic historical secondary market prices (USD) for Hermès Birkin bags.

MODELS:
- Birkin 25
- Birkin 30
- Birkin 35
- Birkin 40

HARDWARE:
- Palladium
- Gold
- Rose Gold
- Brushed Gold

SPECIALS:
- Precious Skin
- Collector/LE

TIME RANGE:
Last 8 years (oldest → newest)

OUTPUT:
Return ONLY valid JSON in this exact structure:

{
  "Birkin 25": {
    "Palladium": {
      "Precious Skin": [
        { "year": 2017, "price": 18000 },
        ...
      ],
      "Collector/LE": [...]
    },
    "Gold": { ... }
  },
  "Birkin 30": { ... },
  "Birkin 35": { ... },
  "Birkin 40": { ... }
}

Rules:
- No markdown
- No explanations
- Numbers only
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }
  );

  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(raw);
}

/* ================= APP ================= */
export default function App() {
  const [regime, setRegime] = useState("Standard");
  const [selectedModel, setModel] = useState(MODELS[0]);
  const [selectedHardware, setHardware] = useState(HARDWARE_CONFIG[0]);
  const [selectedSpecial, setSpecial] = useState(SPECIALS[0]);
  const [category, setCategory] = useState("Retail");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [allModelData, setAllModelData] = useState(
    JSON.parse(localStorage.getItem("birkinData") || "{}")
  );
  const [chartData, setChartData] = useState([]);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */
  const handleFetchGemini = async () => {
    setLoading(true);
    try {
      const data = await fetchGeminiData();
      setAllModelData(data);
      localStorage.setItem("birkinData", JSON.stringify(data));
      setChartData(
        data?.[selectedModel]?.[selectedHardware]?.[selectedSpecial] || []
      );
    } catch (err) {
      console.error("Gemini fetch failed:", err);
    }
    setLoading(false);
  };

  /* ================= MODEL CHANGE ================= */
  const handleModelChange = (model) => {
    setModel(model);
    setChartData(allModelData[model] || []);
  };
  const baseData =
    allModelData?.[selectedModel]?.[selectedHardware]?.[selectedSpecial] || [];

  const data = computeData(regime, selectedHardware, category, baseData);

  const latestPrice = data[data.length - 1]?.price || 0;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col">
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

          <button
            onClick={handleFetchGemini}
            className="px-3 py-1 rounded-lg text-sm bg-orange-500 text-white"
          >
            {loading ? "Loading..." : "Fetch Data"}
          </button>
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
            <p className="text-xs uppercase mb-2 text-gray-500">
              Classic Leather
            </p>
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
            <button className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg text-sm font-semibold">
              Liquidation Ticket
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
                <XAxis dataKey="year" />
                <YAxis
                  orientation="left"
                  tickFormatter={(v) => `$${(v / 1000).toLocaleString()}k`}
                  width={70}
                />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
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
              configuration. Analysis utilizes secondary market aggregation and
              auction floor data.
            </p>
            <button className="flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm space-x-2">
              <FiSearch />
              <span>Consult Advisor</span>
            </button>
          </div>
        </main>
      </div>
    </div>
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
