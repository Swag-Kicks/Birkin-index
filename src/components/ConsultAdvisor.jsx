import { FiX } from "react-icons/fi";
import { useState } from "react";
import "./ConsultAdvisor.css";

const MODELS = ["Birkin 25", "Birkin 30", "Birkin 35", "Birkin 40"];
const HARDWARE = ["Palladium", "Gold", "Rose Gold", "Brushed Gold"];
const LEATHERS = ["Classic Leather", "Precious Skin", "Collector / LE"];

/* =========================
   CLOUDINARY CONFIG
========================= */
const CLOUDINARY_CLOUD_NAME = "dgchvnotv";
const CLOUDINARY_UPLOAD_PRESET = "birkin_unsigned"; // ✅ NEW PRESET

const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: data,
    }
  );

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const result = await res.json();
  return result.secure_url;
};

function ConsultAdvisor({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    model: "",
    hardware: "",
    leather: "",
    size: "",
    message: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ type: "", message: "" });

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse({ type: "", message: "" });

    try {
      let imageUrl = "";

      // 1️⃣ Upload image to Cloudinary
      if (form.image) {
        imageUrl = await uploadToCloudinary(form.image);
      }

      // 2️⃣ Send TEXT data to Formspree
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("model", form.model);
      formData.append("hardware", form.hardware);
      formData.append("leather", form.leather);
      formData.append("size", form.size);
      formData.append("message", form.message);
      formData.append("image_url", imageUrl);

      const res = await fetch("https://formspree.io/f/xgoovwgg", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const data = await res.json();
      if (!data.ok) throw new Error("Formspree failed");

      setResponse({
        type: "success",
        message:
          "✅ Your request has been sent successfully. Our advisor will contact you shortly.",
      });

      setForm({
        name: "",
        email: "",
        model: "",
        hardware: "",
        leather: "",
        size: "",
        message: "",
        image: null,
      });

      setTimeout(() => {
        setResponse({ type: "", message: "" });
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setResponse({
        type: "error",
        message: "❌ Something went wrong. Please try again.",
      });
    }

    setLoading(false);
  };

  const formatSize = (size) => `${(size / 1024).toFixed(2)} KB`;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        {/* 🔔 RESPONSE POPUP */}
        {response.message && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 w-[90%] p-3 rounded-lg text-sm font-medium ${
              response.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {response.message}
          </div>
        )}
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Contact Advisor</h2>
          <button onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form className="p-5 space-y-4" onSubmit={handleSubmit}>
          {/* NAME + EMAIL ROW */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 w-full border rounded-lg px-3 py-2"
              placeholder="Your name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              className="flex-1 w-full border rounded-lg px-3 py-2"
              placeholder="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* MODEL + HARDWARE + LEATHER ROW */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex-1 w-full border rounded-lg px-3 py-2 text-gray-600 appearance-none"
              name="model"
              value={form.model}
              onChange={handleChange}
              required
            >
              <option value="">Model</option>
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="flex-1 w-full border rounded-lg px-3 py-2 text-gray-600 appearance-none"
              name="hardware"
              value={form.hardware}
              onChange={handleChange}
              required
            >
              <option value="">Hardware</option>
              {HARDWARE.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <select
              className="flex-1 w-full border rounded-lg px-3 py-2 text-gray-600 appearance-none"
              name="leather"
              value={form.leather}
              onChange={handleChange}
              required
            >
              <option value="">Category</option>
              {LEATHERS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* IMAGE + SIZE ROW */}
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            {/* IMAGE UPLOAD */}
            <div className="flex-1 w-full flex flex-col gap-2">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-gray-600"
              />

              {/* IMAGE PREVIEW */}
              {form.image && (
                <div className="flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <p className="text-xs text-gray-600 truncate max-w-[140px]">
                    {form.image.name} ({formatSize(form.image.size)})
                  </p>
                </div>
              )}
            </div>

            {/* SIZE INPUT */}
            <input
              type="text"
              name="size"
              placeholder="Enter Size"
              value={form.size}
              onChange={handleChange}
              className="flex-1 w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* MESSAGE */}
          <textarea
            className="w-full border rounded-lg px-3 py-2 resize-none"
            rows={3}
            placeholder="Message (optional)"
            name="message"
            value={form.message}
            onChange={handleChange}
          />

          {/* SUBMIT */}
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

        {/* FORM */}
      </div>
    </div>
  );
}

export default ConsultAdvisor;
