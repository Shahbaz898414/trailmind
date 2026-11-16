export interface EmergencyContactItem {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  satelliteAddress?: string;
  priority: number;
  isPrimaryIce: boolean;
}

export interface EmbassyRescueService {
  name: string;
  serviceType: string;
  phone: string;
  frequency?: string;
  notes: string;
  japaneseKanji?: string;
}

export const emergencyContactsList: EmergencyContactItem[] = [
  {
    id: "contact-1",
    name: "Sarah Morgan",
    relationship: "Spouse & Primary Next of Kin",
    phone: "+1 (555) 234-8901",
    satelliteAddress: "sarah.morgan@inreach.garmin.com",
    priority: 1,
    isPrimaryIce: true
  },
  {
    id: "contact-2",
    name: "Dr. James Chen, MD",
    relationship: "Personal Physician & Wilderness Medicine",
    phone: "+1 (555) 456-7890",
    priority: 2,
    isPrimaryIce: false
  },
  {
    id: "contact-3",
    name: "Elena Rostova",
    relationship: "Alpine Expedition Partner",
    phone: "+1 (555) 987-6543",
    satelliteAddress: "elena.rostova@trailmind.mesh",
    priority: 3,
    isPrimaryIce: false
  }
];

export const fieldRescueServices: EmbassyRescueService[] = [
  {
    name: "Japan Police Emergency Dispatch",
    japaneseKanji: "警察 (Keisatsu)",
    serviceType: "Police & Field Search",
    phone: "110",
    notes: "Direct line for crime, lost hikers, and missing persons."
  },
  {
    name: "Japan Ambulance & Fire Rescue",
    japaneseKanji: "救急車・消防 (Kyūkyūsha / Shōbō)",
    serviceType: "Medical Emergency",
    phone: "119",
    notes: "Direct medical dispatch with multilingual translation operator capability."
  },
  {
    name: "Japan Coast Guard Maritime Rescue",
    japaneseKanji: "海上保安庁 (Kaijō Hoanchō)",
    serviceType: "Coastal & Sea Emergency",
    phone: "118",
    notes: "For coastal treks and water rescue operations."
  },
  {
    name: "Japan Alpine Rescue (Sangaku Sounan Rescue)",
    japaneseKanji: "山岳遭難捜索救助隊",
    serviceType: "Mountain Search & Rescue",
    phone: "+81 75-451-9111",
    frequency: "145.000 MHz VHF / 430.000 MHz UHF",
    notes: "Prefectural police mountain rescue squad."
  },
  {
    name: "U.S. Embassy Tokyo & Consular Agency",
    japaneseKanji: "在日米国大使館",
    serviceType: "Diplomatic Emergency",
    phone: "+81 3-3224-5000",
    notes: "24/7 Citizen Emergency Services hotline. Passports, legal aid, medical evacuation."
  }
];
