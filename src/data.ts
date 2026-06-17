/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, BardoEvent, CatalogItem, ChatMessage, AuditLog } from "./types";

export const INITIAL_BOOKING: Booking = {
  title: "TEST | ConfServ Customer Booking",
  propertyName: "Hotel Bardo Savannah",
  account: "Social 2027",
  contactName: "Blueoceansp Test Prabudeva",
  contactEmail: "prabudevau@blueoceansp.ai",
  contactPhone: "0760704491",
  address: "No 15, Kovil Road, Amherst Nuwareliya, NUWARELIYA, 22250, Sri Lanka",
  taxExempt: false,
  masterAccountNum: "B-998-2027",
  paymentMethod: "Credit Card / Master Account Split",
  bookedBy: "Larissa Szynski",
  serviceManager: "Larissa Szynski",
  revenueType: "Banquet",
  expectedAttendanceGlobal: 150,
  foodCutoffDate: "2027-05-02",
  finalGuaranteeDate: "2027-05-17",
};

export const LUXURY_CATALOG: CatalogItem[] = [
  // FOOD
  { id: "f1", name: "*Passed Hors D'oeuvres 2026*", unitPrice: 35.0, category: "food", description: "Chef selected curated cold and warm appetizers", revenueClassification: "Food" },
  { id: "f2", name: "Artisanal Charcuterie & Georgia Cheese Board", unitPrice: 28.0, category: "food", description: "Local honeycomb, whole grain muster, sweet pickles, crusty sourdough", revenueClassification: "Food" },
  { id: "f3", name: "Savannah Crab Cake Slider Set", unitPrice: 18.0, category: "food", description: "With Meyer lemon remoulade and micro greens", revenueClassification: "Food" },
  { id: "f4", name: "Truffle Mushroom Arancini", unitPrice: 15.0, category: "food", description: "Aged parmesan, truffle oil, chive emulsion", revenueClassification: "Food" },
  { id: "f5", name: "Smoked Wagyu Beef Skewers", unitPrice: 22.0, category: "food", description: "Glazed with molasses and bourbon reduction", revenueClassification: "Food" },
  { id: "f6", name: "Warm Lavender Brioche Bread Pudding", unitPrice: 14.0, category: "food", description: "Topped with chantilly cream and Savannah wild honey", revenueClassification: "Food" },
  
  // BEVERAGE
  { id: "b1", name: "2026 PREMIUM SPIRITS (ON CONSUMPTION)", unitPrice: 22.0, category: "beverage", description: "Premium spirits charge per drink consumed", revenueClassification: "Beverage" },
  { id: "b2", name: "2026 SPECIALITY COCKTAILS (BATCH)", unitPrice: 750.0, category: "beverage", description: "Signature lavender-infused gin and tonic, batch of 50 pours", revenueClassification: "Beverage" },
  { id: "b3", name: "Still and sparkling water stations at both ends of the courtyard", unitPrice: 150.0, category: "beverage", description: "Refreshing stations with fresh citrus slices", revenueClassification: "Beverage" },
  { id: "b4", name: "Zero-proof option: Garden Fizz (cucumber, elderflower, lime, soda)", unitPrice: 12.0, category: "beverage", description: "Non-alcoholic elegant botanical blend", revenueClassification: "Beverage" },
  { id: "b5", name: "Veuve Clicquot Yellow Label Brut", unitPrice: 145.0, category: "beverage", description: "Premium champagne poured toast", revenueClassification: "Beverage" },

  // SETUP
  { id: "s1", name: "THEATER SET", unitPrice: 0.0, category: "setup", description: "Rows of elegant dark banquet chairs facing presenter stage", revenueClassification: "Resource" },
  { id: "s2", name: "Existing Lounge Seating", unitPrice: 0.0, category: "setup", description: "Preserve Bardo standard upscale sofas and coffee tables", revenueClassification: "Resource" },
  { id: "s3", name: "Flow Style Standing Tables", unitPrice: 45.0, category: "setup", description: "High-top cocktail rounds with ivory linen ties", revenueClassification: "Resource" },
  { id: "s4", name: "Registration Desk with 2 padded leather chairs", unitPrice: 120.0, category: "setup", description: "Power strip, registration signage holder, wastebasket", revenueClassification: "Resource" },
  { id: "s5", name: "Outdoor Lawn Lanterns & Soft Seating Lounge", unitPrice: 850.0, category: "setup", description: "Luxury outdoor sofas, rugs, low lighting and gas lamps", revenueClassification: "Resource" },

  // AV
  { id: "a1", name: "AUDIO VISUAL - OUTSIDE VENDOR COMPLIANCE FEE", unitPrice: 1500.0, category: "av", description: "Coordinator and patch panel authorization fee for outside vendor integration", revenueClassification: "A/V" },
  { id: "a2", name: "Premium Unified Sound System Patch", unitPrice: 450.0, category: "av", description: "Connection flat rate to the built-in overhead Bose array", revenueClassification: "A/V" },
  { id: "a3", name: "85-inch Ultra High Definition Mobile Presentation LED Screen", unitPrice: 650.0, category: "av", description: "With laptop HDMI interface and active audio bar", revenueClassification: "A/V" },
  { id: "a4", name: "Wireless Lavaliere Microphone & Receiver Pack", unitPrice: 220.0, category: "av", description: "Shure QLX-D professional digital microphone package", revenueClassification: "A/V" },
];

export const INITIAL_EVENTS: BardoEvent[] = [
  {
    id: "evt-01",
    name: "Lunch - Buffet",
    date: "2027-06-01",
    startTime: "12:00 PM",
    endTime: "1:00 PM",
    status: "Definite",
    room: "Carriage House",
    setupStyle: "Existing",
    expectedAttendance: 100,
    guaranteedAttendance: 100,
    requirements: {
      food: [
        { id: "f-li-1", name: "*Passed Hors D'oeuvres 2026*", quantity: 24, unitPrice: 35.0, description: "Delivered at room entry warm", itemType: "Food", revenueClassification: "Food" }
      ],
      beverage: [
        { id: "b-li-1", name: "2026 PREMIUM SPIRITS (ON CONSUMPTION)", quantity: 22, unitPrice: 22.0, itemType: "Beverage", revenueClassification: "Beverage" },
        { id: "b-li-2", name: "2026 SPECIALITY COCKTAILS", quantity: 750, unitPrice: 1.0, description: "$750 per batch flat", itemType: "Beverage", revenueClassification: "Beverage" },
        { id: "b-li-3", name: "Still and sparkling water stations at both ends of the courtyard", quantity: 1, unitPrice: 150.0, itemType: "Beverage", revenueClassification: "Beverage" },
        { id: "b-li-4", name: "Zero-proof option: Garden Fizz (cucumber, elderflower, lime, soda)", quantity: 25, unitPrice: 12.0, itemType: "Beverage", revenueClassification: "Beverage" }
      ],
      setup: [
        { id: "s-li-1", name: "Existing Seating", quantity: 1, unitPrice: 0.0, description: "Do not modify default Carriage House setup", itemType: "Resource" }
      ],
      av: [
        { id: "a-li-1", name: "AUDIO VISUAL - OUTSIDE VENDOR", quantity: 1, unitPrice: 1500.0, description: "Subcontracted setup fee", itemType: "A/V", revenueClassification: "A/V" }
      ],
      other: []
    }
  },
  {
    id: "evt-02",
    name: "Meeting",
    date: "2027-06-01",
    startTime: "8:00 AM",
    endTime: "5:00 PM",
    status: "Definite",
    room: "Grand Ballroom",
    setupStyle: "THEATER SET",
    expectedAttendance: 100,
    guaranteedAttendance: 100,
    requirements: {
      food: [
        { id: "f-li-2", name: "Artisanal Charcuterie & Georgia Cheese Board", quantity: 3, unitPrice: 28.0, description: "For morning welcome check-in", itemType: "Food" }
      ],
      beverage: [],
      setup: [
        { id: "s-li-2", name: "THEATER SET", quantity: 100, unitPrice: 0, description: "10 rows of 10 seats, centered isle", itemType: "Resource" }
      ],
      av: [
        { id: "a-li-2", name: "85-inch Mobile LED Screen", quantity: 1, unitPrice: 650.0, itemType: "A/V" },
        { id: "a-li-3", name: "Wireless Handheld Microphone", quantity: 2, unitPrice: 150.0, itemType: "A/V" }
      ],
      other: []
    }
  },
  {
    id: "evt-03",
    name: "PM Break",
    date: "2027-06-01",
    startTime: "3:00 PM",
    endTime: "3:30 PM",
    status: "Definite",
    room: "Ballroom Pre-function",
    setupStyle: "Flow",
    expectedAttendance: 100,
    guaranteedAttendance: 100,
    requirements: {
      food: [
        { id: "f-li-3", name: "Savannah Crab Cake Slider Set", quantity: 100, unitPrice: 18.0, description: "Heated chafing stations", itemType: "Food" }
      ],
      beverage: [
        { id: "b-li-5", name: "Still and sparkling water stations", quantity: 1, unitPrice: 150.0, itemType: "Beverage" }
      ],
      setup: [
        { id: "s-li-3", name: "Flow standing cocktail tables", quantity: 8, unitPrice: 45.0, itemType: "Resource" }
      ],
      av: [],
      other: []
    }
  },
  {
    id: "evt-04",
    name: "Registration",
    date: "2027-06-01",
    startTime: "7:30 AM",
    endTime: "8:00 AM",
    status: "Definite",
    room: "Ballroom Pre-function",
    setupStyle: "Registration",
    expectedAttendance: 4,
    guaranteedAttendance: 4,
    requirements: {
      food: [],
      beverage: [],
      setup: [
        { id: "s-li-4", name: "Registration Desk with 2 padded leather chairs", quantity: 1, unitPrice: 120.0, itemType: "Resource" }
      ],
      av: [],
      other: []
    }
  },
  {
    id: "evt-05",
    name: "Lunch - Buffet",
    date: "2027-06-02",
    startTime: "12:00 PM",
    endTime: "1:00 PM",
    status: "Definite",
    room: "Carriage House",
    setupStyle: "Existing",
    expectedAttendance: 100,
    guaranteedAttendance: 100,
    requirements: {
      food: [
        { id: "f-li-4", name: "Wagyu Beef Sliders and Crab Cakes", quantity: 100, unitPrice: 22.0, itemType: "Food" }
      ],
      beverage: [
        { id: "b-li-6", name: "2026 PREMIUM SPIRITS (ON CONSUMPTION)", quantity: 40, unitPrice: 22.0, itemType: "Beverage" }
      ],
      setup: [],
      av: [],
      other: []
    }
  },
  {
    id: "evt-06",
    name: "Meeting",
    date: "2027-06-02",
    startTime: "8:00 AM",
    endTime: "5:00 PM",
    status: "Definite",
    room: "Grand Ballroom",
    setupStyle: "THEATER SET",
    expectedAttendance: 100,
    guaranteedAttendance: 100,
    requirements: {
      food: [],
      beverage: [],
      setup: [
        { id: "s-li-5", name: "THEATER SET", quantity: 100, unitPrice: 0, itemType: "Resource" }
      ],
      av: [],
      other: []
    }
  },
  {
    id: "evt-07",
    name: "Outlet to Handle",
    date: "2027-06-02",
    startTime: "6:00 PM",
    endTime: "9:00 PM",
    status: "Definite",
    room: "Bar Bibi",
    setupStyle: "Existing",
    expectedAttendance: 20,
    guaranteedAttendance: 20,
    requirements: {
      food: [
        { id: "f-li-5", name: "Assorted Bardo Antipasti Boards", quantity: 5, unitPrice: 35.0, itemType: "Food" }
      ],
      beverage: [
        { id: "b-li-7", name: "2026 PREMIUM SPIRITS (ON CONSUMPTION)", quantity: 32, unitPrice: 22.0, itemType: "Beverage" }
      ],
      setup: [],
      av: [],
      other: []
    }
  },
  {
    id: "evt-08",
    name: "Dinner - Buffet",
    date: "2027-06-03",
    startTime: "6:00 PM",
    endTime: "10:00 PM",
    status: "Definite",
    room: "Carriage House + Event Lawn + Bar Bibi",
    setupStyle: "See Diagram",
    expectedAttendance: 100,
    guaranteedAttendance: 100,
    requirements: {
      food: [
        { id: "f-li-6", name: "Smoked Wagyu Beef Skewers", quantity: 150, unitPrice: 22.0, itemType: "Food" },
        { id: "f-li-7", name: "Chef's Artisanal Gelato Cart", quantity: 1, unitPrice: 850.0, description: "Lavender and vanilla bean", itemType: "Food" }
      ],
      beverage: [
        { id: "b-li-8", name: "Bardo Signature Reserve Bar Option", quantity: 100, unitPrice: 45.0, itemType: "Beverage" }
      ],
      setup: [
        { id: "s-li-6", name: "Outdoor Lawn Lanterns & Soft Seating Lounge", quantity: 1, unitPrice: 850.0, itemType: "Resource" }
      ],
      av: [
        { id: "a-li-4", name: "Ambient Festoon Outdoor Lighting Patch", quantity: 1, unitPrice: 350.0, itemType: "A/V" }
      ],
      other: []
    }
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "chat-01",
    sender: " Larissa Szynski (CSM)",
    text: "Hello! It's a pleasure to meet you. I'm Larissa, your primary conference manager at Hotel Bardo Savannah. I have populated the core 8 events from your initial contract. Please review and feel free to adjust menu, bar, or AV requirements right here!",
    timestamp: "8:29 AM"
  },
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "Jun 17, 2026 8:30 AM",
    eventName: "Lunch - Buffet",
    category: "Beverage",
    action: "added",
    itemName: "2026 PREMIUM SPIRITS (ON CONSUMPTION)",
    details: "Quantity configured to 22 by Contract Admin"
  },
  {
    id: "log-2",
    timestamp: "Jun 17, 2026 8:32 AM",
    eventName: "Registration",
    category: "Setup",
    action: "added",
    itemName: "Registration Desk with 2 padded leather chairs",
    details: "Added to Ballroom Pre-function"
  }
];

// Helper to generate up to 100 events across 5 days dynamically for scalability display
export function generateBulkEvents(count: number): BardoEvent[] {
  const rooms = ["Carriage House", "Grand Ballroom", "Ballroom Pre-function", "Bar Bibi", "Event Lawn", "Greenhouse Lounge", "Savannah Courtyard"];
  const types = ["Meeting", "Breakfast - Buffet", "Lunch - Buffet", "Dinner - Plated", "PM Break", "Registration", "Luxe Cocktail Hour", "Panel Session", "VIP Roundtable", "Keynote Address"];
  const setups = ["THEATER SET", "Existing Seating", "Flow Style Standing Tables", "Banquet Rounds", "Classroom Layout", "U-Shape Table Setup"];
  
  const baseList = [...INITIAL_EVENTS];
  
  if (count <= 8) return baseList;
  
  const additionalNeeded = count - baseList.length;
  const startDate = new Date(2027, 5, 1); // June 1, 2027
  
  for (let i = 0; i < additionalNeeded; i++) {
    // Distribute events elegantly across 5 days (June 1 - June 5)
    const dayOffset = Math.floor(i / (additionalNeeded / 5));
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayOffset);
    const dateString = targetDate.toISOString().split("T")[0];
    
    const hour = 8 + (i % 8);
    const endHour = hour + 1;
    const isPM = hour >= 12;
    const isEndPM = endHour >= 12;
    
    const dispHour = hour > 12 ? hour - 12 : hour;
    const dispEndHour = endHour > 12 ? endHour - 12 : endHour;
    
    const startTimeStr = `${dispHour}:00 ${isPM ? "PM" : "AM"}`;
    const endTimeStr = `${dispEndHour}:00 ${isEndPM ? "PM" : "AM"}`;
    
    const typeStr = types[i % types.length];
    const roomStr = rooms[i % rooms.length];
    const setupStr = setups[i % setups.length];
    
    // Choose some items based on type
    const requirements: any = { food: [], beverage: [], setup: [], av: [], other: [] };
    
    if (typeStr.includes("Buffet") || typeStr.includes("Plated")) {
      requirements.food.push({
        id: `bulk-f-${i}`,
        name: typeStr.includes("Lunch") ? "*Passed Hors D'oeuvres 2026*" : "Artisanal Charcuterie & Georgia Cheese Board",
        quantity: 100,
        unitPrice: 28.0,
        itemType: "Food"
      });
      requirements.beverage.push({
        id: `bulk-b-${i}`,
        name: "2026 PREMIUM SPIRITS (ON CONSUMPTION)",
        quantity: 50,
        unitPrice: 22.0,
        itemType: "Beverage"
      });
    } else if (typeStr.includes("Keynote") || typeStr.includes("Meeting") || typeStr.includes("Roundtable")) {
      requirements.setup.push({
        id: `bulk-s-${i}`,
        name: setupStr,
        quantity: 1,
        unitPrice: 0.0,
        itemType: "Resource"
      });
      requirements.av.push({
        id: `bulk-a-${i}`,
        name: "85-inch Mobile LED Screen",
        quantity: 1,
        unitPrice: 650.0,
        itemType: "A/V"
      });
    }

    baseList.push({
      id: `bulk-evt-${i + 100}`,
      name: `${typeStr} (Sec. ${i + 1})`,
      date: dateString,
      startTime: startTimeStr,
      endTime: endTimeStr,
      status: i % 15 === 0 ? "Pending Approval" : "Definite",
      room: roomStr,
      setupStyle: setupStr,
      expectedAttendance: 100 + (i % 5) * 10,
      guaranteedAttendance: 100 + (i % 5) * 10,
      requirements
    });
  }
  
  // Sort by date and start time safely
  return baseList.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // Simple sort by hour
    const aHour = parseInt(a.startTime.split(":")[0]) + (a.startTime.includes("PM") && !a.startTime.startsWith("12") ? 12 : 0);
    const bHour = parseInt(b.startTime.split(":")[0]) + (b.startTime.includes("PM") && !b.startTime.startsWith("12") ? 12 : 0);
    return aHour - bHour;
  });
}
