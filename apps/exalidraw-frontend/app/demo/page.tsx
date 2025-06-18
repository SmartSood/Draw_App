"use client"
import React, { useState } from "react";

const pageTypes = [
  { id: "blank", label: "Blank", icon: <span className="w-5 h-5 rounded bg-gray-200 border" /> },
  { id: "lined", label: "Lined", icon: <svg width="20" height="20"><line x1="0" y1="5" x2="20" y2="5" stroke="#60a5fa" strokeWidth="2"/><line x1="0" y1="10" x2="20" y2="10" stroke="#60a5fa" strokeWidth="2"/><line x1="0" y1="15" x2="20" y2="15" stroke="#60a5fa" strokeWidth="2"/></svg> },
  { id: "columned", label: "Columned", icon: <svg width="20" height="20"><rect x="3" y="3" width="4" height="14" fill="#60a5fa"/><rect x="8" y="3" width="4" height="14" fill="#a5b4fc"/><rect x="13" y="3" width="4" height="14" fill="#60a5fa"/></svg> },
  { id: "boxed", label: "Boxed", icon: <svg width="20" height="20"><rect x="3" y="3" width="14" height="14" rx="2" fill="#fbbf24" stroke="#f59e42" strokeWidth="2"/><rect x="6" y="6" width="8" height="8" rx="1" fill="#fff" stroke="#f59e42" strokeWidth="1.5"/></svg> },
];

const bgColors = [
  "#ffffff", "#f3f4f6", "#e0e7ef", "#fef9c3", "#fee2e2", "#d1fae5", "#f0abfc", "#000000"
];

const lineColors = [
  "#60a5fa", "#a5b4fc", "#f59e42", "#f43f5e", "#22d3ee", "#10b981", "#fbbf24", "#000000"
];

export default function DemoPage() {
  const [selectedPageType, setSelectedPageType] = useState("blank");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [lineColor, setLineColor] = useState("#60a5fa");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Hamburger Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/90 border border-gray-200 shadow hover:bg-gray-100 transition-all"
        onClick={() => setSidebarOpen((v) => !v)}
        title={sidebarOpen ? "Hide Toolbar" : "Show Toolbar"}
      >
        {/* Hamburger Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="7" width="16" height="2" rx="1" fill="#555" />
          <rect x="4" y="11" width="16" height="2" rx="1" fill="#555" />
          <rect x="4" y="15" width="16" height="2" rx="1" fill="#555" />
        </svg>
      </button>
      {/* Left Toolbar (Sidebar) */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-full flex flex-col items-center py-8 px-2 bg-white/80 shadow-lg z-40 rounded-tr-2xl rounded-br-2xl border-r border-gray-200 w-56 transition-all duration-300">
          <div className="flex flex-col gap-8 mt-10 w-full">
            {/* Page Type */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 pl-2">Page Type</div>
              <div className="flex flex-col gap-2">
                {pageTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedPageType(type.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm w-full ${selectedPageType === type.id ? "bg-blue-100 border-blue-400 text-blue-700" : "hover:bg-gray-100 border-gray-200 text-gray-600"}`}
                    title={type.label}
                  >
                    <span>{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Background Color */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 pl-2">Background Color</div>
              <div className="flex flex-wrap gap-2 px-2">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${bgColor === color ? "border-blue-500 scale-110" : "border-gray-300 hover:border-gray-400"}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            {/* Line Color (for Lined, Columned, Boxed) */}
            {(selectedPageType === "lined" || selectedPageType === "columned" || selectedPageType === "boxed") && (
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 pl-2">Line Color</div>
                <div className="flex flex-wrap gap-2 px-2 mb-2">
                  {lineColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setLineColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${lineColor === color ? "border-blue-500 scale-110" : "border-gray-300 hover:border-gray-400"}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Demo Canvas Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[600px] h-[400px] rounded-2xl shadow-xl border-2 border-gray-200 flex items-center justify-center text-2xl font-bold bg-white/80">
          {selectedPageType.charAt(0).toUpperCase() + selectedPageType.slice(1)} Canvas Preview
        </div>
      </div>
    </div>
  );
} 