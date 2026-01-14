import { FiX } from "react-icons/fi";
import { useState } from "react";

const MODELS = ["Birkin 25", "Birkin 30", "Birkin 35", "Birkin 40"];
const HARDWARE = ["Palladium", "Gold", "Rose Gold", "Brushed Gold"];
const LEATHERS = ["Classic Leather", "Precious Skin", "Collector / LE"];

function ConsultAdvisor({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    model: "",
    hardware: "",
    leather: "",
    message: "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-2xl shadow-2xl overflow-hidden">
        {/* 🔹 HEADER (TITLE + X) */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Contact Advisor
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <FiX size={20} />
          </button>
        </div>

        {/* 🔹 FORM */}
        <form
          className="p-5 space-y-4"
          action="https://formspree.io/f/xyzlyaoz"
          method="POST"
        >
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Your name"
            name="name"
            required
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Email address"
            type="email"
            name="email"
            required
          />

          <select
            className="w-full border rounded-lg px-3 py-2 text-gray-600"
            name="model"
            required
          >
            <option value="">Select Model</option>
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="w-full border rounded-lg px-3 py-2 text-gray-600"
            name="hardware"
            required
          >
            <option value="">Select Hardware</option>
            {HARDWARE.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <select
            className="w-full border rounded-lg px-3 py-2 text-gray-600"
            name="leather"
            required
          >
            <option value="">Select Category</option>
            {LEATHERS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <textarea
            className="w-full border rounded-lg px-3 py-2 resize-none"
            rows={3}
            placeholder="Message (optional)"
            name="message"
          />

          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg py-3 font-semibold"
          >
            Send Request
          </button>
        </form>88
      </div>
    </div>
  );
}

export default ConsultAdvisor;
