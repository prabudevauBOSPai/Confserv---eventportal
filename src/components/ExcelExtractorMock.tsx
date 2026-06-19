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
  onEventsExtracted: (newEvents: BardoEvent[], sourceName: string) => void;
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

  const payloadName = file ? file.name : "pasted raw text data";

  const simulateAIExtraction = () => {
    setTimeout(() => {
      setStatus("success");
      const generated = generateBulkEvents(extractedQty);
      onEventsExtracted(generated, payloadName);
    }, 2000);
  };

  return (
    <div className="w-full h-full flex flex-col" id="extractor-card">
      <div className="flex flex-col mb-8 shrink-0 space-y-2">
        <h2 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
          Upload Agenda
        </h2>
        <p className="text-base font-medium text-slate-500">
          Upload your schedule to populate your events.
        </p>
      </div>

      {status === "idle" && (
        <div className="flex flex-col flex-1 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-1 min-h-0">
            
            {/* Left Column: Drag & Drop Zone */}
            <div className="space-y-4 flex flex-col h-full">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 shrink-0">Upload Document</h4>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex-1 flex flex-col items-center justify-center ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white shadow-sm"
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
                <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-base font-bold text-slate-800">
                    Drag and drop your agenda file
                  </p>
                  <p className="text-sm text-slate-500 mt-2">or <span className="text-blue-600 underline hover:text-blue-700">browse files</span></p>
                  <p className="text-xs text-slate-400 mt-3 font-medium">Supports EXCEL, CSV or PDF (max 10MB)</p>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-fadeIn mt-4" id="selected-file-banner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-100">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="max-w-[200px] sm:max-w-xs truncate">
                      <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{file.size}</p>
                    </div>
                  </div>
                  <button
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => setFile(null)}
                    title="Remove file"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Paste Text */}
            <div className="space-y-4 flex flex-col h-full">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 shrink-0">Or Paste Text</h4>
              <textarea
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  if (e.target.value) setFile(null); // Clear file if text is pasted
                }}
                placeholder="Paste your raw agenda text directly here to parse event names, times, and dates..."
                className="w-full flex-1 min-h-[256px] md:min-h-[350px] bg-white border border-slate-200 rounded-2xl p-6 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none shadow-sm transition-all"
              />
            </div>
            
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-slate-200/60">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all border-2 border-slate-200 hover:border-slate-300 bg-white rounded-xl"
              id="cancel-upload-btn"
            >
              Cancel
            </button>
            <button
              disabled={!file && !pastedText}
              onClick={startExtraction}
              className={`flex items-center gap-2 px-8 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${
                file || pastedText
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
              id="start-extract-btn"
            >
              <Sparkles className="w-5 h-5 opacity-90" />
              Parse & Extract Data
            </button>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {status === "uploading" && (
        <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-8 animate-fadeIn">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <div className="space-y-3 text-center">
            <h4 className="text-xl font-bold text-slate-900">Uploading Document...</h4>
            <p className="text-sm font-medium text-slate-500">Transmitting: {payloadName}</p>
          </div>
          <div className="w-full max-w-md bg-slate-100 rounded-full h-3 mx-auto overflow-hidden shadow-inner hidden md:block">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-base font-mono text-slate-600 font-bold">{progress}%</span>
        </div>
      )}

      {/* Extraction State */}
      {status === "extracting" && (
        <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-8 animate-fadeIn text-center">
          <div className="relative inline-block mt-4 mb-2">
            <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto" strokeWidth={3} />
            <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="space-y-4 max-w-xl mx-auto">
            <h4 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">Analyzing Document</h4>
            <div className="space-y-3 text-sm md:text-base text-slate-500 font-mono tracking-wide font-medium">
              <p className="animate-pulse">✓ Mapping event dates & session schedules...</p>
              <p className="animate-pulse delay-75 text-slate-400">✦ Aligning location rooms...</p>
              <p className="animate-pulse delay-150 text-slate-400">✦ Matching catering requirements...</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === "success" && (
        <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-8 animate-fadeIn text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full mx-auto shadow-sm border border-emerald-100">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h4 className="text-3xl font-extrabold tracking-tight text-slate-900">Extraction Complete!</h4>
            <p className="text-base text-slate-500 max-w-md mx-auto font-medium">
              Successfully read <span className="font-bold text-slate-800">{payloadName}</span> and imported <span className="font-black text-emerald-600">{extractedQty} events</span> into your workspace.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={onCancel} // Closes extractor and returns to workspace
              className="bg-slate-900 text-white rounded-xl px-10 py-4 text-base font-bold hover:bg-slate-800 tracking-wide shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
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
