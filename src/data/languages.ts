export interface PhraseItem {
  id: string;
  category: "Transport & Taxi" | "Emergency & Medical" | "Dining & Dietary" | "Lodging & Ryokan" | "Direction & Trail";
  english: string;
  japaneseKanji: string;
  japaneseFurigana: string;
  romaji: string;
  contextNote: string;
  audioKey: string;
  isSavedForOfflineFlashcard: boolean;
}

export const samplePhrases: PhraseItem[] = [
  {
    id: "phr-01",
    category: "Transport & Taxi",
    english: "Please take me to Ryokan Motonaga in Higashiyama near Ishibei-koji.",
    japaneseKanji: "東山の石塀小路近くの「元奈古旅館」までお願いします。",
    japaneseFurigana: "ひがしやま の いしべいこうじ ちかく の もとなご りょかん まで おねがいします。",
    romaji: "Higashiyama no Ishibei-kōji chikaku no 'Motonaga Ryokan' made onegaishimasu.",
    contextNote: "High-contrast taxi night display card with street landmark reference.",
    audioKey: "audio_taxi_motonaga",
    isSavedForOfflineFlashcard: true
  },
  {
    id: "phr-02",
    category: "Emergency & Medical",
    english: "I have a severe peanut allergy. Does this dish contain peanuts or peanut oil?",
    japaneseKanji: "重度の落花生（ピーナッツ）アレルギーがあります。落花生やピーナッツ油は入っていますか？",
    japaneseFurigana: "じゅうど の らっかせい（ピーナッツ）アレルギー が あります。らっかせい や ピーナッツ ゆ は はいっています か？",
    romaji: "Jūdo no peanut allergy ga arimasu. Rakkasei ya peanut-yu wa haitte imasu ka?",
    contextNote: "Critical emergency allergy declaration card. Show directly to chef or waitstaff.",
    audioKey: "audio_allergy_peanut",
    isSavedForOfflineFlashcard: true
  },
  {
    id: "phr-03",
    category: "Emergency & Medical",
    english: "Please call an ambulance immediately. I need urgent medical attention.",
    japaneseKanji: "すぐに救急車を呼んでください。至急の医療手当てが必要です。",
    japaneseFurigana: "すぐ に きゅうきゅうしゃ を よんで ください。しきゅう の いりょう てあて が ひつよう です。",
    romaji: "Sugu ni kyūkyūsha o yonde kudasai. Shikyū no iryō teate ga hitsuyō desu.",
    contextNote: "Life-safety emergency prompt with kanji card.",
    audioKey: "audio_emergency_ambulance",
    isSavedForOfflineFlashcard: true
  },
  {
    id: "phr-04",
    category: "Transport & Taxi",
    english: "Which platform does the Haruka Express for Kansai Airport depart from?",
    japaneseKanji: "関西空港行きの「はるか号」は何番線から発車しますか？",
    japaneseFurigana: "かんさい くうこう いき の はるか ごう は なん ばんせん から はっしゃ します か？",
    romaji: "Kansai Kūkō iki no 'Haruka-gō' wa nan-bansen kara hassha shimasu ka?",
    contextNote: "Used inside Kyoto Station transit concourse.",
    audioKey: "audio_transit_haruka",
    isSavedForOfflineFlashcard: true
  },
  {
    id: "phr-05",
    category: "Dining & Dietary",
    english: "We would like two bowls of hot kitsune soba and hot hojicha, please.",
    japaneseKanji: "温かいきつね蕎麦を二杯と、温かいほうじ茶をお願いします。",
    japaneseFurigana: "あたたかい きつね そば を にはい と、あたたかい ほうじちゃ を おねがいします。",
    romaji: "Atatakai kitsune soba o ni-hai to, atatakai hōjicha o onegaishimasu.",
    contextNote: "Traditional noodle house order phrasing.",
    audioKey: "audio_dining_soba",
    isSavedForOfflineFlashcard: false
  },
  {
    id: "phr-06",
    category: "Direction & Trail",
    english: "Is this the correct mountain trail heading up toward Kurama-dera summit?",
    japaneseKanji: "この登山道は鞍馬寺の山頂へ向かう道で合っていますか？",
    japaneseFurigana: "この とざんどう は くらまでら の さんちょう え むかう みち で あっています か？",
    romaji: "Kono tozandō wa Kurama-dera no sanchō e mukau michi de atte imasu ka?",
    contextNote: "Trail verification for hikers when leaving Kibune river gorge.",
    audioKey: "audio_trail_kurama",
    isSavedForOfflineFlashcard: true
  },
  {
    id: "phr-07",
    category: "Lodging & Ryokan",
    english: "Could you please hold our luggage until our evening train departure?",
    japaneseKanji: "夕方の電車の時間まで、荷物を預かっていただけますか？",
    japaneseFurigana: "ゆうがた の でんしゃ の じかん まで、にもつ を あずかって いただけます か？",
    romaji: "Yūgata no densha no jikan made, nimotsu o azukatte itadakemasu ka?",
    contextNote: "Morning checkout request at traditional inns.",
    audioKey: "audio_hotel_luggage",
    isSavedForOfflineFlashcard: false
  }
];
