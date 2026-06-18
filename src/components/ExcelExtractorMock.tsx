/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, CheckCircle, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { BardoEvent } from "../types";
import { generateBulkEvents } from "../data";

interface ExcelExtractorMockProps {
  onEventsExtracted: (newEvents: BardoEvent[]) => void;
  onCancel: () => void;
}

export default function ExcelExtractorMock({ onEventsExtracted, onCancel }: ExcelExtractorMockProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "extracting" | "success">("idle");
  const [extractedQty, setExtractedQty] = useState(45); // Simulation adds e.g. 45 events
  const [pastedText, setPastedText] = useState("");

  const presets = [
    { name: "AGENDA_Luxe-Spring-Launch_2026-04-08.pdf", size: "1.2 MB", count: 20 },
    { name: "SAVANNAH_Bardo_Summit_Master_Agenda.xlsx", size: "2.4 MB", count: 80 },
    { name: "ConfServ_MegaBooking_100plus_Schedule.csv", size: "4.1 MB", count: 100 }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile({
        name: droppedFile.name,
        size: (droppedFile.size / (1024 * 1024)).toFixed(1) + " MB"
      });
    }
  };

  const selectPreset = (preset: typeof presets[0]) => {
    setFile({ name: preset.name, size: preset.size });
    setExtractedQty(preset.count);
  };

  const startExtraction = () => {
    if (!file && !pastedText) return;
    setStatus("uploading");
    setProgress(0);

    // Simulate upload phase
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setStatus("extracting");
          // Simulate AI extraction phase
          simulateAIExtraction();
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const simulateAIExtraction = () => {
    setTimeout(() => {
      setStatus("success");
      const generated = generateBulkEvents(extractedQty);
      onEventsExtracted(generated);
    }, 2000);
  };

    const payloadName = file ? file.name : "pasted raw text data";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xl max-w-2xl mx-auto" id="extractor-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-800">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-stone-900">AI BEO & Agenda Extractor</h3>
            <p className="text-xs text-stone-500">Upload your planner schedule spreadsheet or vendor PDF to generate 20, 80, or 100+ events automatically.</p>
          </div>
        </div>
      </div>

      {status === "idle" && (
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-amber-500 bg-amber-50/20"
                : "border-stone-200 hover:border-stone-300 bg-stone-50/30"
            }`}
          >
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              accept=".xlsx,.xls,.csv,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile({
                    name: e.target.files[0].name,
                    size: (e.target.files[0].size / (1024 * 1024)).toFixed(1) + " MB"
                  });
                  setPastedText(""); // Clear text if file selected
                }
              }}
            />
            <label htmlFor="file-upload-input" className="cursor-pointer">
              <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-800">
                Drag and drop your agenda file here or <span className="text-amber-800 underline">browse</span>
              </p>
              <p className="text-xs text-stone-500 mt-1">Supports EXCEL, CSV or Banquet PDFs</p>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">OR PASTE TEXT</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <textarea
            value={pastedText}
            onChange={(e) => {
              setPastedText(e.target.value);
              if (e.target.value) setFile(null); // Clear file if text is pasted
            }}
            placeholder="Paste your raw agenda text directly here..."
            className="w-full h-32 bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white resize-none"
          />

          {file && (
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-lg border border-stone-200 animate-fadeIn" id="selected-file-banner">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-800" />
                <div className="max-w-md truncate">
                  <p className="text-sm font-medium text-stone-900 truncate">{file.name}</p>
                  <p className="text-xs text-stone-500">{file.size}</p>
                </div>
              </div>
              <button
                className="text-xs font-semibold text-stone-400 hover:text-stone-600 uppercase"
                onClick={() => setFile(null)}
              >
                Clear
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-all border border-stone-200 hover:bg-stone-50 rounded-md"
              id="cancel-upload-btn"
            >
              Cancel
            </button>
            <button
              disabled={!file && !pastedText}
              onClick={startExtraction}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                file || pastedText
                  ? "bg-amber-800 text-white hover:bg-amber-900 shadow-md cursor-pointer"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }`}
              id="start-extract-btn"
            >
              <Sparkles className="w-4 h-4" />
              Parse & Extract using ConfServ AI
            </button>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {status === "uploading" && (
        <div className="text-center py-12 space-y-6">
          <Loader2 className="w-12 h-12 text-amber-800 animate-spin mx-auto" />
          <div className="space-y-2">
            <h4 className="font-medium text-stone-800">Uploading Content to Secured Hotel Bardo Hub...</h4>
            <p className="text-xs text-stone-500">Transmitting: {payloadName}</p>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 max-w-sm mx-auto overflow-hidden">
            <div
              className="bg-amber-800 h-2 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-mono text-stone-600 font-semibold">{progress}%</span>
        </div>
      )}

      {/* AI Extraction State */}
      {status === "extracting" && (
        <div className="text-center py-12 space-y-6">
          <div className="relative inline-block">
            <Loader2 className="w-14 h-14 text-amber-700 animate-spin mx-auto" />
            <Sparkles className="w-6 h-6 text-amber-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h4 className="font-serif text-lg font-semibold text-stone-900">Bardo ConfServ AI Analyzing Document</h4>
            <div className="space-y-1.5 text-xs text-stone-500 font-mono">
              <p className="animate-pulse">✓ Mapping event dates & session schedules...</p>
              <p className="animate-pulse delay-75">✦ Aligning location rooms (Grand Ballroom, Carriage House)...</p>
              <p className="animate-pulse delay-150">✦ Matching catering requirements & catalog lookups...</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === "success" && (
        <div className="text-center py-12 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-xl font-bold text-stone-900">Extraction Complete!</h4>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Our AI has successfully read <span className="font-medium text-stone-800">{payloadName}</span> and auto-aligned <span className="font-bold text-emerald-800 text-base">{extractedQty} events</span> directly into your online workspace portfolio.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={onCancel} // Closes extractor and returns to workspace
              className="bg-stone-900 text-white rounded-md px-6 py-2.5 text-sm font-semibold hover:bg-stone-800 tracking-wide shadow"
              id="view-schedule-extracted-btn"
            >
              Go to Workspace Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
