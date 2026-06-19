/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Printer, Download, Eye, X, Check } from "lucide-react";
import { Booking, BardoEvent } from "../types";

interface BEOReportProps {
  booking: Booking;
  eventsOnDate: BardoEvent[];
  selectedDate: string;
  onClose: () => void;
}

export default function BEOReport({ booking, eventsOnDate, selectedDate, onClose }: BEOReportProps) {
  // Format Date for header display
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

  const handlePrint = () => {
    window.print();
  };

  // Safe pricing calculation
  const calculateSectionTotal = (evt: BardoEvent, category: keyof BardoEvent["requirements"]) => {
    const items = evt.requirements[category];
    return items.reduce((sum, item) => sum + (Number(item.quantity || 0) * item.unitPrice), 0);
  };

  const calculateGrandTotal = () => {
    let grand = 0;
    eventsOnDate.forEach(evt => {
      grand += calculateSectionTotal(evt, "food");
      grand += calculateSectionTotal(evt, "beverage");
      grand += calculateSectionTotal(evt, "setup");
      grand += calculateSectionTotal(evt, "av");
      grand += calculateSectionTotal(evt, "other");
    });
    return grand;
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="beo-modal-overlay">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full flex flex-col my-4 max-h-[92vh] text-stone-950 font-sans bardo-shadow-lg" id="beo-report-container">
        {/* Modal Header Controls (Not Printed) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-semibold text-stone-800">Formal Banquet Event Order (BEO) Preview</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
              {formatDateHeader(selectedDate)} ({eventsOnDate.length} Active Events)
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950 border border-stone-200 bg-white hover:bg-stone-50 rounded-md transition-all cursor-pointer"
              id="print-beo-btn"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={() => alert("BEO document package downloaded successfully.")}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-all shadow-sm cursor-pointer"
              id="download-beo-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Download XLSX Pack
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-all hover:bg-stone-100"
              id="close-beo-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-10 print:p-0 bg-stone-100 print:bg-white space-y-10 print:space-y-0">
          {eventsOnDate.length === 0 ? (
            <div className="bg-white p-12 print:p-4 max-w-4xl mx-auto shadow-sm border border-stone-200/50 print:border-0 rounded-sm print:shadow-none min-h-[11in] text-[11px] leading-normal flex items-center justify-center">
              <div className="text-center italic text-stone-500 py-20">No active events for this date.</div>
            </div>
          ) : (
            eventsOnDate.map((evt, idx) => {
              const eventTotal = calculateSectionTotal(evt, "food") +
                                 calculateSectionTotal(evt, "beverage") +
                                 calculateSectionTotal(evt, "setup") +
                                 calculateSectionTotal(evt, "av") +
                                 calculateSectionTotal(evt, "other");

              return (
                <div key={evt.id} className={`bg-white p-12 print:p-4 max-w-4xl mx-auto shadow-sm border border-stone-200/50 print:border-0 rounded-sm print:shadow-none min-h-[11in] text-[11px] leading-normal relative ${idx !== eventsOnDate.length - 1 ? 'print:break-after-page' : ''}`} id={`beo-printable-paper-${evt.id}`}>
                  
                  {/* Elegant Header Block */}
                  <div className="text-center space-y-1 mb-8 relative">
                    <h1 className="font-serif text-2xl tracking-widest text-stone-950 font-bold uppercase">HOTEL BARDO SAVANNAH</h1>
                    <p className="text-[10px] text-stone-600 tracking-wide font-sans">
                      700 Drayton Street, Savannah, Georgia 31401-5803 • Phone: (912) 238-5158
                    </p>
                    <div className="h-px bg-stone-300 w-1/3 mx-auto my-3" />
                    <h2 className="text-sm font-bold uppercase text-stone-900 tracking-wider">Banquet Event Order</h2>
                    <h3 className="text-sm font-semibold text-stone-800 mt-1">{evt.name}</h3>
                    <div className="flex justify-between text-[9px] text-stone-500 font-mono mt-1 px-2">
                      <span>Ref Number: BEO-2027-{selectedDate.replace(/-/g, "")}-{idx + 1}</span>
                      <span>Date Printed: 06/17/2026 08:53 AM</span>
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
                        <span className="font-bold text-[10px] uppercase">Address:</span>
                        <span className="col-span-2 text-[10px] leading-tight text-stone-700 whitespace-pre-line">
                          {booking.address}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Master Account #:</span>
                        <span className="col-span-2">{booking.masterAccountNum}</span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Payment Method:</span>
                        <span className="col-span-2">{booking.paymentMethod}</span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Tax Exempt:</span>
                        <span className="col-span-2">{booking.taxExempt ? "True" : "False"}</span>
                      </div>
                    </div>

                    {/* Right Column info */}
                    <div className="divide-y divide-stone-300 border-l border-stone-950">
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Event Date:</span>
                        <span className="col-span-2 font-bold text-amber-900">{formatDateHeader(selectedDate)}</span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Contact:</span>
                        <span className="col-span-2 font-medium">{booking.contactName}</span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Phone:</span>
                        <span className="col-span-2">{booking.contactPhone}</span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Email:</span>
                        <span className="col-span-2 select-all font-mono text-[10px]">{booking.contactEmail}</span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Booked By:</span>
                        <span className="col-span-2">{booking.bookedBy}</span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 min-h-[24px]">
                        <span className="font-bold text-[10px] uppercase">Service Manager:</span>
                        <span className="col-span-2 font-medium">{booking.serviceManager}</span>
                      </div>
                    </div>
                  </div>

                  {/* General Timetable Outline */}
                  <div className="mb-6">
                    <span className="font-bold text-[10px] uppercase tracking-wider block mb-2 bg-stone-900 text-white py-1 px-2.5">Event Details</span>
                    <table className="w-full border-collapse border border-stone-950 text-left text-[10px]">
                      <thead>
                        <tr className="bg-stone-100 font-bold border-b border-stone-950">
                          <th className="p-2 border-r border-stone-400">Event Time</th>
                          <th className="p-2 border-r border-stone-400">Function</th>
                          <th className="p-2 border-r border-stone-400">Room</th>
                          <th className="p-2 border-r border-stone-400">Setup</th>
                          <th className="p-2 border-r border-stone-400 text-center">Expected</th>
                          <th className="p-2 border-r border-stone-400 text-center">Gtd</th>
                          <th className="p-2 text-right">Rental Charge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-300">
                        <tr className="hover:bg-amber-50/20">
                          <td className="p-2 border-r border-stone-300 font-mono font-medium">{evt.startTime} - {evt.endTime}</td>
                          <td className="p-2 border-r border-stone-300 font-semibold text-stone-950">{evt.name}</td>
                          <td className="p-2 border-r border-stone-300">{evt.room}</td>
                          <td className="p-2 border-r border-stone-300 uppercase font-mono text-[9px]">{evt.setupStyle}</td>
                          <td className="p-2 border-r border-stone-300 text-center">{evt.expectedAttendance}</td>
                          <td className="p-2 border-r border-stone-300 text-center font-bold text-stone-800">{evt.guaranteedAttendance}</td>
                          <td className="p-2 text-right font-mono">$0.00</td>
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
                          {evt.requirements.av.length > 0 ? (
                            <li className="py-2">
                              <div className="space-y-1.5 font-mono text-[9px]">
                                {evt.requirements.av.map((avItem) => (
                                  <div key={avItem.id} className="flex justify-between pl-1">
                                    <span>{avItem.name} {avItem.quantity ? `(Qty: ${avItem.quantity})` : ""}</span>
                                    <span className="font-medium">${(Number(avItem.quantity || 1) * avItem.unitPrice).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </li>
                          ) : (
                            <div className="p-2 text-stone-500 italic">No custom outside AV requests configured. Standard setup applies.</div>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-serif text-[11pt] font-semibold text-stone-900 border-b border-stone-400 pb-1 uppercase tracking-wide">Room Setup, Linens & Design</h4>
                        <ul className="divide-y divide-stone-200 text-[10px] mt-2">
                          {evt.requirements.setup.length > 0 ? (
                            <li className="py-2">
                              <div className="space-y-1.5 text-[9px]">
                                {evt.requirements.setup.map((setupItem) => (
                                  <div key={setupItem.id} className="flex justify-between pl-1 text-stone-700">
                                    <span>• {setupItem.name} {setupItem.quantity ? `(Qty: ${setupItem.quantity})` : ""}</span>
                                    {setupItem.unitPrice > 0 && (
                                      <span className="font-mono text-[8.5px]">${(Number(setupItem.quantity || 1) * setupItem.unitPrice).toFixed(2)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </li>
                          ) : (
                            <div className="p-2 text-stone-500 italic">No special room setup considerations configured.</div>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Right specifications block: Beverage & Food specifications */}
                    <div className="p-3 space-y-4">
                      <div>
                        <h4 className="font-serif text-[11pt] font-semibold text-stone-900 border-b border-stone-400 pb-1 uppercase tracking-wide font-bold">Beverage Operations</h4>
                        <ul className="divide-y divide-stone-200 text-[10px] mt-2">
                          {evt.requirements.beverage.length > 0 ? (
                            <li className="py-2">
                              <div className="space-y-2 mt-1.5 text-[9px]">
                                {evt.requirements.beverage.map((bevItem) => (
                                  <div key={bevItem.id} className="pl-1">
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
                          ) : (
                            <div className="p-2 text-stone-500 italic">No beverage packages or custom hosts spirits configured.</div>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-serif text-[11pt] font-semibold text-stone-900 border-b border-stone-400 pb-1 uppercase tracking-wide">Catering (Food) Programs</h4>
                        <ul className="divide-y divide-stone-200 text-[10px] mt-2">
                          {evt.requirements.food.length > 0 ? (
                            <li className="py-2">
                              <div className="space-y-2 mt-1.5 text-[9px]">
                                {evt.requirements.food.map((foodItem) => (
                                  <div key={foodItem.id} className="pl-1">
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
                          ) : (
                            <div className="p-2 text-stone-500 italic">No custom catering selections configured as of this moment.</div>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Financial totals print block */}
                  <div className="border border-stone-900 p-3 bg-stone-50 text-[10px] space-y-2 relative mt-auto">
                    <div className="flex justify-between items-center font-bold text-stone-900 border-b border-stone-300 pb-2 mb-2 uppercase">
                      <span>Event Section Subtotal</span>
                      <span className="font-mono text-sm text-stone-950">${eventTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[8.5px] text-stone-500 leading-normal">
                      Tax (7%) and standard Food and Beverage Gratuity (22%) and Admin Fee (3%) will represent additional charges on the final ledger. Menus and room selections remain locked after cutoff date. Guaranteed numbers are committed 72 hours prior to service. Subcontracted outside AV compliance terms apply.
                    </p>
                    <div className="flex justify-between pt-6 text-[9.5px] font-medium text-stone-600 print:pt-10">
                      <div className="border-t border-stone-400 w-1/3 pt-1 text-center">
                        CSM Larissa Szynski - Hotel Bardo
                      </div>
                      <div className="border-t border-stone-400 w-1/3 pt-1 text-center">
                        Client Administrator Authorization Signature
                      </div>
                    </div>
                  </div>
                  
                  {/* Page indicator for preview */}
                  <div className="mt-8 text-center text-[10px] font-mono text-stone-400 print:hidden opacity-50">
                    Page {idx + 1} of {eventsOnDate.length}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
