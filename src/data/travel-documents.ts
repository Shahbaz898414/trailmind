export interface TravelDocumentItem {
  id: string;
  category: "Transport" | "Lodging" | "Pass / Visa" | "Insurance" | "Permit";
  title: string;
  referenceCode: string;
  issuer: string;
  carrierOrHotel: string;
  validDates: string;
  seatOrRoom?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureStation?: string;
  arrivalStation?: string;
  encryptionStatus: "AES-256 Encrypted (On-Device)" | "Hardware Key Bound";
  barcodeType: "Aztec Code" | "QR-Code" | "PDF417";
  barcodeValue: string;
  status: "active" | "archived" | "upcoming";
  image?: string;
  details: Record<string, string>;
  notes: string;
}

export const travelDocumentsList: TravelDocumentItem[] = [
  {
    id: "doc-nozomi-23",
    category: "Transport",
    title: "JR Shinkansen Nozomi #23",
    referenceCode: "NZ23-KYT-849201",
    issuer: "JR Central (Central Japan Railway)",
    carrierOrHotel: "Tokaido Shinkansen N700S",
    validDates: "08 APR 2026",
    departureTime: "11:45 AM",
    arrivalTime: "02:03 PM",
    departureStation: "Kyoto (Track 12)",
    arrivalStation: "Tokyo (Track 14)",
    seatOrRoom: "Car 7 • Seat 14-E (Window / Mt. Fuji View)",
    encryptionStatus: "AES-256 Encrypted (On-Device)",
    barcodeType: "Aztec Code",
    barcodeValue: "JR700S-NZ23-KYT-TYO-14E-20260408-VALID",
    status: "active",
    image: "/images/stitch/document-mount-fuji-shinkansen.jpg",
    details: {
      "Class": "Ordinary Reserved (普通車指定席)",
      "Car Type": "N700S High-Speed Bullet Train",
      "Oversized Baggage": "Area Reserved behind Row 14",
      "Power": "100V AC Outlet Active at Seat 14-E",
      "Fare": "¥14,170 (IC SmartEX Paid)"
    },
    notes: "Mount Fuji will appear on the port (left) side approximately 45 minutes into transit near Fuji / Shizuoka Station."
  },
  {
    id: "doc-ryokan-motonaga",
    category: "Lodging",
    title: "Ryokan Motonaga Booking Voucher",
    referenceCode: "MOTONAGA-KYT-9921",
    issuer: "Ryokan Motonaga Higashiyama",
    carrierOrHotel: "Ryokan Motonaga",
    validDates: "28 MAR – 08 APR 2026 (11 Nights)",
    seatOrRoom: "Sukiya Tatami Garden Suite",
    departureTime: "Check-in 15:00",
    arrivalTime: "Check-out 11:00",
    departureStation: "Ishibei-koji Alley",
    arrivalStation: "Kyoto Higashiyama",
    encryptionStatus: "Hardware Key Bound",
    barcodeType: "QR-Code",
    barcodeValue: "KYT-MOTONAGA-2026-CONFIRMED-0x981",
    status: "active",
    image: "/images/stitch/saved-ryokan-motonaga.jpg",
    details: {
      "Meal Plan": "Daily Kaiseki Breakfast Included",
      "Bath": "Private Hinoki Cypress Soaking Tub Reserved",
      "Curfew": "23:00 Outer Gate Lock",
      "Total": "¥385,000 (Pre-authorized)"
    },
    notes: "Notify okami in advance if arriving past 18:00 on Day 1 for evening meal staging."
  },
  {
    id: "doc-axa-insurance",
    category: "Insurance",
    title: "Alpine Expedition Medical & Evacuation",
    referenceCode: "AXA-EVAC-99482-JP",
    issuer: "AXA Global Wilderness Assist",
    carrierOrHotel: "Global Rescue Network",
    validDates: "20 MAR – 30 APR 2026",
    encryptionStatus: "AES-256 Encrypted (On-Device)",
    barcodeType: "PDF417",
    barcodeValue: "AXA-EXP-MED-99482-JP-HELICOPTER-EVAC-INCL",
    status: "active",
    details: {
      "Coverage": "Worldwide Wilderness Medical ($1,000,000)",
      "Helicopter Evacuation": "Full Coverage up to 6,000m",
      "Emergency Hotline": "+1 (800) 555-8921 (24/7 Iridium Link)",
      "Policyholder": "Alex Morgan (DOB: 14 MAY 1992)"
    },
    notes: "Direct satellite radio dispatch authorized via Garmin inReach and Iridium satellite constellation."
  },
  {
    id: "doc-jr-railpass",
    category: "Pass / Visa",
    title: "Japan Rail 7-Day All-Lines Green Pass",
    referenceCode: "JR-GREEN-7D-004812",
    issuer: "Japan Railways Group",
    carrierOrHotel: "JR Nationwide",
    validDates: "01 APR – 07 APR 2026",
    encryptionStatus: "Hardware Key Bound",
    barcodeType: "Aztec Code",
    barcodeValue: "JRPASS-GREEN-7D-VALID-004812",
    status: "upcoming",
    details: {
      "Class": "First Class Green Car",
      "Shinkansen": "Hikari, Sakura, Kodama & Limited Express",
      "Exchange Location": "Kyoto Station JR Central Ticket Office"
    },
    notes: "Physical exchange voucher must be redeemed with biometric passport."
  }
];
