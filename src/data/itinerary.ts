export interface ItineraryActivity {
  id: string;
  timeSlot: string;
  title: string;
  category: "Culture" | "Nature" | "Dining" | "Transit" | "Lodging" | "Heritage";
  location: string;
  coordinates: string;
  duration: string;
  elevation: string;
  crowdLevel: "Low" | "Moderate" | "High";
  status: "confirmed" | "optimized" | "contingency";
  image?: string;
  description: string;
  solarEphemeris?: string;
  notes?: string;
  audioKey?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  theme: string;
  sunrise: string;
  sunset: string;
  goldenHour: string;
  weather: string;
  tempRange: string;
  activities: ItineraryActivity[];
}

export const kyoto12DayItinerary: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: "2026-03-28",
    title: "Arrival at Kansai & Pontocho Twilight Walk",
    theme: "Transit & Night River Sanctuary",
    sunrise: "05:54 AM",
    sunset: "06:18 PM",
    goldenHour: "05:35 PM",
    weather: "Crisp & Clear",
    tempRange: "7°C – 16°C",
    activities: [
      {
        id: "act-1-1",
        timeSlot: "14:15 – 15:30",
        title: "Haruka Express Transit (KIX → Kyoto Station)",
        category: "Transit",
        location: "Kansai Airport Platform 4",
        coordinates: "34.4347° N, 135.2442° E",
        duration: "75 min",
        elevation: "Sea level → 31m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Direct limited express train utilizing ICOCA card. Store luggage in forward rack car 4.",
        notes: "Power outlets active at window seats. Offline ticket stored in TrailMind Wallet."
      },
      {
        id: "act-1-2",
        timeSlot: "16:00 – 17:15",
        title: "Ryokan Motonaga Check-in & Cedar Bath",
        category: "Lodging",
        location: "Higashiyama Ward, Kyoto",
        coordinates: "34.9995° N, 135.7801° E",
        duration: "75 min",
        elevation: "62m",
        crowdLevel: "Low",
        status: "confirmed",
        image: "/images/stitch/saved-ryokan-motonaga.jpg",
        description: "Settle into historic sukiya-style tatami quarters near Ishibei-koji alley. Traditional cypress bath prepared.",
        notes: "Curfew 23:00. English and French spoken by okami."
      },
      {
        id: "act-1-3",
        timeSlot: "18:00 – 20:30",
        title: "Pontocho Alley Lantern Walk & Duck Liver Yakitori",
        category: "Dining",
        location: "Pontocho-dori along Kamo River",
        coordinates: "35.0061° N, 135.7712° E",
        duration: "2.5 hrs",
        elevation: "45m",
        crowdLevel: "Moderate",
        status: "optimized",
        image: "/images/stitch/kyoto-pontocho-dusk.jpg",
        description: "Narrow atmospheric alleyway illuminated by washi lanterns. Counter dining reserved at Toriyoshi.",
        notes: "Cash accepted; off-grid reservation token verified."
      }
    ]
  },
  {
    dayNumber: 2,
    date: "2026-03-29",
    title: "Torii Dawn Ascent & Tofuku-ji Zen Sanctuary",
    theme: "Sacred Mountain Ridge Exploration",
    sunrise: "05:52 AM",
    sunset: "06:19 PM",
    goldenHour: "05:38 PM",
    weather: "Morning Mist to Golden Sun",
    tempRange: "6°C – 18°C",
    activities: [
      {
        id: "act-2-1",
        timeSlot: "06:00 – 08:30",
        title: "Fushimi Inari Taisha (Mount Inari Summit Loop)",
        category: "Culture",
        location: "Fushimi Ward, Kyoto",
        coordinates: "34.9671° N, 135.7727° E",
        duration: "2.5 hrs",
        elevation: "233m Summit",
        crowdLevel: "Low",
        status: "confirmed",
        solarEphemeris: "Solar Dawn Lock: 06:10 AM at Yotsu-tsuji intersection",
        description: "Traverse 10,000 vermilion torii gates at first light before tour buses arrive. Peaceful mountain shrine summit.",
        notes: "Headlamp recommended for first 20 minutes if departing before dawn."
      },
      {
        id: "act-2-2",
        timeSlot: "09:30 – 11:30",
        title: "Tofuku-ji Hojo Modern Stone Garden & Tsutenkyo Bridge",
        category: "Culture",
        location: "Honmachi, Higashiyama",
        coordinates: "34.9804° N, 135.7744° E",
        duration: "2 hrs",
        elevation: "55m",
        crowdLevel: "Low",
        status: "optimized",
        description: "Mirei Shigemori's avant-garde checkerboard moss garden and deep forested gorge bridge.",
        notes: "Silent contemplation zone. Photography permitted without tripods."
      },
      {
        id: "act-2-3",
        timeSlot: "12:15 – 14:00",
        title: "Nishiki Market Artisan Provisions Circuit",
        category: "Dining",
        location: "Nishikikoji-dori",
        coordinates: "35.0050° N, 135.7649° E",
        duration: "1 hr 45 min",
        elevation: "40m",
        crowdLevel: "High",
        status: "confirmed",
        description: "Kyoto's 400-year-old pantry: grilled unagi skewers, tsukemono pickles, and roasted hojicha.",
        notes: "Etiquette rule: eat inside shop stalls, avoid walking while eating."
      }
    ]
  },
  {
    dayNumber: 3,
    date: "2026-03-30",
    title: "Arashiyama Bamboo Grove & Okochi Sanso Villa",
    theme: "Western Kyoto Forest & Zen Aesthetic",
    sunrise: "05:51 AM",
    sunset: "06:20 PM",
    goldenHour: "05:40 PM",
    weather: "Sunny with gentle breeze",
    tempRange: "8°C – 19°C",
    activities: [
      {
        id: "act-3-1",
        timeSlot: "06:45 – 08:15",
        title: "Arashiyama Sagano Bamboo Path Dawn Solitude",
        category: "Nature",
        location: "Ukyo Ward, Kyoto",
        coordinates: "35.0170° N, 135.6713° E",
        duration: "90 min",
        elevation: "70m",
        crowdLevel: "Low",
        status: "confirmed",
        image: "/images/stitch/kyoto-arashiyama-bamboo.jpg",
        description: "Wind whistling through 30-meter high green bamboo stalks in early morning hush.",
        notes: "Air-gapped audio guide track #03 ready for playback."
      },
      {
        id: "act-3-2",
        timeSlot: "08:30 – 10:30",
        title: "Tenryu-ji Sogenchi Zen Garden Reflection",
        category: "Culture",
        location: "Tenryuji Susukinobaba-cho",
        coordinates: "35.0158° N, 135.6776° E",
        duration: "2 hrs",
        elevation: "65m",
        crowdLevel: "Moderate",
        status: "confirmed",
        image: "/images/stitch/kyoto-tenryuji-zen-garden.jpg",
        description: "14th-century pond garden borrowing scenery from Arashiyama mountains.",
        notes: "Shojin-ryori temple lunch reservations open at 11:30."
      },
      {
        id: "act-3-3",
        timeSlot: "11:00 – 13:00",
        title: "Okochi-sanso Villa Garden Panorama & Matcha",
        category: "Culture",
        location: "Ogurayama, Saga",
        coordinates: "35.0194° N, 135.6698° E",
        duration: "2 hrs",
        elevation: "110m",
        crowdLevel: "Low",
        status: "optimized",
        image: "/images/stitch/kyoto-okochi-sanso-view.jpg",
        description: "Silent actor's estate overlooking Kyoto basin and Hozu River canyon. Matcha served in teahouse.",
        notes: "Ticket includes matcha and seasonal wagashi sweet."
      },
      {
        id: "act-3-4",
        timeSlot: "13:30 – 15:00",
        title: "Shigetsu Shojin-Ryori Vegan Temple Feast",
        category: "Dining",
        location: "Inside Tenryu-ji precinct",
        coordinates: "35.0155° N, 135.6772° E",
        duration: "90 min",
        elevation: "65m",
        crowdLevel: "Low",
        status: "confirmed",
        image: "/images/stitch/kyoto-shojin-ryori.jpg",
        description: "Buddhist vegetarian cuisine: sesame tofu, seasonal mountain vegetables, simmered yuba.",
        notes: "Fully plant-based, allergen verified."
      }
    ]
  },
  {
    dayNumber: 4,
    date: "2026-03-31",
    title: "Philosopher's Path & Nanzen-ji Roman Aqueduct",
    theme: "Eastern Hills Canal Circuit",
    sunrise: "05:49 AM",
    sunset: "06:21 PM",
    goldenHour: "05:42 PM",
    weather: "Overcast with soft light",
    tempRange: "10°C – 17°C",
    activities: [
      {
        id: "act-4-1",
        timeSlot: "08:00 – 10:30",
        title: "Tetsugaku-no-Michi Cherry Blossom Canal Trek",
        category: "Nature",
        location: "Ginkakuji to Nanzenji Canal",
        coordinates: "35.0272° N, 135.7954° E",
        duration: "2.5 hrs",
        elevation: "78m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Stone path following Lake Biwa canal lined with weeping sakura blossoms.",
        notes: "Visit Honen-in secluded moss gate along route."
      },
      {
        id: "act-4-2",
        timeSlot: "11:00 – 13:00",
        title: "Nanzen-ji Suirokaku Roman Brick Aqueduct",
        category: "Heritage",
        location: "Nanzenji Fukuchicho",
        coordinates: "35.0116° N, 135.7944° E",
        duration: "2 hrs",
        elevation: "85m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Meiji-era red brick aqueduct arches soaring through ancient Japanese temple cedar woods.",
        notes: "Ascend Sanmon gate second-floor balcony for Kyoto basin vista."
      }
    ]
  },
  {
    dayNumber: 5,
    date: "2026-04-01",
    title: "Nijo Castle Nightingales & Sanjusangen-do Statues",
    theme: "Shogun History & Golden Sculptures",
    sunrise: "05:48 AM",
    sunset: "06:22 PM",
    goldenHour: "05:44 PM",
    weather: "Clear & Bright",
    tempRange: "9°C – 20°C",
    activities: [
      {
        id: "act-5-1",
        timeSlot: "09:00 – 11:30",
        title: "Nijo Castle Ninomaru Palace Squeaking Floors",
        category: "Culture",
        location: "Nakagyo Ward, Kyoto",
        coordinates: "35.0142° N, 135.7482° E",
        duration: "2.5 hrs",
        elevation: "42m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Edo period Shogun fortress famous for anti-assassin 'nightingale' alarm flooring.",
        notes: "Shoe removal required inside palace."
      },
      {
        id: "act-5-2",
        timeSlot: "14:00 – 16:30",
        title: "Sanjusangen-do 1,001 Golden Kannon Statues",
        category: "Culture",
        location: "Higashiyama Ward",
        coordinates: "34.9879° N, 135.7717° E",
        duration: "2.5 hrs",
        elevation: "38m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Long wooden hall housing 1,001 life-sized gold leaf thousand-armed deity sculptures.",
        notes: "Absolute indoor silence policy."
      }
    ]
  },
  {
    dayNumber: 6,
    date: "2026-04-02",
    title: "Kinkaku-ji Gold & Ryoan-ji Rock Rakes",
    theme: "Northern Kyoto Icon Circuit",
    sunrise: "05:46 AM",
    sunset: "06:23 PM",
    goldenHour: "05:46 PM",
    weather: "Spring Sunlight",
    tempRange: "11°C – 21°C",
    activities: [
      {
        id: "act-6-1",
        timeSlot: "08:45 – 10:15",
        title: "Kinkaku-ji (The Golden Pavilion) Mirror Pond",
        category: "Culture",
        location: "Kita Ward, Kyoto",
        coordinates: "35.0394° N, 135.7292° E",
        duration: "90 min",
        elevation: "110m",
        crowdLevel: "High",
        status: "confirmed",
        description: "Top two floors completely covered in gold leaf reflecting onto Kyoko-chi pond.",
        notes: "Gate opens 09:00. Arrive at ticket pavilion at 08:45."
      },
      {
        id: "act-6-2",
        timeSlot: "11:00 – 13:00",
        title: "Ryoan-ji Dry Landscape Zen Rock Garden",
        category: "Culture",
        location: "Ryoanji Goryonoshitacho",
        coordinates: "35.0345° N, 135.7182° E",
        duration: "2 hrs",
        elevation: "98m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "15 enigmatic stones placed on raked white gravel; only 14 visible from any single vantage.",
        notes: "Sit along wooden veranda for meditation."
      }
    ]
  },
  {
    dayNumber: 7,
    date: "2026-04-03",
    title: "Nara Deer Sanctuary & Todai-ji Great Buddha",
    theme: "Ancient Imperial Excursion",
    sunrise: "05:45 AM",
    sunset: "06:24 PM",
    goldenHour: "05:47 PM",
    weather: "Breezy & Sunny",
    tempRange: "10°C – 19°C",
    activities: [
      {
        id: "act-7-1",
        timeSlot: "08:15 – 09:15",
        title: "Kintetsu Limited Express to Nara",
        category: "Transit",
        location: "Kyoto Station Platform 1",
        coordinates: "34.9858° N, 135.7588° E",
        duration: "45 min",
        elevation: "31m → 64m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Scenic southern line passing Uji tea valleys into ancient 8th-century capital.",
        notes: "Seats reserved in car 2."
      },
      {
        id: "act-7-2",
        timeSlot: "09:45 – 13:00",
        title: "Todai-ji Daibutsuden & Kasuga Taisha Lantern Woods",
        category: "Heritage",
        location: "Nara Park",
        coordinates: "34.6851° N, 135.8398° E",
        duration: "3 hrs 15 min",
        elevation: "92m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "World's largest wooden building sheltering 15-meter bronze Buddha, surrounded by sacred free-roaming deer.",
        notes: "Deer senbei crackers available for 200 yen."
      }
    ]
  },
  {
    dayNumber: 8,
    date: "2026-04-04",
    title: "Kurama & Kibune Forest Ridge Hike",
    theme: "Sacred Cedar Mountain Traverse",
    sunrise: "05:43 AM",
    sunset: "06:25 PM",
    goldenHour: "05:49 PM",
    weather: "Mountain Chill & High Cloud",
    tempRange: "5°C – 15°C",
    activities: [
      {
        id: "act-8-1",
        timeSlot: "08:30 – 12:30",
        title: "Kurama-dera Tengu Peak to Kibune Ridge Trail",
        category: "Nature",
        location: "Northern Mountains, Kurama",
        coordinates: "35.1180° N, 135.7810° E",
        duration: "4 hrs",
        elevation: "240m → 570m Ridge Pass",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Mountain trail weaving through ancient roots, cedar groves, and shrines dedicated to Mountain Spirits.",
        notes: "Offline GPX topo map active. Sturdy hiking boots required."
      },
      {
        id: "act-8-2",
        timeSlot: "13:00 – 15:00",
        title: "Kawadoko Riverside Platform Dining in Kibune",
        category: "Dining",
        location: "Kibune River, Sakyo Ward",
        coordinates: "35.1215° N, 135.7628° E",
        duration: "2 hrs",
        elevation: "280m",
        crowdLevel: "Low",
        status: "optimized",
        description: "Dining on wooden decks suspended inches above rushing mountain water.",
        notes: "Sweet grilled ayu fish specialty."
      }
    ]
  },
  {
    dayNumber: 9,
    date: "2026-04-05",
    title: "Ohara Rural Hamlet & Sanzen-in Moss Garden",
    theme: "Peaceful Northern Countryside",
    sunrise: "05:42 AM",
    sunset: "06:26 PM",
    goldenHour: "05:51 PM",
    weather: "Misty Rain",
    tempRange: "7°C – 14°C",
    activities: [
      {
        id: "act-9-1",
        timeSlot: "09:30 – 12:30",
        title: "Sanzen-in Temple Cedar Lawn & Warabe Jizo Statues",
        category: "Culture",
        location: "Ohara, Sakyo Ward",
        coordinates: "35.1218° N, 135.8344° E",
        duration: "3 hrs",
        elevation: "280m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Hidden moss lawn with miniature smiling stone Jizo figures resting under giant Japanese cedar trees.",
        notes: "Warm shiso tea served to guests."
      }
    ]
  },
  {
    dayNumber: 10,
    date: "2026-04-06",
    title: "Daitoku-ji Zen Sub-temples & Uji Green Tea",
    theme: "Matcha Culture & Wabi-Sabi",
    sunrise: "05:40 AM",
    sunset: "06:27 PM",
    goldenHour: "05:52 PM",
    weather: "Clear Spring Air",
    tempRange: "9°C – 19°C",
    activities: [
      {
        id: "act-10-1",
        timeSlot: "09:00 – 11:30",
        title: "Daisen-in Stone Stream & Daitoku-ji Grounds",
        category: "Culture",
        location: "Murasakino, Kita Ward",
        coordinates: "35.0442° N, 135.7444° E",
        duration: "2.5 hrs",
        elevation: "65m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Zen master allegory garden depicting life's river journey through rapids and calm seas.",
        notes: "Very quiet complex with 22 sub-temples."
      }
    ]
  },
  {
    dayNumber: 11,
    date: "2026-04-07",
    title: "Kiyomizu-dera Dawn Balcony & Higashiyama Ridge",
    theme: "Panoramic Clifftop Climax",
    sunrise: "05:39 AM",
    sunset: "06:28 PM",
    goldenHour: "05:54 PM",
    weather: "Golden Sunlight",
    tempRange: "10°C – 22°C",
    activities: [
      {
        id: "act-11-1",
        timeSlot: "06:00 – 08:30",
        title: "Kiyomizu-dera Clifftop Wooden Stage at Sunrise",
        category: "Culture",
        location: "Kiyomizu 1-chome, Higashiyama",
        coordinates: "34.9949° N, 135.7850° E",
        duration: "2.5 hrs",
        elevation: "185m Clifftop",
        crowdLevel: "Low",
        status: "confirmed",
        image: "/images/stitch/saved-kiyomizu-dera.jpg",
        description: "13-meter high cantilevered wooden stage built without nails, hovering over hillside cherry blossom canopies.",
        notes: "Drink from Otowa waterfall three sacred streams."
      },
      {
        id: "act-11-2",
        timeSlot: "09:00 – 11:00",
        title: "Sannen-zaka & Ninen-zaka Preserved Streets",
        category: "Heritage",
        location: "Higashiyama Historic Quarter",
        coordinates: "34.9982° N, 135.7818° E",
        duration: "2 hrs",
        elevation: "95m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Flagstone slopes lined with traditional wooden machiya townhouses and tea craft shops.",
        notes: "Visit ancient Yasaka Pagoda viewspot."
      }
    ]
  },
  {
    dayNumber: 12,
    date: "2026-04-08",
    title: "Farewell Kamo River Stroll & Shinkansen Nozomi Departure",
    theme: "Expedition Wrap-up & High-Speed Transit",
    sunrise: "05:37 AM",
    sunset: "06:29 PM",
    goldenHour: "05:56 PM",
    weather: "Gentle Spring Sky",
    tempRange: "12°C – 20°C",
    activities: [
      {
        id: "act-12-1",
        timeSlot: "09:00 – 10:30",
        title: "Kamo River Delta Stepping Stones & Farewell Soba",
        category: "Nature",
        location: "Kamigamo delta",
        coordinates: "35.0305° N, 135.7719° E",
        duration: "90 min",
        elevation: "55m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Crossing the turtle-shaped stepping stones where Kamo and Takano rivers converge.",
        notes: "Pack luggage and complete ryokan checkout by 11:00."
      },
      {
        id: "act-12-2",
        timeSlot: "11:45 – 14:03",
        title: "JR Shinkansen Nozomi #23 (Kyoto → Tokyo)",
        category: "Transit",
        location: "Kyoto Station Shinkansen Track 12",
        coordinates: "34.9854° N, 135.7589° E",
        duration: "2 hrs 18 min",
        elevation: "High Speed (285 km/h)",
        crowdLevel: "Moderate",
        status: "confirmed",
        image: "/images/stitch/document-mount-fuji-shinkansen.jpg",
        description: "Bullet train departure Car 7, Seat 14-E. Mount Fuji view on port (left) side near Shizuoka.",
        notes: "Offline Aztec barcode pass ready in TrailMind Wallet."
      }
    ]
  }
];

export const ladakh7DayItinerary: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: "2026-06-15",
    title: "Arrival in Leh & Critical High-Altitude Acclimatization",
    theme: "Rest & Hydration (3,500m)",
    sunrise: "05:15 AM",
    sunset: "07:30 PM",
    goldenHour: "06:45 PM",
    weather: "High Desert Sun",
    tempRange: "8°C – 24°C",
    activities: [
      {
        id: "lad-1-1",
        timeSlot: "09:30 – 12:00",
        title: "Kushok Bakula Rimpochee Airport Arrival & Transfer",
        category: "Transit",
        location: "Leh Airport to Old Town",
        coordinates: "34.1359° N, 77.5465° E",
        duration: "2.5 hrs",
        elevation: "3,500m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Strict medical rest requirement. Check into eco-guesthouse, hydrate with sea buckthorn juice.",
        notes: "Pulse oximeter reading: SpO2 baseline monitored."
      }
    ]
  },
  {
    dayNumber: 2,
    date: "2026-06-16",
    title: "Leh Local Sightseeing & Shanti Stupa Dusk",
    theme: "Monasteries & White Peace Stupa",
    sunrise: "05:15 AM",
    sunset: "07:31 PM",
    goldenHour: "06:46 PM",
    weather: "Clear Cobalt Sky",
    tempRange: "9°C – 25°C",
    activities: [
      {
        id: "lad-2-1",
        timeSlot: "10:00 – 13:00",
        title: "Leh Palace & Central Asian Museum Heritage",
        category: "Culture",
        location: "Namgyal Hill, Leh",
        coordinates: "34.1642° N, 77.5848° E",
        duration: "3 hrs",
        elevation: "3,560m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "17th-century former royal palace modeled after Potala in Lhasa. Panoramic view over Indus valley.",
        notes: "Paced stair climbing to prevent mountain sickness."
      },
      {
        id: "lad-2-2",
        timeSlot: "17:30 – 19:30",
        title: "Shanti Stupa Sunset Over Zanskar Range",
        category: "Culture",
        location: "Chanspa, Leh",
        coordinates: "34.1678° N, 77.5681° E",
        duration: "2 hrs",
        elevation: "3,650m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "White-domed Buddhist stupa providing sunset view over snow-capped Stok Kangri summits.",
        notes: "Cold wind develops rapidly after sundown. Windbreaker required."
      }
    ]
  },
  {
    dayNumber: 3,
    date: "2026-06-17",
    title: "Magnetic Hill & Gurudwara Pathar Sahib",
    theme: "Indus River Confluence & Optical Anomalies",
    sunrise: "05:15 AM",
    sunset: "07:32 PM",
    goldenHour: "06:47 PM",
    weather: "Breezy & Warm",
    tempRange: "10°C – 26°C",
    activities: [
      {
        id: "lad-3-1",
        timeSlot: "09:00 – 12:00",
        title: "Magnetic Hill Gravity Anomaly & Gurudwara Pathar Sahib",
        category: "Nature",
        location: "Leh-Kargil Highway NH1",
        coordinates: "34.1952° N, 77.3528° E",
        duration: "3 hrs",
        elevation: "3,350m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Experience optical gravity hill where vehicles appear to roll uphill. Hot langar tea at Sikh temple.",
        notes: "Fill expedition water bottles with fresh Himalayan spring water."
      },
      {
        id: "lad-3-2",
        timeSlot: "13:30 – 16:30",
        title: "Sangam (Confluence of Indus and Zanskar Rivers)",
        category: "Nature",
        location: "Nimmu Confluence",
        coordinates: "34.1648° N, 77.3308° E",
        duration: "3 hrs",
        elevation: "3,150m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Dramatic meeting of turquoise Indus and muddy brown Zanskar waters carving steep canyon gorges.",
        notes: "Cellular signal drops completely past Nimmu."
      }
    ]
  },
  {
    dayNumber: 4,
    date: "2026-06-18",
    title: "Khardung La High Pass to Nubra Valley",
    theme: "Crossing 5,359m Pass to Sand Dunes",
    sunrise: "05:14 AM",
    sunset: "07:33 PM",
    goldenHour: "06:48 PM",
    weather: "Pass Snow Flurries / Valley Heat",
    tempRange: "-2°C Pass to 28°C Dunes",
    activities: [
      {
        id: "lad-4-1",
        timeSlot: "07:00 – 11:30",
        title: "Khardung La Summit Traverse (5,359m / 17,582 ft)",
        category: "Transit",
        location: "Ladakh Range Crest",
        coordinates: "34.2787° N, 77.6047° E",
        duration: "4.5 hrs",
        elevation: "5,359m Highest Road Point",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "One of the highest motorable mountain passes on Earth. Prayer flags whipping in high-altitude gale.",
        notes: "Do not stop at top longer than 20 minutes due to thin oxygen."
      },
      {
        id: "lad-4-2",
        timeSlot: "15:00 – 18:30",
        title: "Hunder White Sand Dunes & Bactrian Camel Trek",
        category: "Nature",
        location: "Hunder, Nubra Valley",
        coordinates: "34.5768° N, 77.4682° E",
        duration: "3.5 hrs",
        elevation: "3,048m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Cold desert dunes framed by jagged snow peaks, home to double-humped Silk Road camel caravans.",
        notes: "Off-grid satellite SOS telemetry active."
      }
    ]
  },
  {
    dayNumber: 5,
    date: "2026-06-19",
    title: "Pangong Tso Alpine Lake Expedition",
    theme: "Endorheic Saline Lake at 4,350m",
    sunrise: "05:14 AM",
    sunset: "07:33 PM",
    goldenHour: "06:49 PM",
    weather: "Intense Solar UV & Stiff Wind",
    tempRange: "2°C – 18°C",
    activities: [
      {
        id: "lad-5-1",
        timeSlot: "08:00 – 14:00",
        title: "Shyok River Route to Pangong Tso Lake",
        category: "Transit",
        location: "Nubra to Pangong via Durbuk",
        coordinates: "33.7595° N, 78.6674° E",
        duration: "6 hrs",
        elevation: "3,048m → 4,350m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Rugged riverbed route flanked by barren granite mountains leading to 134-kilometer color-shifting lake.",
        notes: "Strict military checkpost; inner line permits inspected."
      },
      {
        id: "lad-5-2",
        timeSlot: "16:00 – 19:30",
        title: "Pangong Shoreline Sunset & Stargazing Camp",
        category: "Nature",
        location: "Spangmik, Pangong Tso",
        coordinates: "33.9125° N, 78.5085° E",
        duration: "3.5 hrs",
        elevation: "4,350m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "Deep sapphire blue water shifting to violet and amber at dusk. Zero light pollution Milky Way view.",
        notes: "Thermal sleeping gear required; night temperatures plunge near freezing."
      }
    ]
  },
  {
    dayNumber: 6,
    date: "2026-06-20",
    title: "Chang La Pass Descent & Thiksey Monastery",
    theme: "Return to Indus Valley & Chanting Monks",
    sunrise: "05:15 AM",
    sunset: "07:34 PM",
    goldenHour: "06:50 PM",
    weather: "High Pass Frost to Sunny Valley",
    tempRange: "0°C – 22°C",
    activities: [
      {
        id: "lad-6-1",
        timeSlot: "08:00 – 12:00",
        title: "Chang La Pass Crossing (5,360m)",
        category: "Transit",
        location: "Chang La Summit",
        coordinates: "34.0478° N, 77.9304° E",
        duration: "4 hrs",
        elevation: "5,360m",
        crowdLevel: "Low",
        status: "confirmed",
        description: "High mountain pass descent back into Indus valley, flanked by frozen glaciers and yak pastures.",
        notes: "Military tea post serves complimentary warm black tea."
      },
      {
        id: "lad-6-2",
        timeSlot: "14:00 – 16:30",
        title: "Thiksey Monastery Maitreya Buddha Shrine",
        category: "Culture",
        location: "Thiksey, Indus Valley",
        coordinates: "34.0583° N, 77.6667° E",
        duration: "2.5 hrs",
        elevation: "3,600m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "12-story red and white gompa complex housing magnificent two-story tall Future Buddha statue.",
        notes: "Afternoon butter lamp puja chants commence at 15:00."
      }
    ]
  },
  {
    dayNumber: 7,
    date: "2026-06-21",
    title: "Leh Old Market & Departure Preparations",
    theme: "Pashmina, Apricots & Flight Departure",
    sunrise: "05:15 AM",
    sunset: "07:34 PM",
    goldenHour: "06:50 PM",
    weather: "Warm & Clear",
    tempRange: "11°C – 25°C",
    activities: [
      {
        id: "lad-7-1",
        timeSlot: "09:00 – 11:30",
        title: "Leh Main Bazaar Spices & Wild Apricot Oil Provisions",
        category: "Dining",
        location: "Main Bazaar Road, Leh",
        coordinates: "34.1625° N, 77.5833° E",
        duration: "2.5 hrs",
        elevation: "3,500m",
        crowdLevel: "Moderate",
        status: "confirmed",
        description: "Organic dried apricots, yak cheese chhurpi, and handwoven Tibetan prayer scarves.",
        notes: "Pack luggage for security-intensive Leh airport inspection."
      },
      {
        id: "lad-7-2",
        timeSlot: "13:00 – 15:30",
        title: "Departure Flight IX-194 to Delhi",
        category: "Transit",
        location: "Leh Airport (IXL)",
        coordinates: "34.1359° N, 77.5465° E",
        duration: "2.5 hrs",
        elevation: "Airborne above Himalayas",
        crowdLevel: "High",
        status: "confirmed",
        description: "Spectacular aerial climb over snow peaks of Greater Himalayas and Pir Panjal range.",
        notes: "Window seats on left side provide mountain views."
      }
    ]
  }
];
