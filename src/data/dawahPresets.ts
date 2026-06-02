export interface DawahPreset {
  id: string;
  category: "Quran" | "Hadith" | "Reflection";
  topic: string;
  arabic?: string;
  text: string; // English translation or core reflection
  reference: string;
}

export const DAWAH_PRESETS: DawahPreset[] = [
  {
    id: "quran-sabr-1",
    category: "Quran",
    topic: "Sabr & Hope",
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    text: "Indeed, with hardship [will be] ease.",
    reference: "Surah Al-Sharh [94:6]"
  },
  {
    id: "quran-sabr-2",
    category: "Quran",
    topic: "Sabr & Divine Company",
    arabic: "وَاصْبِرُواْ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    text: "And be patient. Indeed, Allah is with the patient.",
    reference: "Surah Al-Anfal [8:46]"
  },
  {
    id: "quran-mercy-1",
    category: "Quran",
    topic: "Mercy & Forgiveness",
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    text: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah.'",
    reference: "Surah Az-Zumar [39:53]"
  },
  {
    id: "quran-gratitude-1",
    category: "Quran",
    topic: "Shukr (Gratitude)",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    text: "If you are grateful, I will surely increase you [in favor].",
    reference: "Surah Ibrahim [14:7]"
  },
  {
    id: "quran-closeness-1",
    category: "Quran",
    topic: "Allah's Closeness",
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    text: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant.",
    reference: "Surah Al-Baqarah [2:186]"
  },
  {
    id: "quran-peace-1",
    category: "Quran",
    topic: "Inner Peace",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    text: "Unquestionably, by the remembrance of Allah do hearts find rest.",
    reference: "Surah Ar-Ra'd [13:28]"
  },
  {
    id: "hadith-mercy-1",
    category: "Hadith",
    topic: "Compassion to Creation",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ",
    text: "Those who are merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth, and the One in the heavens will have mercy upon you.",
    reference: "Sunan At-Tirmidhi [1924]"
  },
  {
    id: "hadith-character-1",
    category: "Hadith",
    topic: "Kindness",
    arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ",
    text: "Indeed, Allah is gentle and He loves gentleness in all matters.",
    reference: "Sahih Al-Bukhari [6927]"
  },
  {
    id: "hadith-faith-1",
    category: "Hadith",
    topic: "Good Character",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُوقًا",
    text: "The most perfect of believers in faith are those with the best character.",
    reference: "Sunan Abi Dawud [4682]"
  },
  {
    id: "reflection-tawakkul-1",
    category: "Reflection",
    topic: "Tawakkul (Trust)",
    text: "True peace is not found in controlling your circumstances, but in knowing that your affairs are in the hands of the Al-Wise.",
    reference: "Islamic Reflection"
  },
  {
    id: "reflection-heart-1",
    category: "Reflection",
    topic: "Sincerity (Ikhlas)",
    text: "Allah is with you in every quiet battle you fight, in every secret tear you shed, and in every effort you make to align your heart with His love.",
    reference: "Islamic Reflection"
  }
];
