/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
  History,
  Download,
  Send,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Search,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight,
  MapPin,
  Check,
  User,
  Info,
  Eye,
  X,
  Ticket,
  Mail,
  Smartphone,
  Bot
} from "lucide-react";

import {
  Booking,
  BardoEvent,
  LineItem,
  CatalogItem,
  ChatMessage,
  AuditLog
} from "./types";

import {
  INITIAL_BOOKING,
  INITIAL_EVENTS,
  LUXURY_CATALOG,
  INITIAL_CHAT,
  INITIAL_LOGS,
  generateBulkEvents
} from "./data";

import BEOReport from "./components/BEOReport";
import InlineBEOReport from "./components/InlineBEOReport";
import ExcelExtractorMock from "./components/ExcelExtractorMock";

export default function App() {
  // Navigation & Screen Views
  // "landing" | "workspace" | "locked"
  const [currentView, setCurrentView] = useState<"landing" | "workspace" | "locked" | "communications">("landing");
  const [workspaceViewMode, setWorkspaceViewMode] = useState<"edit" | "preview">("edit");
  
  // App core state
  const [booking, setBooking] = useState<Booking>(INITIAL_BOOKING);
  const [events, setEvents] = useState<BardoEvent[]>(() => generateBulkEvents(20));
  const [selectedEventId, setSelectedEventId] = useState<string>("evt-01");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  
  // Interactive triggers
  const [cutoffLocked, setCutoffLocked] = useState<boolean>(false); // Can simulate RED LOCK scenario
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [composerType, setComposerType] = useState<"email" | "sms" | "ticket" | "chat">("chat");
  const [isBEOOpen, setIsBEOOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  
  // Catalog search state
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [catalogCategory, setCatalogCategory] = useState<"all" | "food" | "beverage" | "setup" | "av">("all");
  
  // Interactive UI layout states
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"food" | "beverage" | "setup" | "av" | "other" | "audits">("food");
  const [activeDocTab, setActiveDocTab] = useState<"changes" | "beo" | "comms">("comms"); // Default to comms (chat) in sidebar for easy instant view
  const [isScheduleCollapsed, setIsScheduleCollapsed] = useState<boolean>(false);
  
  // Chat input
  const [isWorkspaceEditing, setIsWorkspaceEditing] = useState<boolean>(true);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState<boolean>(false);
  const [activeChatContext, setActiveChatContext] = useState<"coordinator" | "ai">("coordinator");
  const [aiChatMessages, setAiChatMessages] = useState<{role: "user" | "ai", text: string}[]>([
    {role: "ai", text: "Hi! I am your AI assistant for Hotel Bardo Savannah. I can answer questions about menus, policies, layouts, and past similar events."}
  ]);

  // Filter Schedule Panel states (Crucial for handling 20, 80, 100+ events!)
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("ALL"); // "ALL" or specific YYYY-MM-DD
  const [eventSearchQuery, setEventSearchQuery] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const EVENTS_PER_PAGE = 5;

  // Comparison Diff Tracking state (Stores snapshot when user begins editing to show changes)
  const [originalEventsSnapshot, setOriginalEventsSnapshot] = useState<BardoEvent[]>([]);

  // Capture original snapshot once on first load / layout transition to compare edits
  useEffect(() => {
    if (originalEventsSnapshot.length === 0) {
      setOriginalEventsSnapshot(JSON.parse(JSON.stringify(INITIAL_EVENTS)));
    }
  }, [originalEventsSnapshot]);

  // Computed: Get all distinct event dates to drive our dynamic date select bar
  const distinctDates = useMemo(() => {
    const dates = new Set<string>();
    events.forEach(evt => dates.add(evt.date));
    return Array.from(dates).sort();
  }, [events]);

  // Computed: Get all distinct rooms to filter
  const distinctRooms = useMemo(() => {
    const rooms = new Set<string>();
    events.forEach(evt => rooms.add(evt.room));
    return Array.from(rooms).sort();
  }, [events]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDateFilter, eventSearchQuery, roomFilter, statusFilter]);

  // Handle auto event-selector assignment when filtered list changes as to not leave a dead-end
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchDate = selectedDateFilter === "ALL" ? true : evt.date === selectedDateFilter;
      const matchQuery = eventSearchQuery === "" ? true : evt.name.toLowerCase().includes(eventSearchQuery.toLowerCase()) || evt.room.toLowerCase().includes(eventSearchQuery.toLowerCase());
      const matchRoom = roomFilter === "ALL" ? true : evt.room === roomFilter;
      const matchStatus = statusFilter === "ALL" ? true : evt.status === statusFilter;
      return matchDate && matchQuery && matchRoom && matchStatus;
    });
  }, [events, selectedDateFilter, eventSearchQuery, roomFilter, statusFilter]);

  // Pagination chunk
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  // Active event mapping
  const activeEvent = useMemo(() => {
    return events.find(evt => evt.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Trigger quick load of bulk events (20, 80, 100) from uploader or a dedicated preview toolbar
  const handleBulkLoad = (qty: number) => {
    const generated = generateBulkEvents(qty);
    setEvents(generated);
    // Select first event of bulk
    if (generated.length > 0) {
      setSelectedEventId(generated[0].id);
    }
  };

  // Add line item to active event from Catalog search
  const handleAddCatalogItem = (catItem: CatalogItem) => {
    if (currentView === "locked" || cutoffLocked) return;

    setEvents(prevEvents => {
      return prevEvents.map(evt => {
        if (evt.id !== activeEvent.id) return evt;
        
        const categoryKey = catItem.category;
        const targetList = evt.requirements[categoryKey];
        
        // Avoid duplicates, increment instead
        const existingIndex = targetList.findIndex(item => item.name === catItem.name);
        let updatedList = [...targetList];
        
        if (existingIndex > -1) {
          const item = updatedList[existingIndex];
          updatedList[existingIndex] = {
            ...item,
            quantity: Number(item.quantity || 0) + 1
          };
        } else {
          updatedList.push({
            id: `item-${Date.now()}`,
            name: catItem.name,
            quantity: 1,
            unitPrice: catItem.unitPrice,
            description: catItem.description || "",
            itemType: catItem.category.toUpperCase(),
            revenueClassification: catItem.revenueClassification || "Other"
          });
        }

        return {
          ...evt,
          requirements: {
            ...evt.requirements,
            [categoryKey]: updatedList
          }
        };
      });
    });

    // Add Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Active Session)",
      eventName: activeEvent.name,
      category: catItem.category.toUpperCase(),
      action: "added",
      itemName: catItem.name,
      details: `Added ${catItem.name} at price $${catItem.unitPrice.toFixed(2)}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add custom manual item to selected section
  const handleAddCustomItem = (name: string, price: number, qty: number, desc: string, category: "food" | "beverage" | "setup" | "av" | "other") => {
    if (currentView === "locked" || cutoffLocked) return;
    if (!name.trim()) return;

    setEvents(prevEvents => {
      return prevEvents.map(evt => {
        if (evt.id !== activeEvent.id) return evt;
        
        const updatedList = [...evt.requirements[category], {
          id: `custom-item-${Date.now()}`,
          name: name.trim(),
          quantity: qty || 1,
          unitPrice: price || 0,
          description: desc || "",
          itemType: category.toUpperCase(),
          revenueClassification: category === "food" || category === "beverage" ? "Catering" : "Engineering"
        }];

        return {
          ...evt,
          requirements: {
            ...evt.requirements,
            [category]: updatedList
          }
        };
      });
    });

    // Add Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: "Just now",
      eventName: activeEvent.name,
      category: category.toUpperCase(),
      action: "added",
      itemName: name,
      details: `Added custom item "${name}" (Qty: ${qty})`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Modify quantities or notes inline
  const handleUpdateItemValue = (
    category: "food" | "beverage" | "setup" | "av" | "other",
    itemId: string,
    field: keyof LineItem,
    newValue: any
  ) => {
    if (currentView === "locked" || cutoffLocked) return;

    setEvents(prevEvents => {
      return prevEvents.map(evt => {
        if (evt.id !== activeEvent.id) return evt;
        
        const updatedList = evt.requirements[category].map(item => {
          if (item.id !== itemId) return item;
          return { ...item, [field]: newValue };
        });

        return {
          ...evt,
          requirements: {
            ...evt.requirements,
            [category]: updatedList
          }
        };
      });
    });
  };

  // Remove individual item
  const handleRemoveItem = (category: "food" | "beverage" | "setup" | "av" | "other", itemId: string, itemName: string) => {
    if (currentView === "locked" || cutoffLocked) return;

    setEvents(prevEvents => {
      return prevEvents.map(evt => {
        if (evt.id !== activeEvent.id) return evt;
        return {
          ...evt,
          requirements: {
            ...evt.requirements,
            [category]: evt.requirements[category].filter(item => item.id !== itemId)
          }
        };
      });
    });

    // Add Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: "Just now",
      eventName: activeEvent.name,
      category: category.toUpperCase(),
      action: "deleted",
      itemName: itemName,
      details: `Removed item from ${category.toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Filter luxury catalog based on search
  const filteredCatalog = useMemo(() => {
    return LUXURY_CATALOG.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(catalogSearch.toLowerCase()));
      const matchCat = catalogCategory === "all" ? true : item.category === catalogCategory;
      return matchSearch && matchCat;
    });
  }, [catalogSearch, catalogCategory]);

  // Client messaging interaction CSM Larissa & AI
  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userInput = chatInput.trim();
    
    if (activeChatContext === "coordinator") {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "client",
        text: userInput,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages(prev => [...prev, userMsg]);
      setChatInput("");
      setIsChatTyping(true);

      // Simulate smart Larissa Szynski Coordinator Auto-response
      setTimeout(() => {
        setIsChatTyping(false);
        let larissaReply = "Thank you so much for your update! I am checking on these event details right now. Let me know if you would like me to adjust any room diagram options as well.";
        
        const textLower = userMsg.text.toLowerCase();
        if (textLower.includes("bar") || textLower.includes("drink") || textLower.includes("spirit")) {
          larissaReply = `Absolutely! For the bar, I can confirm we serve ${booking.propertyName} custom-infused gin batches. Adding signature cocktails on consumption is highly recommended for group guest counts!`;
        } else if (textLower.includes("audio") || textLower.includes("av") || textLower.includes("screen") || textLower.includes("microphone")) {
          larissaReply = "Roger that! Regarding AV: our outside vendor logistics patch fee covers full audio connection to the ceiling sound bar systems. Let me know if you need high-power projectors instead!";
        } else if (textLower.includes("locked") || textLower.includes("cutoff") || textLower.includes("extension")) {
          larissaReply = "If you need adjustments near the cutoff, don't worry! I can bypass the block for F&B updates. Go ahead and submit, and I will approve it internally on your Banquet orders.";
        } else if (textLower.includes("hello") || textLower.includes("hi") || textLower.includes("larissa")) {
          larissaReply = `Wonderful to hear from you! Please feel free to add items from the ${booking.propertyName} catalog. I will receive your order immediately once you click 'Submit Final'.`;
        }

        setChatMessages(prev => [...prev, {
          id: `msg-rep-${Date.now()}`,
          sender: " Larissa Szynski (CSM)",
          text: larissaReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      }, 1800);
    } else {
      // AI Context
      setAiChatMessages(prev => [...prev, { role: "user", text: userInput }]);
      setChatInput("");
      setIsChatTyping(true);
      
      setTimeout(() => {
        setIsChatTyping(false);
        let aiReply = "Based on hotel guidelines, that is completely doable. Let me know if you'd me to like help find catalog items for this.";
        const textLower = userInput.toLowerCase();
        
        if (textLower.includes("menu") || textLower.includes("food") || textLower.includes("dinner")) {
          aiReply = "Hotel Bardo's culinary program emphasizes coastal Italian influences with fresh, local Georgian produce. For main dinners, the Seared Scallops and the 72-Hour Short Rib are historical customer favorites.";
        } else if (textLower.includes("layout") || textLower.includes("capacity") || textLower.includes("room")) {
          aiReply = "For the Ballroom, standard rounds of 10 yield a maximum of 400 guests, while a reception-style layout supports up to 600.";
        }
        
        setAiChatMessages(prev => [...prev, { role: "ai", text: aiReply }]);
      }, 1200);
    }
  };

  // Modal differences calculations (Side-by-side Diff comparison list)
  const eventDiffs = useMemo(() => {
    const diffs: {
      id: string;
      eventName: string;
      date: string;
      changes: { category: string; action: "added" | "removed" | "modified"; name: string; oldVal?: string; newVal?: string }[];
    }[] = [];

    events.forEach(evt => {
      const originalEvt = originalEventsSnapshot.find(o => o.id === evt.id);
      const categoryChanges: any[] = [];

      const categories: ("food" | "beverage" | "setup" | "av" | "other")[] = ["food", "beverage", "setup", "av", "other"];

      if (!originalEvt) {
        // If event was newly extracted or added
        categoryChanges.push({ category: "All", action: "added", name: "New Event Schedule Portfolio added via AI extraction" });
      } else {
        categories.forEach(cat => {
          const origItems = originalEvt.requirements[cat] || [];
          const currItems = evt.requirements[cat] || [];

          // Added items (exist in current but not in original)
          currItems.forEach(curr => {
            const orig = origItems.find(o => o.name === curr.name);
            if (!orig) {
              categoryChanges.push({
                category: cat.toUpperCase(),
                action: "added",
                name: curr.name,
                newVal: `Qty: ${curr.quantity || 1} @ $${curr.unitPrice.toFixed(2)}`
              });
            } else if (orig.quantity !== curr.quantity || orig.description !== curr.description) {
              categoryChanges.push({
                category: cat.toUpperCase(),
                action: "modified",
                name: curr.name,
                oldVal: `Qty: ${orig.quantity || 1}`,
                newVal: `Qty: ${curr.quantity || 1}`
              });
            }
          });

          // Removed items (exist in original but not in current)
          origItems.forEach(orig => {
            const curr = currItems.find(c => c.name === orig.name);
            if (!curr) {
              categoryChanges.push({
                category: cat.toUpperCase(),
                action: "removed",
                name: orig.name,
                oldVal: `Qty: ${orig.quantity || 1}`
              });
            }
          });
        });
      }

      if (categoryChanges.length > 0) {
        diffs.push({
          id: evt.id,
          eventName: evt.name,
          date: evt.date,
          changes: categoryChanges
        });
      }
    });

    return diffs;
  }, [events, originalEventsSnapshot]);

  // Formatter for YYYY-MM-DD
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen text-stone-900 flex flex-col font-sans" id="confer-app-root">
      
      {/* Main Header Block */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-40 shadow-sm px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-6">
          {/* -Logo Brand Title */}
          <div className="cursor-pointer select-none group" onClick={() => setCurrentView("landing")}>
            <span className="font-sans text-xl font-black bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent block tracking-wide" id="header-brand-title">
              ConfServ
            </span>
            <span className="text-[10px] tracking-widest text-stone-500 font-mono font-medium block uppercase group-hover:text-blue-500 transition-colors">
              Conference Services
            </span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          {/* Main User Navigation Links */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => { setCurrentView("landing"); }}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                currentView === "landing" ? "bg-blue-50 text-blue-700" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
              id="nav-welcome-btn"
            >
              Overview
            </button>
            <button
              onClick={() => { setCurrentView("workspace"); }}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                currentView === "workspace" ? "bg-blue-50 text-blue-700" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
              id="nav-workspace-btn"
            >
              Workspace
            </button>
            <button
              onClick={() => { setCurrentView("locked"); }}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                currentView === "locked" ? "bg-blue-50 text-blue-700" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
              id="nav-locked-btn"
            >
              Final Package
            </button>
          </nav>
        </div>

        {/* Global booking status info */}
        <div className="flex items-center gap-3">
          {/* Warning Banner moved to navbar */}
          {currentView !== "locked" && !cutoffLocked && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="text-[10px] font-medium text-amber-800">
                F&B Cutoff in <span className="font-bold underline">5 days</span>.
              </span>
            </div>
          )}

          {currentView !== "locked" && cutoffLocked && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
              <Lock className="w-3 h-3 text-red-600 shrink-0" />
              <span className="text-[10px] font-medium text-red-800">
                Final Selection Locked.
              </span>
            </div>
          )}

          <div className="text-right flex items-center">
            <div className={`flex items-center justify-center p-1.5 rounded-full border ${
              currentView === "locked" || cutoffLocked
                ? "bg-red-50 border-red-200"
                : "bg-emerald-50 border-emerald-200"
            }`} title={currentView === "locked" ? "Locked" : cutoffLocked ? "Past Cutoff" : "Open Draft"}>
              <span className={`w-2 h-2 rounded-full ${currentView === "locked" || cutoffLocked ? "bg-red-600" : "bg-emerald-500 animate-pulse"}`} />
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200 hidden sm:block" />

          {/* Current selected event counter indicator */}
          <div className="bg-stone-50 border border-stone-200 px-2 py-1 rounded-md flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-blue-600 text-white rounded w-5 h-5 flex items-center justify-center shadow-sm">
              {events.length}
            </span>
            <span className="text-[10px] font-semibold text-stone-600 hidden md:inline uppercase tracking-widest pt-0.5 pr-1">Events</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER AREA */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 py-6 md:py-8">
        
        <AnimatePresence mode="wait">
          
          {/* ==================== 1. ENTRY & WELCOME LANDING VIEW ==================== */}
          {currentView === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              id="landing-view-viewport"
            >
              {/* Single Section Landing View */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col lg:flex-row min-h-[calc(100vh-250px)]" id="single-landing-section">
                
                {/* Left Side: Welcome, Stats & Actions */}
                <div className="flex-1 lg:w-[65%] xl:w-[70%] bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 p-8 md:p-12 lg:p-16 flex flex-col relative overflow-hidden justify-between">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-200/20 rounded-full blur-3xl -mb-20 -ml-20 pointer-events-none"></div>

                  <div className="relative z-10 space-y-6">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white text-xs font-bold uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100">
                      Welcome back, {booking.contactName}
                    </span>
                    
                    <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-800">
                      <span className="text-blue-600 inline-block mt-2">{booking.title}</span>
                    </h2>
                    
                    <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
                      Your personalized workspace is pre-configured and ready. Review your schedules, add catering, and finalize your room layouts across all scheduled events.
                    </p>
                  </div>

                  {/* Compact Stats Grid */}
                  <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 mb-10">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Guests</span>
                      <span className="text-3xl font-extrabold text-blue-500">{booking.expectedAttendanceGlobal}</span>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Events</span>
                      <span className="text-3xl font-extrabold text-fuchsia-500">{events.length}</span>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Menu Due</span>
                      <span className="text-xl font-extrabold text-emerald-500 mt-1">{formatFriendlyDate(booking.foodCutoffDate)}</span>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Final Headcount</span>
                      <span className="text-xl font-extrabold text-amber-500 mt-1">{formatFriendlyDate(booking.finalGuaranteeDate)}</span>
                    </div>
                  </div>

                  {/* Call to Actions */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mt-auto border-t border-slate-200/60 pt-8">
                    <button
                      onClick={() => { setCurrentView("workspace"); }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base px-10 py-5 rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      Enter Interactive Workspace
                      <Sparkles className="w-5 h-5 opacity-90" />
                    </button>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-bold text-base px-8 py-5 rounded-2xl transition-all hover:bg-slate-50 shadow-sm cursor-pointer"
                    >
                      <UploadCloud className="w-5 h-5 text-slate-600" />
                      Upload Agenda
                    </button>
                  </div>
                  
                  {isUploadOpen && (
                    <div className="absolute bottom-28 left-8 right-8 z-20 bg-white/95 backdrop-blur-sm p-2 rounded-2xl shadow-2xl border border-blue-100 animate-fadeIn" id="ai-uploader-section">
                      <ExcelExtractorMock
                        onEventsExtracted={(newEvents) => {
                          setEvents(newEvents);
                          setOriginalEventsSnapshot(JSON.parse(JSON.stringify(INITIAL_EVENTS)));
                          setCurrentView("workspace");
                          setIsUploadOpen(false);
                        }}
                        onCancel={() => setIsUploadOpen(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Right Side: Coordinator & Info */}
                <div className="w-full lg:w-[35%] xl:w-[30%] bg-slate-50 border-l border-slate-200 p-8 md:p-12 flex flex-col justify-between">
                  {/* Coordinator Profile */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Your Coordinator</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-blue-200 flex items-center justify-center shrink-0 relative">
                        <span className="font-sans text-lg font-black text-blue-600 uppercase">LS</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-stone-900">Larissa Szynski</h4>
                        <p className="text-xs text-stone-500 font-medium">{booking.bookedBy}</p>
                      </div>
                    </div>
                    <div className="relative mt-2">
                      <div className="absolute top-0 left-4 -mt-2 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-200"></div>
                      <p className="relative text-sm text-slate-600 leading-relaxed bg-white border border-slate-200 p-4 rounded-xl shadow-sm italic">
                        "I'm here to ensure your event runs flawlessly. Once you enter the workspace, feel free to use the floating chat to message me directly!"
                      </p>
                    </div>
                  </div>

                  {/* Planning Roadmap */}
                  <div className="space-y-5 mt-10 lg:mt-auto">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2 mb-4">Planning Roadmap</h4>
                    <div className="flex gap-4 items-start">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-stone-800 block">Verify Timelines</span>
                        <p className="text-xs text-stone-500 leading-relaxed">Validate location and expected attendances.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-stone-800 block">Select F&B + AV</span>
                        <p className="text-xs text-stone-500 leading-relaxed">Pick items from the property catalog.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-stone-800 block">Lock Submission</span>
                        <p className="text-xs text-stone-500 leading-relaxed">Sign off and commit your event setup.</p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 font-medium space-y-1">
                    <p><span className="font-bold text-slate-500">Account:</span> {booking.account}</p>
                    <p><span className="font-bold text-slate-500">Property:</span> {booking.propertyName}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== 2. MAIN ACTIVE DASHBOARD WORKSPACE ==================== */}
          {currentView === "workspace" && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className=""
              id="workspace-view-viewport"
            >
              {/* Start Two Column Master-Detail Grid: Left sidebar select (1), center workspace (2) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* ==================== COLUMN 1: INTERACTIVE EVENT SELECTOR (LEFT) ==================== */}
                <div className="md:col-span-4 lg:col-span-3 h-[750px]">
                  <div className="bg-white rounded-xl border border-stone-200 bardo-shadow-lg overflow-hidden flex flex-col h-full" id="event-directory-sidebar">
                    <div className="p-4.5 bg-stone-50 border-b border-stone-150">
                      <h3 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-widest">Select Event</h3>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {filteredEvents.length} of {events.length} schedule items
                      </p>
                    </div>

                    {/* Minimalist filters */}
                    <div className="p-3 bg-white border-b border-stone-150 space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute top-2.5 left-2.5" />
                        <input
                          type="text"
                          value={eventSearchQuery}
                          onChange={(e) => setEventSearchQuery(e.target.value)}
                          placeholder="Search function, room..."
                          className="w-full bg-stone-50 border border-stone-200 py-1 pl-7.5 pr-2 text-xs rounded focus:border-amber-700/60 focus:bg-white focus:outline-none transition-all placeholder-stone-400 font-sans"
                        />
                      </div>
                      
                      <div className="flex gap-1.5">
                        <select
                          value={roomFilter}
                          onChange={(e) => setRoomFilter(e.target.value)}
                          className="flex-1 bg-stone-50 border border-stone-200 py-1 px-1.5 text-[10.5px] rounded focus:outline-none focus:bg-white focus:border-amber-700/60 font-sans"
                        >
                          <option value="ALL">All Rooms</option>
                          {distinctRooms.map(room => (
                            <option key={room} value={room}>{room}</option>
                          ))}
                        </select>

                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="flex-1 bg-stone-50 border border-stone-200 py-1 px-1.5 text-[10.5px] rounded focus:outline-none focus:bg-white focus:border-amber-700/60 font-sans"
                        >
                          <option value="ALL">All Status</option>
                          <option value="Definite">Definite</option>
                          <option value="Tentative">Tentative</option>
                          <option value="Pending Approval">Pending</option>
                        </select>
                      </div>

                      {(eventSearchQuery || roomFilter !== "ALL" || statusFilter !== "ALL") && (
                        <button
                          onClick={() => { setEventSearchQuery(""); setRoomFilter("ALL"); setStatusFilter("ALL"); }}
                          className="w-full py-1 text-center bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-600/15 rounded text-[10px] tracking-wide font-bold uppercase transition-all cursor-pointer"
                        >
                          Clear Selection Filters
                        </button>
                      )}
                    </div>

                    {/* Compact Event Row list */}
                    <div className="flex-1 overflow-y-auto divide-y divide-stone-150 scrollbar-thin">
                      {filteredEvents.map((evt) => {
                        const isActive = evt.id === activeEvent.id;
                        const totalItems = Object.values(evt.requirements).flat().length;

                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEventId(evt.id)}
                            className={`p-3.5 transition-all cursor-pointer flex flex-col gap-1.5 border-l-3 select-none ${
                              isActive
                                ? "bg-amber-50/20 border-amber-805"
                                : "hover:bg-stone-50 border-transparent"
                            }`}
                            id={`evt-row-${evt.id}`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono font-bold text-stone-400 block">
                                {formatFriendlyDate(evt.date)}
                              </span>
                              <h4 className="text-xs font-semibold text-stone-850 tracking-tight leading-snug">
                                {evt.name}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-stone-500 font-sans">
                              <span>{evt.startTime} - {evt.endTime}</span>
                              <span className="font-mono text-[9px] bg-stone-100 border border-stone-200 px-1.5 py-0.2 rounded text-stone-600">
                                {evt.room}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-dashed border-stone-150 pt-1.5">
                              <span>{evt.setupStyle} Setup</span>
                              <span className={`inline-block py-0.2 px-1.5 rounded font-bold font-mono text-[9px] ${
                                totalItems > 0 ? "bg-amber-100 text-amber-900 border border-amber-600/15" : "bg-stone-100 text-stone-400"
                              }`}>
                                {totalItems} items
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {filteredEvents.length === 0 && (
                        <div className="p-8 text-center text-stone-400 italic text-xs">
                          No matching events.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ==================== COLUMN 2: ACTIVE SPECIFICATIONS WORKSPACE (CENTER) ==================== */}
                <div className="md:col-span-8 lg:col-span-9 h-[750px]">
                  
                  <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden h-full flex flex-col" id="requirements-workspace">
                    <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 shrink-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-blue-400 uppercase tracking-widest font-mono font-bold block">Specifying Requirements For:</span>
                          <div className="flex bg-slate-800 p-0.5 rounded border border-slate-700">
                             <button onClick={() => setWorkspaceViewMode("edit")} className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider transition-colors ${workspaceViewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Edit</button>
                             <button onClick={() => setWorkspaceViewMode("preview")} className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider flex items-center transition-colors ${workspaceViewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><FileText className="w-2.5 h-2.5 mr-1" /> BEO</button>
                          </div>
                        </div>
                        <h3 className="font-serif text-base font-semibold tracking-wide" id="active-event-specification-title">
                          {activeEvent.name}
                        </h3>
                        <p className="text-[11px] text-stone-400">Venue: {activeEvent.room} &nbsp;&bull;&nbsp; Setup: {activeEvent.setupStyle}</p>
                      </div>
                      
                      {workspaceViewMode === "edit" && (
                        <div className="flex items-center gap-4">
                          {/* Read-Only / Edit Toggle Switch */}
                          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg shrink-0">
                            <span className={`text-[10px] uppercase font-mono tracking-tight ${!isWorkspaceEditing ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>Read-Only</span>
                            <button
                              onClick={() => setIsWorkspaceEditing(!isWorkspaceEditing)}
                              disabled={cutoffLocked}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${cutoffLocked ? 'bg-stone-700 opacity-50' : (isWorkspaceEditing ? 'bg-blue-600' : 'bg-stone-600')}`}
                              id="workspace-edit-toggle"
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isWorkspaceEditing ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-[10px] uppercase font-mono tracking-tight ${isWorkspaceEditing ? 'text-blue-400 font-bold' : 'text-stone-400'}`}>Edit</span>
                          </div>

                          {/* Active attendance interactive input */}
                          <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-850 shrink-0">
                            <label className="text-[10px] text-stone-300 uppercase font-mono tracking-tight shrink-0">Attendance Gtd:</label>
                            <input
                              type="number"
                              value={activeEvent.guaranteedAttendance}
                              disabled={cutoffLocked || !isWorkspaceEditing}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setEvents(prev => prev.map(evt => evt.id === activeEvent.id ? { ...evt, guaranteedAttendance: val } : evt));
                            }}
                            className="w-14 bg-stone-900 text-stone-100 border border-stone-800 py-0.5 px-1 text-xs font-mono font-bold text-center focus:border-amber-400 focus:outline-none"
                            id="gtd-attendance-input"
                          />
                        </div>
                      </div>
                      )}
                    </div>

                  {workspaceViewMode === "edit" ? (
                    <div className="flex-1 overflow-y-auto flex flex-col">
                      {/* Step-by-step Requirements Category tabs: Food -> Beverage -> Setup -> AV -> Other -> Audits */}
                      <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto whitespace-nowrap scrollbar-thin shrink-0">
                      {(["food", "beverage", "setup", "av", "other", "audits"] as const).map((tab) => {
                        const tabCount = tab === "audits" ? auditLogs.filter(l => l.eventName === activeEvent.name).length : activeEvent.requirements[tab as "food" | "beverage" | "setup" | "av" | "other"].length;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveWorkspaceTab(tab)}
                            className={`px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeWorkspaceTab === tab
                                ? "border-blue-600 text-blue-700 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                            }`}
                            id={`tab-btn-${tab}`}
                          >
                            <span>{tab === "av" ? "Audio-Visual" : tab}</span>
                            <span className={`inline-flex items-center justify-center font-mono text-[9.5px] rounded-full w-4.5 h-4.5 ${
                              activeWorkspaceTab === tab ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              {tabCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Requirements Interactive specs Table */}
                    <div className="p-6 space-y-6">
                      
                      {/* Section content summary */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-stone-150-50">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                          {activeWorkspaceTab === "food" && "Curated Catering (F&B) Placements"}
                          {activeWorkspaceTab === "beverage" && `${booking.propertyName} Cellars & Drink Hosts`}
                          {activeWorkspaceTab === "setup" && "Design & Venue Setup Resources"}
                          {activeWorkspaceTab === "av" && "Outside AV Compliance & Patch Equipment"}
                          {activeWorkspaceTab === "other" && "Additional Requests & Notes"}
                          {activeWorkspaceTab === "audits" && "Audit Log & Change History"}
                        </h4>
                        
                        {activeWorkspaceTab !== "audits" && (
                          <span className="text-xs font-mono text-slate-500">
                            Subtotal: ${activeEvent.requirements[activeWorkspaceTab as "food" | "beverage" | "setup" | "av" | "other"].reduce((acc, curr) => acc + (Number(curr.quantity || 0) * curr.unitPrice), 0).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Display Table of items in this category */}
                      {activeWorkspaceTab !== "audits" ? (
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin" id="specifications-items-list">
                          {activeEvent.requirements[activeWorkspaceTab].map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col md:flex-row md:items-center justify-between py-2 px-3.5 bg-stone-50 border border-stone-200 hover:border-stone-250 hover:bg-white rounded-lg gap-4 transition-all duration-150 animate-fadeIn"
                            id={`item-row-${item.id}`}
                          >
                            {/* Line item info */}
                            <div className="space-y-1 flex-1">
                              <span className="font-semibold text-stone-955 text-sm block">{item.name}</span>
                              {item.description ? (
                                <p className="text-xs text-stone-500 italic pl-1.5 border-l border-stone-300">{item.description}</p>
                              ) : (
                                <p className="text-[10px] text-stone-400 italic">No custom notes. Standard property conditions apply.</p>
                              )}
                            </div>

                            {/* Editing fields */}
                            <div className="flex items-center justify-between md:justify-end gap-4.5 shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0 border-stone-150">
                              
                              {/* Quantity control */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-stone-500 uppercase font-mono">Qty:</span>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  disabled={cutoffLocked || !isWorkspaceEditing}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? "" : parseInt(e.target.value) || 0;
                                    handleUpdateItemValue(activeWorkspaceTab, item.id, "quantity", val);
                                  }}
                                  className="w-14 bg-white border border-stone-300 rounded py-1 text-center text-xs font-semibold focus:border-amber-400 focus:outline-none disabled:bg-stone-100 disabled:text-stone-400"
                                  id={`qty-input-${item.id}`}
                                />
                              </div>

                              {/* Unit Price check */}
                              <div className="text-right font-mono text-xs w-28 shrink-0">
                                <span className="text-[9px] text-stone-405 block uppercase font-sans tracking-wide">Base Price &bull; Total</span>
                                <span className="text-stone-600 block text-[10.5px]">${item.unitPrice.toFixed(2)}</span>
                                <span className="font-bold text-stone-900 block">${(Number(item.quantity || 1) * item.unitPrice).toFixed(2)}</span>
                              </div>

                              {/* Remove item button */}
                              {!cutoffLocked && isWorkspaceEditing ? (
                                <button
                                  onClick={() => handleRemoveItem(activeWorkspaceTab, item.id, item.name)}
                                  className="p-1.5 text-stone-400 hover:text-red-700/80 hover:bg-red-50 rounded transition-all cursor-pointer"
                                  id={`remove-btn-${item.id}`}
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <div className="p-1.5 text-stone-300" title="Locked due to cutoff date">
                                  <Lock className="w-4 h-4" />
                                </div>
                              )}

                            </div>
                          </div>
                        ))}

                        {activeEvent.requirements[activeWorkspaceTab as "food" | "beverage" | "setup" | "av" | "other"].length === 0 && (
                          <div className="text-center py-5 px-4 bg-stone-50 border border-dashed border-stone-250 rounded-lg text-stone-500 italic text-sm" id="empty-workspace-notification">
                            No custom specifications configured for this section. Search the catalog or write a custom item below to initialize requirements!
                          </div>
                        )}
                      </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin" id="audit-history-list">
                          {auditLogs.filter(l => l.eventName === activeEvent.name).map((log) => (
                            <div key={log.id} className="flex flex-col gap-1.5 p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-sm transition-colors">
                              <div className="flex items-center justify-between gap-1 flex-wrap font-mono text-[10px]">
                                <span className="text-slate-500 font-bold">{log.timestamp}</span>
                                {log.action === "added" ? (
                                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Placed</span>
                                ) : (
                                  <span className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full uppercase">Deleted</span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="font-semibold text-slate-800 block text-base leading-tight">{log.itemName}</span>
                                <p className="text-slate-600 text-xs">{log.details}</p>
                              </div>
                            </div>
                          ))}
                          {auditLogs.filter(l => l.eventName === activeEvent.name).length === 0 && (
                            <div className="text-center py-10 bg-stone-50 border border-dashed border-stone-250 p-6 rounded-lg text-stone-500 italic">
                              No history logs found for this specific event.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add Item Panel: Catalog Quick Search & Custom Manual Form */}
                      {(!cutoffLocked && isWorkspaceEditing) && activeWorkspaceTab !== "audits" ? (
                        <div className="bg-stone-100/50 p-4.5 rounded-lg border border-stone-200 space-y-4" id="add-item-subpanel">
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4.5 h-4.5 text-amber-800" />
                            <span className="font-serif text-sm font-semibold text-stone-850">Quick Catalog Lookup & Placements</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                            
                            {/* Search box */}
                            <div className="md:col-span-12 relative">
                              <Search className="w-3.5 h-3.5 text-stone-400 absolute top-3 left-3" />
                              <input
                                type="text"
                                value={catalogSearch}
                                onChange={(e) => {
                                  setCatalogSearch(e.target.value);
                                  // Auto sync selected category to matching active tab to prevent blank initial searches
                                  if (catalogCategory === "all") {
                                    setCatalogCategory(activeWorkspaceTab);
                                  }
                                }}
                                placeholder={`Search through ${booking.propertyName} ${activeWorkspaceTab} luxury list...`}
                                className="w-full bg-white border border-stone-300 py-1.5 pl-8.5 text-xs rounded focus:border-amber-700/60 focus:outline-none"
                                id="catalog-inner-search"
                              />
                            </div>
                          </div>

                          {/* Quick selection results strip */}
                          <div className="max-h-52 overflow-y-auto divide-y divide-stone-150-100 bg-white border border-stone-200 rounded">
                            {filteredCatalog.map((catItem) => (
                              <div
                                key={catItem.id}
                                className="p-2.5 flex items-center justify-between hover:bg-amber-50/10 text-xs gap-4"
                                id={`cat-result-${catItem.id}`}
                              >
                                <div>
                                  <span className="font-semibold text-stone-800">{catItem.name}</span>
                                  {catItem.description && (
                                    <span className="block text-[10.5px] text-stone-500 italic mt-0.5">{catItem.description}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="font-mono text-stone-700 font-bold">${catItem.unitPrice.toFixed(2)}</span>
                                  <button
                                    onClick={() => handleAddCatalogItem(catItem)}
                                    className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded text-[10px] uppercase flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                                    id={`add-cat-btn-${catItem.id}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                    Place Item
                                  </button>
                                </div>
                              </div>
                            ))}

                            {filteredCatalog.length === 0 && (
                              <div className="p-4 text-center text-stone-400 italic text-xs">
                                No catalog matches found. Type a custom record below to draft a custom placement.
                              </div>
                            )}
                          </div>

                          <div className="h-px bg-stone-200" />

                          {/* Alternative Form: Add entirely Custom Item */}
                          <div>
                            <span className="text-[10px] font-bold text-stone-500 tracking-wider block uppercase mb-2">Can't find what you need? Add custom menu item:</span>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const f = e.currentTarget;
                                const nameInput = f.elements.namedItem("itemName") as HTMLInputElement;
                                const priceInput = f.elements.namedItem("itemPrice") as HTMLInputElement;
                                const qtyInput = f.elements.namedItem("itemQty") as HTMLInputElement;
                                const descInput = f.elements.namedItem("itemDesc") as HTMLInputElement;

                                handleAddCustomItem(
                                  nameInput.value,
                                  parseFloat(priceInput.value),
                                  parseInt(qtyInput.value),
                                  descInput.value,
                                  activeWorkspaceTab
                                );

                                // Reset form values
                                nameInput.value = "";
                                priceInput.value = "0";
                                qtyInput.value = "1";
                                descInput.value = "";
                              }}
                              className="grid grid-cols-1 md:grid-cols-12 gap-3"
                              id="custom-item-form"
                            >
                              <div className="md:col-span-5">
                                <input
                                  type="text"
                                  name="itemName"
                                  required
                                  placeholder="e.g. Lavender Infused Honey Gin Cup"
                                  className="w-full bg-white border border-stone-300 py-1 px-2.5 text-xs rounded"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <input
                                  type="number"
                                  name="itemPrice"
                                  placeholder="Price"
                                  defaultValue="0"
                                  className="w-full bg-white border border-stone-300 py-1 px-2 text-xs font-mono rounded"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <input
                                  type="number"
                                  name="itemQty"
                                  placeholder="Qty"
                                  defaultValue="1"
                                  className="w-full bg-white border border-stone-300 py-1 px-2 text-xs font-mono rounded"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <button
                                  type="submit"
                                  className="w-full py-1 text-xs bg-stone-900 text-amber-300 font-bold rounded shadow-xs hover:bg-stone-850 cursor-pointer"
                                >
                                  Add Specification
                                </button>
                              </div>
                              <div className="md:col-span-12">
                                <input
                                  type="text"
                                  name="itemDesc"
                                  placeholder="Extra details, serving periods, special allergens setup, or instructions..."
                                  className="w-full bg-white border border-stone-300 py-1 px-2.5 text-xs rounded"
                                />
                              </div>
                            </form>
                          </div>
                        </div>
                      ) : activeWorkspaceTab !== "audits" && cutoffLocked ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium text-xs italic text-center">
                          <Lock className="w-3.5 h-3.5 inline mr-1.5 text-red-600" />
                          Specs locked due to cutoff deadline. Proposed edits require speaking to CSM coordinator Larissa.
                        </div>
                      ) : activeWorkspaceTab !== "audits" && !isWorkspaceEditing ? (
                        <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-stone-500 font-medium text-xs italic text-center" id="read-only-banner">
                          <Eye className="w-3.5 h-3.5 inline mr-1.5 text-stone-400" />
                          Currently in Read-Only Mode. Enable 'Edit' in the header to modify specifications.
                        </div>
                      ) : null}
                    </div>
                  </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto bg-stone-100 p-2 sm:p-4">
                      <InlineBEOReport booking={booking} activeEvent={activeEvent} />
                    </div>
                  )}

                  </div>
                </div>

              </div>

              {/* Full Banquet Event Order (BEO) preview Modal overlay */}
              {isBEOOpen && (
                <BEOReport
                  booking={booking}
                  eventsOnDate={events.filter(e => selectedDateFilter === "ALL" ? e.date === activeEvent.date : e.date === selectedDateFilter)}
                  selectedDate={selectedDateFilter === "ALL" ? activeEvent.date : selectedDateFilter}
                  onClose={() => setIsBEOOpen(false)}
                />
              )}

              {/* ===================== COMPARISON DIFF MODAL ===================== */}
              {isSubmitModalOpen && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="diff-modal-overlay">
                  <div className="bg-white rounded-lg max-w-3xl w-full p-6 bardo-shadow-lg text-stone-900 space-y-6" id="submit-comparison-card">
                    
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-amber-800" />
                        <h3 className="font-serif text-lg font-semibold text-stone-905">Banquet Orders Comparison (Audit Diff)</h3>
                      </div>
                      <button
                        onClick={() => setIsSubmitModalOpen(false)}
                        className="p-1 text-stone-400 hover:text-stone-600 rounded hover:bg-stone-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs text-stone-600">
                        Please review the final requirements changes before submitting your final specifications catalog. Removed items will be strikethrough in red, and new items are highlighted in green.
                      </p>

                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 max-h-[35vh] overflow-y-auto space-y-4">
                        {eventDiffs.length > 0 ? (
                          eventDiffs.map((diff) => (
                            <div key={diff.id} className="space-y-2">
                              <span className="text-xs font-bold font-serif text-stone-950 block border-b border-stone-200 pb-1 uppercase">
                                {diff.eventName} &bull; {formatFriendlyDate(diff.date)}
                              </span>
                              <div className="divide-y divide-stone-100">
                                {diff.changes.map((change, idx) => (
                                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-4">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] bg-stone-200 uppercase font-bold text-stone-600 px-1.5 rounded font-mono mr-2">
                                        {change.category}
                                      </span>
                                      <span className={`text-sm font-medium ${
                                        change.action === "removed" ? "line-through text-red-650" : "text-stone-800"
                                      }`}>
                                        {change.name}
                                      </span>
                                    </div>

                                    <div className="shrink-0 text-right">
                                      {change.action === "added" && (
                                        <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded font-semibold">
                                          + {change.newVal}
                                        </span>
                                      )}
                                      {change.action === "removed" && (
                                        <span className="text-xs text-red-700 bg-red-50 border border-red-250/50 px-2 py-0.5 rounded font-semibold line-through">
                                          - {change.oldVal}
                                        </span>
                                      )}
                                      {change.action === "modified" && (
                                        <span className="text-xs text-amber-800 bg-amber-50 border border-amber-250/50 px-2 py-0.5 rounded font-medium">
                                          Modified: {change.oldVal} &rarr; <span className="font-bold underline">{change.newVal}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-stone-500 italic text-xs">
                            No draft modifications detected. Everything matches your original contracted specifications portfolio.
                          </div>
                        )}
                      </div>

                      {/* Cutoff check terms */}
                      <div className="space-y-2 text-xs pt-2">
                        <label className="flex items-start gap-2.5 cursor-pointer leading-tight font-medium text-stone-800">
                          <input
                            type="checkbox"
                            required
                            defaultChecked={cutoffLocked}
                            className="mt-0.5"
                            id="cutoff-confirm-checkbox"
                          />
                          <span>
                            I confirm and authorized that these selections reflect the definitive Banquet Event Orders program.
                            {cutoffLocked && (
                              <span className="text-red-705 block font-bold mt-1">
                                Notice: Submission is past the F&B cutoff date and will require CS Coordinator Larissa's override!
                              </span>
                            )}
                          </span>
                        </label>
                      </div>

                      {/* Coordinator notes */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Additional submission notes to Larissa:</label>
                        <textarea
                          placeholder="Provide rooming layouts, dietary allergies setup information, or specific vendor dispatch timings..."
                          className="w-full bg-stone-50 focus:bg-white border border-stone-250 p-2.5 text-xs rounded focus:outline-none focus:border-amber-700/60 max-h-20"
                          id="submit-notes-area"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-stone-150 pt-4">
                      <button
                        onClick={() => setIsSubmitModalOpen(false)}
                        className="px-4 py-2 border border-stone-200 bg-white hover:bg-stone-50 text-stone-605 text-xs font-semibold rounded"
                        id="abort-submit-btn"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setIsSubmitModalOpen(false);
                          setCurrentView("locked");
                        }}
                        className="px-5 py-2.5 bg-stone-950 text-amber-300 hover:bg-stone-850 text-xs font-bold rounded shadow-sm cursor-pointer"
                        id="authorize-submit-final"
                      >
                        Authorize & Lock Submission
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* ==================== 4. FINAL PACKAGE / LOCKED STATE ==================== */}
          {currentView === "locked" && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row min-h-[calc(100vh-250px)]"
              id="submitted-locked-view"
            >
              {!cutoffLocked ? (
                // PRE-SUBMISSION STATE (Final Review)
                <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl -mb-20 -ml-20 pointer-events-none"></div>

                  <div className="relative z-10 space-y-4 max-w-xl">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-xs font-bold uppercase tracking-widest text-blue-600 shadow-sm border border-blue-100">
                      Review Changes & Commit
                    </span>
                    <h3 className="font-sans text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Ready to lock in specifications?</h3>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium mt-4">
                      Please generate and review your Draft BEO. Once you are confident with your event choices, submit the final package for processing.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center mt-12 w-full max-w-xl">
                    <button
                      onClick={() => setIsBEOOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-sm transition-all shadow-sm cursor-pointer"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-blue-500 shrink-0" />
                      Preview Draft BEO
                    </button>
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                      id="draft-submit-final-btn"
                    >
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      Submit Final Setup
                    </button>
                  </div>
                </div>
              ) : (
                // SUCCESS SUBMITTED STATE
                <div className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-blue-50/50 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -mb-20 -ml-20 pointer-events-none"></div>
                  
                  <div className="relative z-10 w-24 h-24 bg-white/80 backdrop-blur-sm text-emerald-500 border border-emerald-100 rounded-full mx-auto flex items-center justify-center shadow-lg mb-8">
                    <Check className="w-12 h-12 font-bold" />
                  </div>

                  <div className="relative z-10 space-y-4 max-w-lg">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white text-xs font-bold uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100">
                      ConfServ Success Confirmation
                    </span>
                    <h3 className="font-sans text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Specifications Locked & Submitted!</h3>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium mt-4">
                      Thank you! Your catering menus, spirits packages, and AV specifications for <span className="font-bold text-blue-600">{booking.title}</span> are securely transmitted.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center mt-12 w-full max-w-md">
                    <button
                      onClick={() => setIsBEOOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-200 shrink-0" />
                      Review BEO Document
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView("workspace");
                        setCutoffLocked(true);
                        setIsBEOOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-red-500 shrink-0" />
                      Read-Only Workspace
                    </button>
                  </div>
                </div>
              )}

              {/* Right Side: Next Steps (Visible in both states) */}
              <div className="w-full md:w-[40%] xl:w-[35%] bg-slate-50 border-l border-slate-200 p-8 md:p-12 flex flex-col justify-center">
                <h4 className="font-sans text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  What Happens Next?
                </h4>
                <div className="space-y-8">
                  <div className="flex gap-4 items-start">
                    <span className="font-mono text-sm font-black text-emerald-700 bg-emerald-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">1</span>
                    <div className="space-y-1">
                      <span className="text-base font-bold text-stone-800 block">Automatic Notification</span>
                      <p className="text-sm text-stone-500 leading-relaxed">Larissa Szynski receives an alert to review and authorize standard pricing items on our central database.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="font-mono text-sm font-black text-emerald-700 bg-emerald-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">2</span>
                    <div className="space-y-1">
                      <span className="text-base font-bold text-stone-800 block">Pricing Worksheet</span>
                      <p className="text-sm text-stone-500 leading-relaxed">Your master account estimate worksheet is dynamically generated within 24 hours.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="font-mono text-sm font-black text-emerald-700 bg-emerald-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">3</span>
                    <div className="space-y-1">
                      <span className="text-base font-bold text-stone-800 block">Guarantees Freeze</span>
                      <p className="text-sm text-stone-500 leading-relaxed">Attendance locks 72 hours prior. If you require critical changes, message Larissa directly.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BEO Report modal integration if client opens of success */}
              {isBEOOpen && (
                <BEOReport
                  booking={booking}
                  eventsOnDate={events.filter(e => e.date === activeEvent.date)}
                  selectedDate={activeEvent.date}
                  onClose={() => setIsBEOOpen(false)}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Composer Modal */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white p-0 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {composerType === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                  {composerType === 'chat' && <MessageSquare className="w-5 h-5 text-indigo-600" />}
                  {composerType === 'sms' && <Smartphone className="w-5 h-5 text-fuchsia-600" />}
                  {composerType === 'ticket' && <Ticket className="w-5 h-5 text-amber-600" />}
                  <h3 className="text-lg font-bold text-slate-800">
                    {composerType === 'email' && "Compose Email"}
                    {composerType === 'chat' && "New Portal Message"}
                    {composerType === 'sms' && "Send SMS"}
                    {composerType === 'ticket' && "Raise Support Ticket"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {composerType === 'email' && (
                  <>
                    <input type="text" placeholder="To: customer@example.com" className="w-full bg-slate-50 border border-slate-200 py-2 px-4 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    <input type="text" placeholder="Subject" className="w-full bg-slate-50 border border-slate-200 py-2 px-4 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </>
                )}
                {composerType === 'ticket' && (
                  <input type="text" placeholder="Issue Title" className="w-full bg-slate-50 border border-slate-200 py-2 px-4 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                )}
                
                <textarea 
                  rows={6}
                  placeholder={
                    composerType === 'email' ? "Write your email message..." :
                    composerType === 'sms' ? "Text message content..." :
                    composerType === 'ticket' ? "Describe the support inquiry..." :
                    "Message the coordinator..."
                  }
                  className={`w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-lg text-sm focus:outline-none resize-none ${
                    composerType === 'email' ? 'focus:border-blue-500' :
                    composerType === 'sms' ? 'focus:border-fuchsia-500' :
                    composerType === 'ticket' ? 'focus:border-amber-500' :
                    'focus:border-indigo-500'
                  }`}
                ></textarea>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsComposerOpen(false)}
                  className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors cursor-pointer ${
                    composerType === 'email' ? 'bg-blue-600 hover:bg-blue-700' :
                    composerType === 'sms' ? 'bg-fuchsia-600 hover:bg-fuchsia-700' :
                    composerType === 'ticket' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {composerType === 'ticket' ? 'Submit Ticket' : 'Send'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat/Inbox Button */}
      {!isChatWidgetOpen && (
        <button
          onClick={() => setIsChatWidgetOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 z-40 border-4 border-white"
          id="open-floating-chat-btn"
        >
          <div className="relative">
             <MessageSquare className="w-6 h-6" />
             <span className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-slate-900" />
          </div>
        </button>
      )}

      {/* Floating / Pop-up Communications Panel */}
      <AnimatePresence>
        {isChatWidgetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[90vw] md:w-[800px] bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 flex flex-col md:flex-row overflow-hidden h-[80vh] md:h-[600px] resize min-w-[320px] min-h-[400px] max-w-[95vw] max-h-[90vh]"
            id="communications-popup"
          >
              {/* Sidebar (Message List) */}
              <div className="w-full md:w-[320px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-sans text-lg font-bold text-slate-800 tracking-tight">Inbox & Support</h3>
                  <button onClick={() => setIsChatWidgetOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-3 bg-white border-b border-slate-200">
                  <div className="relative">
                    <input type="text" placeholder="Search entries..." className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 pl-3 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {/* AI Assistant Item */}
                  <div 
                    onClick={() => setActiveChatContext("ai")}
                    className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${activeChatContext === "ai" ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-slate-100 border-l-4 border-l-transparent"}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-slate-800">AI Event Assistant</span>
                      <span className="text-xs text-slate-500 font-mono">Online</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Bot className={`w-3.5 h-3.5 ${activeChatContext === "ai" ? "text-blue-600" : "text-emerald-600"}`} />
                      <span className={`text-xs font-semibold ${activeChatContext === "ai" ? "text-blue-600" : "text-emerald-600"}`}>24/7 AI Support</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">"Hi! I am your AI assistant for Hotel Bardo Savannah..."</p>
                  </div>

                  {/* Selected Item / Coordinator Item */}
                  <div 
                    onClick={() => setActiveChatContext("coordinator")}
                    className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${activeChatContext === "coordinator" ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-slate-100 border-l-4 border-l-transparent"}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-slate-800">Coordinator (Portal Message)</span>
                      <span className="text-xs text-slate-500 font-mono">2:45 PM</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className={`w-3.5 h-3.5 ${activeChatContext === "coordinator" ? "text-blue-600" : "text-slate-500"}`} />
                      <span className={`text-xs font-semibold ${activeChatContext === "coordinator" ? "text-blue-600" : "text-slate-500"}`}>Chat</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">"Hi! I see you updated the AV numbers. Should I resend the updated quote for your review?"</p>
                  </div>
                  
                  {/* Item */}
                  <div className="p-4 border-b border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors border-l-4 border-l-transparent">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-slate-800">Booking Confirmation</span>
                      <span className="text-xs text-slate-500 font-mono">Yesterday</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-500">Email</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">"Thanks for the update. We will finalize the requirements by tomorrow morning."</p>
                  </div>

                  {/* Item */}
                  <div className="p-4 border-b border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors border-l-4 border-l-transparent">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-slate-800">Support Ticket #8492</span>
                      <span className="text-xs text-slate-500 font-mono">Yesterday</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Ticket className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-600">Pending</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">Review link recovery request</p>
                  </div>
                </div>

                {/* Bottom Actions Compose */}
                <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setComposerType("email"); setIsComposerOpen(true); }}
                    className="flex w-full justify-center items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold text-blue-700 shadow-sm transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button 
                    onClick={() => { setComposerType("ticket"); setIsComposerOpen(true); }}
                    className="flex w-full justify-center items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 shadow-sm transition-colors cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" /> Ticket
                  </button>
                </div>
              </div>

              {/* Main Panel (Thread View) */}
              <div className="hidden md:flex flex-1 bg-white flex-col h-full relative">
                 <button onClick={() => setIsChatWidgetOpen(false)} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm border border-slate-200"><X className="w-5 h-5"/></button>
                
                {/* Thread Header */}
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between shrink-0">
                  <div className="pr-12">
                    <h2 className="text-lg font-bold text-slate-800 leading-snug">
                       {activeChatContext === "coordinator" ? "Coordinator Chat" : "AI Event Assistant"}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5">
                       {activeChatContext === "coordinator" ? (
                         <>
                           <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-indigo-200">LS</div>
                           <span className="text-xs text-slate-500"><strong>Larissa Szynski</strong> - Online</span>
                         </>
                       ) : (
                         <>
                           <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200"><Bot className="w-3.5 h-3.5" /></div>
                           <span className="text-xs text-slate-500"><strong>AI Assistant</strong> - Always Online</span>
                         </>
                       )}
                    </div>
                  </div>
                </div>

                {/* Thread Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                   {activeChatContext === "coordinator" ? (
                      <>
                         {chatMessages.map((msg) => {
                           const isLarissa = msg.sender.includes("Larissa");
                           return (
                             <div
                               key={msg.id}
                               className={`flex flex-col gap-1 max-w-[85%] ${isLarissa ? "self-start" : "self-end items-end text-right ml-auto"}`}
                             >
                               <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                 <span className="font-semibold text-slate-600">{msg.sender}</span>
                                 <span>{msg.timestamp}</span>
                               </div>
                               <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                                 isLarissa 
                                   ? "bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-sm" 
                                   : "bg-indigo-600 border-indigo-600 text-white rounded-tr-none text-left shadow-sm"
                               }`}>
                                 {msg.text}
                               </div>
                             </div>
                           );
                         })}
                         {isChatTyping && (
                           <div className="text-slate-400 italic text-xs animate-pulse flex items-center gap-2 py-2">
                             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                             <span>Larissa is typing...</span>
                           </div>
                         )}
                      </>
                   ) : (
                      <>
                         {aiChatMessages.map((msg, i) => {
                           const isAi = msg.role === "ai";
                           return (
                             <div
                               key={i}
                               className={`flex flex-col gap-1 max-w-[85%] ${isAi ? "self-start" : "self-end items-end text-right ml-auto"}`}
                             >
                               <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                 <span className="font-semibold text-slate-600">{isAi ? "AI Assistant" : booking.contactName}</span>
                                 <span>Just now</span>
                               </div>
                               <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                                 isAi 
                                   ? "bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-sm" 
                                   : "bg-blue-600 border-blue-600 text-white rounded-tr-none text-left shadow-sm"
                               }`}>
                                 {msg.text}
                               </div>
                             </div>
                           );
                         })}
                         {isChatTyping && (
                           <div className="text-slate-400 italic text-xs animate-pulse flex items-center gap-2 py-2">
                             <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                             <span>AI is thinking...</span>
                           </div>
                         )}
                      </>
                   )}
                </div>
                
                {/* Chat Input Inline */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                  <form onSubmit={handleSendChatMessage} className="flex gap-2 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={activeChatContext === "coordinator" ? "Reply to Larissa in portal..." : "Ask AI planner..."}
                      className={`flex-1 bg-slate-50 border border-slate-200 py-3 pl-4 pr-12 text-sm rounded-xl focus:outline-none focus:bg-white transition-colors ${activeChatContext === "coordinator" ? "focus:border-indigo-500" : "focus:border-blue-500"}`}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatTyping}
                      className={`absolute right-2 top-2 w-8 h-8 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors shadow-sm shrink-0 ${activeChatContext === "coordinator" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      <Send className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </form>
                </div>
                
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate footer info */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400 font-mono mt-8 print:hidden">
        <p>&copy; 2026 {booking.propertyName} &bull; All Rights Reserved.</p>
        <p className="text-[10px] text-stone-400 mt-1">ConfServ Event Workspace Customer Portal &bull; Secure link validated</p>
      </footer>

    </div>
  );
}
