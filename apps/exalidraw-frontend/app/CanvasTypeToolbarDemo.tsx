import React, { useState } from "react";

const canvasTypes = [
  { id: "blank", label: "Blank", color: "bg-gray-100", icon: <span className="w-5 h-5 rounded bg-gray-200 border" /> },
  { id: "lined", label: "Lined", color: "bg-blue-100", icon: <svg width="20" height="20"><line x1="0" y1="5" x2="20" y2="5" stroke="#60a5fa" strokeWidth="2"/><line x1="0" y1="10" x2="20" y2="10" stroke="#60a5fa" strokeWidth="2"/><line x1="0" y1="15" x2="20" y2="15" stroke="#60a5fa" strokeWidth="2"/></svg> },
  { id: "white", label: "White", color: "bg-white", icon: <span className="w-5 h-5 rounded bg-white border" /> },
  { id: "black", label: "Black", color: "bg-black", icon: <span className="w-5 h-5 rounded bg-black border" /> },
];

export default function CanvasTypeToolbarDemo() {
  const [selected, setSelected] = useState("blank");
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Left Toolbar */}
      <div className={`fixed top-0 left-0 h-full flex flex-col items-center py-8 px-2 bg-white/80 shadow-lg z-50 rounded-tr-2xl rounded-br-2xl border-r border-gray-200 transition-all duration-300 ${open ? "w-24" : "w-12 px-0"}`}>
        {/* Open/Close Button */}
        <button
          className="mb-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 shadow-sm transition-all duration-200"
          onClick={() => setOpen((v) => !v)}
          title={open ? "Close Toolbar" : "Open Toolbar"}
        >
          <span className="flex items-center justify-center">
            {open ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M13 5L7 10L13 15" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7 5L13 10L7 15" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </span>
        </button>
        {open && (
          <div className="flex flex-col gap-4">
            {canvasTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelected(type.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-200 shadow-sm ${selected === type.id ? "bg-blue-100 border-blue-400 text-blue-700" : "hover:bg-gray-100 border-gray-200 text-gray-600"}`}
                title={type.label}
              >
                <span className="mb-1">{type.icon}</span>
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Demo Canvas Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[600px] h-[400px] rounded-2xl shadow-xl border-2 border-gray-200 flex items-center justify-center text-2xl font-bold bg-white/80">
          {selected.charAt(0).toUpperCase() + selected.slice(1)} Canvas Preview
        </div>
      </div>
    </div>
  );
} 