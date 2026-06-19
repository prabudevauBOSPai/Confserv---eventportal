import React, { useState, useMemo } from 'react';
import { BardoEvent, LineItem } from '../types';
import { Check, X, Search, Plus, ChevronDown, Circle, AlertCircle, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';
import SourceDocumentPanel from './SourceDocumentPanel';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

interface FlattenedItem {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  category: "food" | "beverage" | "setup" | "av" | "other";
  item: LineItem;
  confidence: number;
  status: "Auto match" | "Needs review" | "Manual";
}

interface AdvancedReviewViewProps {
  events: BardoEvent[];
  setEvents: React.Dispatch<React.SetStateAction<BardoEvent[]>>;
  sourceName: string;
  reviewedItemIds: Set<string>;
  setReviewedItemIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function AdvancedReviewView({
  events,
  setEvents,
  sourceName,
  reviewedItemIds,
  setReviewedItemIds
}: AdvancedReviewViewProps) {
  // Flatten events into items
  const allItems = useMemo(() => {
    const flat: FlattenedItem[] = [];
    events.forEach(evt => {
      (["food", "beverage", "setup", "av", "other"] as const).forEach(cat => {
        evt.requirements[cat].forEach(item => {
          // Fake confidence & status for demo
          const confidence = item.name.length % 2 === 0 ? 94 : 62;
          const status = confidence > 80 ? "Auto match" : "Needs review";
          
          flat.push({
            id: item.id,
            eventId: evt.id,
            eventName: evt.name,
            eventDate: evt.date,
            category: cat,
            item: item,
            confidence,
            status: item.id.includes("custom") ? "Manual" : status
          });
        });
      });
    });
    return flat;
  }, [events]);

  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("ALL");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  
  // Right panel Source View
  const [panelSearchQuery, setPanelSearchQuery] = useState("");
  const [selectedDocEventId, setSelectedDocEventId] = useState("");
  
  const [maximizedPanel, setMaximizedPanel] = useState<'table' | 'source' | null>(null);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchEvent = selectedEventFilter === "ALL" || item.eventId === selectedEventFilter;
      const matchSearch = item.item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter || (statusFilter === "Auto match" && item.status === "Auto match");
      return matchEvent && matchSearch && matchStatus;
    });
  }, [allItems, selectedEventFilter, searchQuery, statusFilter]);

  const displayedEvents = useMemo(() => {
    if (!eventSearchQuery) return events;
    return events.filter(e => e.name.toLowerCase().includes(eventSearchQuery.toLowerCase()));
  }, [events, eventSearchQuery]);

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewedItemIds(prev => new Set(prev).add(id));
  };

  const handleReject = (eventId: string, category: string, itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(prevEvents => prevEvents.map(evt => {
      if (evt.id !== eventId) return evt;
      const catKey = category as keyof typeof evt.requirements;
      return {
        ...evt,
        requirements: {
          ...evt.requirements,
          [catKey]: evt.requirements[catKey].filter(i => i.id !== itemId)
        }
      };
    }));
    setReviewedItemIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "food": return "Food & Beverage";
      case "beverage": return "Food & Beverage";
      case "setup": return "Room Setup";
      case "av": return "Audio Visual";
      default: return "Other";
    }
  };

  return (
    <div className="flex flex-col h-[85vh] min-h-[750px] bg-slate-50 w-full overflow-hidden border border-stone-200 rounded-xl shadow-md">
      
      {/* Event Filter & Search Bar */}
      <div className="bg-white border-b border-stone-200 flex items-stretch h-12 overflow-hidden shrink-0">
        <div className="flex items-center px-4 border-r border-stone-200 bg-stone-50 shrink-0 w-64">
           <Search className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
           <input 
             type="text" 
             placeholder="Search events..." 
             value={eventSearchQuery}
             onChange={(e) => setEventSearchQuery(e.target.value)}
             className="w-full text-xs bg-transparent focus:outline-none text-stone-600 placeholder-stone-400"
           />
        </div>
        <div className="flex items-center gap-2 px-4 overflow-x-auto hide-scrollbar flex-1">
          <button 
            onClick={() => setSelectedEventFilter("ALL")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${selectedEventFilter === "ALL" ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200 shadow-inner'}`}
          >
            All events
            <span className="bg-white/50 px-1.5 py-0.5 rounded text-[10px]">{reviewedItemIds.size}/{allItems.length}</span>
          </button>

          {displayedEvents.map((evt) => {
            const evtItems = allItems.filter(i => i.eventId === evt.id);
            const evtReviewed = evtItems.filter(i => reviewedItemIds.has(i.id)).length;
            
            return (
              <button 
                key={evt.id}
                onClick={() => setSelectedEventFilter(evt.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${selectedEventFilter === evt.id ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200 shadow-inner'}`}
              >
                <div className={`w-2 h-2 rounded-full ${evtReviewed === evtItems.length && evtItems.length > 0 ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                {evt.name}
                <span className="text-stone-400 text-[10px]">· {evt.date}</span>
                <span className="bg-white/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-stone-600">{evtReviewed}/{evtItems.length}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup orientation="horizontal" id="bardo-resizable-panels">
          {/* Left Column: Items Table */}
          {maximizedPanel !== 'source' && (
          <Panel id="table-panel" order={1} defaultSize={65} minSize={30}>
            <div className="h-full flex flex-col min-w-0 bg-white border-r border-stone-200 relative">
            
              {/* Table Toolbar */}
              <div className="p-2 border-b border-stone-200 flex items-center justify-between shrink-0 bg-stone-50 overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-2">
                  <div className="relative w-40 lg:w-56 shrink-0">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input 
                      type="text" 
                      placeholder="Search items..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                    />
                  </div>
    
                  <div className="h-4 w-px bg-stone-300 mx-1 shrink-0" />
    
                  <div className="flex gap-0.5 shrink-0">
                    {[{label: "All", value: "All"}, {label: "match", value: "Auto match"}, {label: "review", value: "Needs review"}, {label: "Manual", value: "Manual"}].map((f) => (
                      <button 
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${statusFilter === f.value ? 'bg-white text-blue-700 shadow-sm border border-stone-200' : 'text-stone-600 hover:bg-stone-200/50 border border-transparent'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
    
                <div className="flex items-center gap-2 shrink-0 ml-4">
                   <button 
                     onClick={() => setMaximizedPanel(maximizedPanel === 'table' ? null : 'table')}
                     className="flex items-center gap-1.5 px-2 py-1.5 bg-stone-100 border border-stone-200 text-stone-600 rounded shadow-sm hover:bg-stone-200 transition-colors cursor-pointer mr-1 shrink-0"
                     title={maximizedPanel === 'table' ? 'Restore Split View' : 'Maximize Table'}
                   >
                     {maximizedPanel === 'table' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                   </button>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-600 text-xs font-medium rounded shadow-sm hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap shrink-0">
                    All sections <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded shadow-sm hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap shrink-0">
                    <Plus className="w-3.5 h-3.5" /> Add item
                  </button>
                </div>
              </div>
    
              {/* Table Content - Excel Style */}
              <div className="flex-1 overflow-auto bg-white" style={{ isolation: 'isolate' }}>
                <table className="w-full text-left border-collapse" style={{ tableLayout: "fixed" }}>
                  <thead className="bg-stone-50 sticky top-0 border-b border-stone-300 z-10">
                    <tr className="select-none">
                      <th className="p-1 px-2 text-center border-r border-stone-200 align-middle" style={{ width: '100px' }}>
                        <button className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap overflow-hidden">
                          <Check className="w-3.5 h-3.5 shrink-0" /> Confirm {filteredItems.filter(i => !reviewedItemIds.has(i.id)).length}
                        </button>
                      </th>
                      <th className="p-0 border-r border-stone-200" style={{ width: '40%' }}>
                        <div className="flex items-center w-full h-full p-2 resize-x overflow-hidden min-w-[150px]">
                          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Item</span>
                        </div>
                      </th>
                      <th className="p-0 border-r border-stone-200" style={{ width: '32%' }}>
                        <div className="flex items-center w-full h-full p-2 resize-x overflow-hidden min-w-[100px]">
                          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Event</span>
                        </div>
                      </th>
                      <th className="p-0 border-r border-stone-200" style={{ width: '12%' }}>
                        <div className="flex items-center w-full h-full p-2 resize-x overflow-hidden min-w-[70px]">
                          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Section</span>
                        </div>
                      </th>
                      <th className="p-0 border-r border-stone-200" style={{ width: '8%' }}>
                        <div className="flex items-center w-full h-full p-2 resize-x overflow-hidden min-w-[40px]">
                          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Qty</span>
                        </div>
                      </th>
                      <th className="p-0" style={{ width: '8%' }}>
                        <div className="flex items-center w-full h-full p-2 resize-x overflow-hidden min-w-[50px]">
                          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Price</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 leading-tight">
                    {filteredItems.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedDocEventId(item.eventId)}
                        className={`transition-colors group hover:bg-blue-50/50 cursor-pointer ${reviewedItemIds.has(item.id) ? 'bg-stone-50/50' : 'bg-white'}`}
                      >
                        <td className="p-2 text-center border-r border-stone-200">
                          <div className="flex items-center justify-between gap-1 w-full">
                            <input 
                              type="checkbox" 
                              checked={selectedItemIds.has(item.id)}
                              onChange={(e) => {
                                const next = new Set(selectedItemIds);
                                if (e.target.checked) next.add(item.id);
                                else next.delete(item.id);
                                setSelectedItemIds(next);
                              }}
                              onClick={e => e.stopPropagation()}
                              className="rounded-sm border-stone-300 w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" 
                            />
                            <div className="flex items-center justify-center gap-0.5 opacity-100 transition-opacity">
                              {!reviewedItemIds.has(item.id) && (
                                <>
                                  <button 
                                    onClick={(e) => handleApprove(item.id, e)}
                                    className="p-1 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                    title="Approve"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => handleReject(item.eventId, item.category, item.id, e)}
                                    className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Reject (Delete)"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 border-r border-stone-200 truncate">
                          <div className="flex items-center gap-2">
                            <div className="shrink-0" title={item.status}>
                              {reviewedItemIds.has(item.id) ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : item.status === 'Auto match' ? (
                                <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                              ) : item.status === 'Needs review' ? (
                                <Circle className="w-3 h-3 fill-amber-500 text-amber-500" />
                              ) : (
                                <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                              )}
                            </div>
                            <span className={`text-xs font-medium truncate ${reviewedItemIds.has(item.id) ? 'text-stone-400 line-through' : 'text-slate-900'}`}>{item.item.name}</span>
                          </div>
                        </td>
                        <td className="p-2 border-r border-stone-200 truncate">
                          <span className="text-xs text-stone-600" title={item.eventName}>{item.eventName}</span>
                        </td>
                        <td className="p-2 border-r border-stone-200 truncate">
                           <span className="text-xs text-stone-600">{getCategoryLabel(item.category)}</span>
                        </td>
                        <td className="p-2 border-r border-stone-200">
                          <span className="text-xs text-stone-900 text-right block w-full pr-2">{item.item.quantity || "-"}</span>
                        </td>
                        <td className="p-2">
                          <span className="text-xs text-stone-900 text-right block w-full pr-2">{item.item.unitPrice ? `$${item.item.unitPrice.toFixed(2)}` : "-"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="p-2 border-t border-stone-200 bg-stone-50 flex justify-between items-center text-xs text-stone-500 shrink-0">
                <span>{filteredItems.length} records found</span>
                <span>{reviewedItemIds.size} completed</span>
              </div>
    
            </div>
          </Panel>
          )}

          {maximizedPanel === null && (
            <PanelResizeHandle className="w-1 bg-stone-200 hover:bg-amber-400 active:bg-amber-500 transition-colors cursor-col-resize shrink-0">
              <div className="w-full h-full flex items-center justify-center">
                 <div className="w-0.5 h-8 bg-stone-400 rounded-full" />
              </div>
            </PanelResizeHandle>
          )}
  
          {/* Right Column: Source Document */}
          {maximizedPanel !== 'table' && (
          <Panel id="source-panel" order={2} defaultSize={35} minSize={20}>
            <div className="w-full bg-stone-50 h-full overflow-hidden relative">
              <div className="absolute top-2 right-2 z-20">
                 <button 
                   onClick={() => setMaximizedPanel(maximizedPanel === 'source' ? null : 'source')}
                   className="p-1.5 bg-white border border-stone-200 text-stone-600 rounded shadow-sm hover:bg-stone-50 transition-colors cursor-pointer"
                   title={maximizedPanel === 'source' ? 'Restore Split View' : 'Maximize Document'}
                 >
                   {maximizedPanel === 'source' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                 </button>
              </div>
              <SourceDocumentPanel
                 sourceName={sourceName}
                 searchQuery={panelSearchQuery}
                 setSearchQuery={setPanelSearchQuery}
                 filteredEvents={events} // Pass full events for the SourceDocPanel if needed
                 selectedEventId={selectedDocEventId || events[0]?.id}
                 setSelectedEventId={setSelectedDocEventId}
              />
            </div>
          </Panel>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}

