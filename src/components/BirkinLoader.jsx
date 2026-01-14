export default function BirkinLoader({
  text = "Loading market intelligence…",
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFCFB]">
      {/* Brand */}
      <h1 className="text-3xl italic font-serif mb-6 text-[#1A1A1A]">
        The Birkin Index
      </h1>

      {/* Circulating single bar loader */}
      <div className="w-64 h-2 bg-gray-200 rounded overflow-hidden relative mb-4">
        <div
          className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300 rounded-full"
          style={{
            animation: "birkinMove 1.4s linear infinite",
          }}
        />
      </div>

      {/* Status text */}
      <p className="text-sm text-gray-600 tracking-wide animate-pulse">
        {text}
      </p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes birkinMove {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
