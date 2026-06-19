import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BardoEvent } from '../types';

interface SourceDocumentPanelProps {
  sourceName: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredEvents: BardoEvent[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
}

export default function SourceDocumentPanel({
  sourceName,
  searchQuery,
  setSearchQuery,
  filteredEvents,
  selectedEventId,
  setSelectedEventId
}: SourceDocumentPanelProps) {
  const [sourceView, setSourceView] = useState<"PDF" | "RAW" | "TABLE">(
    sourceName.toLowerCase().includes(".xls") || sourceName.toLowerCase().includes(".csv") ? "TABLE" : "PDF"
  );

  return (
    <div className={`hidden md:flex flex-col border border-stone-200 rounded-xl overflow-hidden bardo-shadow-lg bg-stone-100 shrink-0 transition-all duration-300 ${sourceView === 'TABLE' ? 'w-[45vw] max-w-[800px]' : 'w-[350px] lg:w-[450px]'} h-full`}>
      <div className="p-2 border-b border-stone-200 bg-stone-50 flex justify-between items-center shrink-0">
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-2">Source Document</span>
        {sourceView === 'TABLE' && (
          <div className="relative w-48 mr-2 lg:mr-4">
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[10px] pl-7 pr-3 py-1 bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors" 
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1 text-stone-400" />
          </div>
        )}
        <div className="flex gap-1 bg-stone-200/50 p-0.5 rounded-md">
           <button onClick={() => setSourceView("PDF")} className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${sourceView === 'PDF' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>PDF</button>
           <button onClick={() => setSourceView("TABLE")} className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${sourceView === 'TABLE' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>TABLE</button>
           <button onClick={() => setSourceView("RAW")} className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${sourceView === 'RAW' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>RAW</button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
         {sourceView === 'TABLE' ? (
            <div className="bg-white shadow-sm border border-stone-200 w-full rounded shrink-0 text-[10px] text-stone-600 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50 border-b border-stone-200 font-sans sticky top-0">
                    <tr>
                       <th className="p-2 font-semibold whitespace-nowrap">Date</th>
                       <th className="p-2 font-semibold whitespace-nowrap">Time</th>
                       <th className="p-2 font-semibold min-w-[150px]">Event Name</th>
                       <th className="p-2 font-semibold min-w-[100px]">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                     {filteredEvents.map(evt => (
                       <tr 
                         key={evt.id}
                         onClick={() => setSelectedEventId(evt.id)}
                         className={`cursor-pointer transition-colors ${selectedEventId === evt.id ? 'bg-amber-100/50 hover:bg-amber-100/70' : 'hover:bg-amber-50/30'}`}
                       >
                         <td className="p-2 whitespace-nowrap">{evt.date}</td>
                         <td className="p-2 whitespace-nowrap">{evt.startTime} - {evt.endTime}</td>
                         <td className={`p-2 font-sans ${selectedEventId === evt.id ? 'font-bold text-amber-900' : 'text-stone-800'}`}>{evt.name}</td>
                         <td className="p-2 text-stone-500">{evt.room || "TBA"}</td>
                       </tr>
                     ))}
                     {filteredEvents.length === 0 && (
                       <tr>
                         <td colSpan={4} className="p-4 text-center text-stone-500 font-sans">No events found matching "{searchQuery}"</td>
                       </tr>
                     )}
                  </tbody>
                </table>
              </div>
            </div>
         ) : sourceView === 'PDF' ? (
           <div className="bg-white shadow-sm border border-stone-200 aspect-[8.5/11] w-full p-6 text-[10px] font-mono text-stone-600 space-y-4">
             <div className="text-center font-bold text-sm mb-8 text-stone-800">AGENDA: LUXE SPRING LAUNCH</div>
             
             <div className="border-b border-stone-200 pb-2 mb-2 font-bold text-stone-800">FRIDAY, MAY 31, 2027</div>
             
             <div className="pl-2 border-l-2 border-amber-200 space-y-1 py-1">
               <p className="font-bold text-stone-800">08:00 AM - 09:00 AM • Staff Meeting</p>
               <p className="text-stone-500">Setup: Conference style. Need whiteboard.</p>
             </div>
             
             <div className="pl-2 border-l-2 border-amber-200 space-y-1 py-1 mt-3 bg-amber-50/50">
               <p className="font-bold text-stone-800">09:00 AM - 10:00 AM • Breakfast Buffet</p>
               <p className="text-stone-500">Location: Grand Ballroom</p>
               <p className="text-stone-500">- Artisanal Charcuterie & Georgia Cheese Board (x100)</p>
               <p className="text-stone-500">- Coffee Station</p>
             </div>
             
             <div className="pl-2 border-l-2 border-amber-200 space-y-1 py-1 mt-3">
               <p className="font-bold text-stone-800">10:00 AM - 11:00 AM • Lunch Buffet</p>
               <p className="text-stone-500">Location: Garden Patio</p>
               <p className="text-stone-500">- Custom sandwiches, iced tea (x50)</p>
             </div>
             
             <div className="pl-2 border-l-2 border-amber-200 space-y-1 py-1 mt-3">
               <p className="font-bold text-stone-800">11:00 AM - 12:00 PM • Plated Dinner Prep</p>
               <p className="text-stone-500">Details TBA</p>
             </div>
           </div>
         ) : (
           <div className="bg-stone-900 rounded p-4 shadow-inner text-stone-300 font-mono text-[10px] whitespace-pre-wrap overflow-auto h-full"> 
{`AGENDA: LUXE SPRING LAUNCH
FRIDAY, MAY 31, 2027

08:00 AM - 09:00 AM
Staff Meeting
Setup: Conference style. Need whiteboard.

09:00 AM - 10:00 AM
Breakfast Buffet
Location: Grand Ballroom
- Artisanal Charcuterie & Georgia Cheese Board (x100)
- Coffee Station

10:00 AM - 11:00 AM
Lunch Buffet
Location: Garden Patio
- Custom sandwiches, iced tea (x50)`}
           </div>
         )}
      </div>
    </div>
  );
}
