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

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ type: "", message: "" });

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse({ type: "", message: "" });

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));

      const res = await fetch("https://formspree.io/f/xyzlyaoz", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const data = await res.json();

      if (data.ok) {
        setResponse({
          type: "success",
          message:
            "Your request has been sent successfully. Our advisor will contact you shortly.",
        });
        setForm({
          name: "",
          email: "",
          model: "",
          hardware: "",
          leather: "",
          message: "",
        });

        // Auto close modal after 3 seconds
        setTimeout(() => {
          setResponse({ type: "", message: "" });
          onClose();
        }, 3000);
      } else {
        setResponse({
          type: "error",
          message: "There was an issue sending your request. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      setResponse({
        type: "error",
        message: "Network error occurred. Please try again later.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-2xl shadow-2xl overflow-hidden relative">
        {/* 🔹 RESPONSE POPUP */}
        {response.message && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 w-[90%] p-3 rounded-lg text-sm font-medium ${
              response.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            } shadow-md`}
          >
            {response.message}
          </div>
        )}

        {/* 🔹 HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Contact Advisor
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <FiX size={20} />
          </button>
        </div>

        {/* 🔹 FORM */}
        <form className="p-5 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Your name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <select
            className="w-full border rounded-lg px-3 py-2 text-gray-600"
            name="model"
            value={form.model}
            onChange={handleChange}
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
            value={form.hardware}
            onChange={handleChange}
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
            value={form.leather}
            onChange={handleChange}
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
            value={form.message}
            onChange={handleChange}
          />

          {/* Submit */}
          <button
            type="submit"
            className={`w-full rounded-lg py-3 font-semibold text-white ${
              loading ? "bg-gray-500" : "bg-black"
            }`}
            disabled={loading}
          >
            {loading ? "Sending…" : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConsultAdvisor;
