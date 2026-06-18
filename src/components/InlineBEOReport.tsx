import React from "react";
import { Booking, BardoEvent } from "../types";

interface InlineBEOReportProps {
  booking: Booking;
  activeEvent: BardoEvent;
}

export default function InlineBEOReport({ booking, activeEvent }: InlineBEOReportProps) {
  const formatDateHeader = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const calculateSectionTotal = (category: keyof BardoEvent["requirements"]) => {
    const items = activeEvent.requirements[category];
    return items.reduce((sum, item) => sum + (Number(item.quantity || 0) * item.unitPrice), 0);
  };

  const subtotal = calculateSectionTotal("food") + calculateSectionTotal("beverage") + calculateSectionTotal("setup") + calculateSectionTotal("av") + calculateSectionTotal("other");

  return (
    <div className="bg-white rounded-xl shadow-md mx-auto p-8 sm:p-12 h-full min-h-[800px] text-[11px] leading-normal font-sans text-stone-950 border border-stone-200 overflow-y-auto">
      {/* Elegant Header Block */}
      <div className="text-center space-y-1 mb-8">
        <h1 className="font-serif text-2xl tracking-widest text-stone-950 font-bold uppercase">HOTEL BARDO SAVANNAH</h1>
        <p className="text-[10px] text-stone-600 tracking-wide font-sans">
          700 Drayton Street, Savannah, Georgia 31401-5803 • Phone: (912) 238-5158
        </p>
        <div className="h-px bg-stone-300 w-1/3 mx-auto my-3" />
        <h2 className="text-sm font-bold uppercase text-stone-900 tracking-wider">Banquet Event Order Preview</h2>
        <div className="flex justify-between text-[9px] text-stone-500 font-mono mt-1 px-2">
          <span>Ref Number: BEO-2027-{activeEvent.date.replace(/-/g, "")}</span>
          <span>Date Printed: {new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      {/* Event Setup Metadata Section Grid */}
      <div className="grid grid-cols-2 gap-x-6 border border-stone-950 text-stone-950 mb-6">
        {/* Left Column info */}
        <div className="divide-y divide-stone-300">
          <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
            <span className="font-bold text-[10px] uppercase">Post As:</span>
            <span className="col-span-2 font-medium">{booking.title}</span>
          </div>
          <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
            <span className="font-bold text-[10px] uppercase">Account:</span>
            <span className="col-span-2">{booking.account}</span>
          </div>
          <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
            <span className="font-bold text-[10px] uppercase">Contact:</span>
            <span className="col-span-2 font-medium">{booking.contactName}</span>
          </div>
        </div>

        {/* Right Column info */}
        <div className="divide-y divide-stone-300 border-l border-stone-950">
          <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
            <span className="font-bold text-[10px] uppercase">Event Date:</span>
            <span className="col-span-2 font-bold text-amber-900">{formatDateHeader(activeEvent.date)}</span>
          </div>
          <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
            <span className="font-bold text-[10px] uppercase">Event Time:</span>
            <span className="col-span-2 font-mono">{activeEvent.startTime} - {activeEvent.endTime}</span>
          </div>
          <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
            <span className="font-bold text-[10px] uppercase">Service Manager:</span>
            <span className="col-span-2 font-medium">{booking.serviceManager}</span>
          </div>
        </div>
      </div>

      {/* General Timetable Outline */}
      <div className="mb-6">
        <span className="font-bold text-[10px] uppercase tracking-wider block mb-2 bg-stone-900 text-white py-1 px-2.5">Specific Event Layout details</span>
        <table className="w-full border-collapse border border-stone-950 text-left text-[10px]">
          <thead>
            <tr className="bg-stone-100 font-bold border-b border-stone-950">
              <th className="p-2 border-r border-stone-400">Function</th>
              <th className="p-2 border-r border-stone-400">Room</th>
              <th className="p-2 border-r border-stone-400">Setup</th>
              <th className="p-2 border-r border-stone-400 text-center">Expected</th>
              <th className="p-2 border-r border-stone-400 text-center">Gtd</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-300 border-b border-stone-950">
            <tr className="hover:bg-amber-50/20">
              <td className="p-2 border-r border-stone-300 font-semibold text-stone-950">{activeEvent.name}</td>
              <td className="p-2 border-r border-stone-300">{activeEvent.room}</td>
              <td className="p-2 border-r border-stone-300 uppercase font-mono text-[9px]">{activeEvent.setupStyle}</td>
              <td className="p-2 border-r border-stone-300 text-center">{activeEvent.expectedAttendance}</td>
              <td className="p-2 border-r border-stone-300 text-center font-bold text-stone-800">{activeEvent.guaranteedAttendance}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Split specifications columns identical to the BEO image */}
      <div className="grid grid-cols-2 gap-4 border border-stone-950 divide-x divide-stone-950 mb-6">
        {/* Left specifications block: AudioVisual & Setup specifics */}
        <div className="p-3 space-y-4">
          <div>
            <h4 className="font-serif text-[11pt] font-semibold text-stone-900 border-b border-stone-400 pb-1 uppercase tracking-wide">AudioVisual Requirements</h4>
            <ul className="divide-y divide-stone-200 text-[10px] mt-2">
              {activeEvent.requirements.av.length > 0 && (
                <li className="py-2">
                  <div className="space-y-1.5 mt-1 font-mono text-[9px]">
                    {activeEvent.requirements.av.map((avItem) => (
                      <div key={avItem.id} className="flex justify-between pl-2">
                        <span>{avItem.name} {avItem.quantity ? `(Qty: ${avItem.quantity})` : ""}</span>
                        <span className="font-medium">${(Number(avItem.quantity || 1) * avItem.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </li>
              )}
              {activeEvent.requirements.av.length === 0 && (
                <div className="p-2 text-stone-500 italic">No custom outside AV requests configured. Standard setup applies.</div>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[11pt] font-semibold text-stone-900 border-b border-stone-400 pb-1 uppercase tracking-wide">Room Setup, Linens & Design</h4>
            <ul className="divide-y divide-stone-200 text-[10px] mt-2">
              {activeEvent.requirements.setup.length > 0 && (
                <li className="py-2">
                  <div className="space-y-1.5 mt-1 text-[9px]">
                    {activeEvent.requirements.setup.map((setupItem) => (
                      <div key={setupItem.id} className="flex justify-between pl-2 text-stone-700">
                        <span>• {setupItem.name} {setupItem.quantity ? `(Qty: ${setupItem.quantity})` : ""}</span>
                        {setupItem.unitPrice > 0 && (
                          <span className="font-mono text-[8.5px]">${(Number(setupItem.quantity || 1) * setupItem.unitPrice).toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </li>
              )}
              {activeEvent.requirements.setup.length === 0 && (
                <div className="p-2 text-stone-500 italic">No custom room setups or linens.</div>
              )}
            </ul>
          </div>
        </div>

        {/* Right specifications block: Beverage & Food specifications */}
        <div className="p-3 space-y-4">
          <div>
            <h4 className="font-serif text-[11pt] font-semibold text-stone-900 border-b border-stone-400 pb-1 uppercase tracking-wide font-bold">Beverage Operations</h4>
            <ul className="divide-y divide-stone-200 text-[10px] mt-2">
              {activeEvent.requirements.beverage.length > 0 && (
                <li className="py-2">
                  <div className="space-y-2 mt-1.5 text-[9px]">
                    {activeEvent.requirements.beverage.map((bevItem) => (
                      <div key={bevItem.id} className="pl-2">
                        <div className="flex justify-between font-mono">
                          <span className="font-bold text-stone-900">{bevItem.name}</span>
                          <span>{bevItem.quantity ? `Qty: ${bevItem.quantity} @ ` : ""}${bevItem.unitPrice.toFixed(2)}</span>
                        </div>
                        {bevItem.description && (
                          <p className="text-stone-500 italic text-[8.5px] pl-1.5 mt-0.5">{bevItem.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </li>
              )}
              {activeEvent.requirements.beverage.length === 0 && (
                <div className="p-2 text-stone-500 italic">No beverage packages or custom hosts spirits configured.</div>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[11pt] font-semibold text-stone-900 border-b border-stone-400 pb-1 uppercase tracking-wide">Catering (Food) Programs</h4>
            <ul className="divide-y divide-stone-200 text-[10px] mt-2">
              {activeEvent.requirements.food.length > 0 && (
                <li className="py-2">
                  <div className="space-y-2 mt-1.5 text-[9px]">
                    {activeEvent.requirements.food.map((foodItem) => (
                      <div key={foodItem.id} className="pl-2">
                        <div className="flex justify-between font-mono">
                          <span className="font-bold text-stone-900">{foodItem.name}</span>
                          <span>{foodItem.quantity ? `Qty: ${foodItem.quantity} @ ` : ""}${foodItem.unitPrice.toFixed(2)}</span>
                        </div>
                        {foodItem.description && (
                          <p className="text-stone-500 italic text-[8.5px] pl-1.5 mt-0.5">{foodItem.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </li>
              )}
              {activeEvent.requirements.food.length === 0 && (
                <div className="p-2 text-stone-500 italic">No custom catering selections configured as of this moment.</div>
              )}
            </ul>
          </div>
        </div>
      </div>
      
       {/* Terms and Financial totals print block */}
        <div className="border border-stone-900 p-3 bg-stone-50 text-[10px] space-y-2">
          <div className="flex justify-between items-center font-bold text-stone-900 border-b border-stone-300 pb-2 mb-2 uppercase">
            <span>Estimated Section Subtotal</span>
            <span className="font-mono text-sm text-stone-950">Grand Est. Subtotal: ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
    </div>
  );
}
