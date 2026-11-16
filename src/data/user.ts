export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  preferredTravelStyle: string;
  preferredLanguage: string;
  homeCountry: string;
  bloodType: string;
  allergies: string[];
  medicalNotes: string;
  emergencySosArmed: boolean;
  satelliteRelayActive: boolean;
  hardwareKeyId: string;
}

export const currentUser: UserProfile = {
  name: "Alex Morgan",
  email: "alex@example.com",
  avatarUrl: "/images/stitch/profile-kenji-takahashi.jpg",
  preferredTravelStyle: "Adventure & Cultural Heritage",
  preferredLanguage: "English (US)",
  homeCountry: "United States",
  bloodType: "O-Positive (O型 Rh+)",
  allergies: ["Penicillin", "Peanuts (落花生)", "Bee Stings (蜂毒)"],
  medicalNotes: "Carries Epinephrine auto-injector in top pocket of expedition pack.",
  emergencySosArmed: true,
  satelliteRelayActive: true,
  hardwareKeyId: "YubiKey 5C NFC (Vault-Key-0x84F2)"
};
