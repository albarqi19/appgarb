export interface Surah {
  id: number;
  name: string;
  englishName: string;
  arabicName: string;
  totalAyahs: number;
  relevance?: number; // للتوصيات بناءً على الذكاء الاصطناعي
}

export interface Ayah {
  number: number;
  surahId: number;
  text: string;
  words: string[];
}

// قائمة السور
export const surahs: Surah[] = [
  { id: 1, name: "Al-Fatihah", englishName: "The Opening", arabicName: "الفاتحة", totalAyahs: 7 },
  { id: 2, name: "Al-Baqarah", englishName: "The Cow", arabicName: "البقرة", totalAyahs: 286 },
  { id: 3, name: "Aal-Imran", englishName: "The Family of Imran", arabicName: "آل عمران", totalAyahs: 200 },
  { id: 4, name: "An-Nisa", englishName: "The Women", arabicName: "النساء", totalAyahs: 176 },
  { id: 5, name: "Al-Ma'idah", englishName: "The Table Spread", arabicName: "المائدة", totalAyahs: 120 },
  { id: 6, name: "Al-An'am", englishName: "The Cattle", arabicName: "الأنعام", totalAyahs: 165 },
  { id: 7, name: "Al-A'raf", englishName: "The Heights", arabicName: "الأعراف", totalAyahs: 206 },
  { id: 8, name: "Al-Anfal", englishName: "The Spoils of War", arabicName: "الأنفال", totalAyahs: 75 },
  { id: 9, name: "At-Tawbah", englishName: "The Repentance", arabicName: "التوبة", totalAyahs: 129 },
  { id: 10, name: "Yunus", englishName: "Jonah", arabicName: "يونس", totalAyahs: 109 },
  { id: 11, name: "Hud", englishName: "Hud", arabicName: "هود", totalAyahs: 123 },
  { id: 12, name: "Yusuf", englishName: "Joseph", arabicName: "يوسف", totalAyahs: 111 },
  { id: 13, name: "Ar-Ra'd", englishName: "The Thunder", arabicName: "الرعد", totalAyahs: 43 },
  { id: 14, name: "Ibrahim", englishName: "Abraham", arabicName: "إبراهيم", totalAyahs: 52 },
  { id: 15, name: "Al-Hijr", englishName: "The Rocky Tract", arabicName: "الحجر", totalAyahs: 99 },
  { id: 16, name: "An-Nahl", englishName: "The Bee", arabicName: "النحل", totalAyahs: 128 },
  { id: 17, name: "Al-Isra", englishName: "The Night Journey", arabicName: "الإسراء", totalAyahs: 111 },
  { id: 18, name: "Al-Kahf", englishName: "The Cave", arabicName: "الكهف", totalAyahs: 110 },
  { id: 19, name: "Maryam", englishName: "Mary", arabicName: "مريم", totalAyahs: 98 },
  { id: 20, name: "Ta-Ha", englishName: "Ta-Ha", arabicName: "طه", totalAyahs: 135 },
  { id: 36, name: "Ya-Sin", englishName: "Ya-Sin", arabicName: "يس", totalAyahs: 83 },
  { id: 112, name: "Al-Ikhlas", englishName: "The Sincerity", arabicName: "الإخلاص", totalAyahs: 4 },
  { id: 113, name: "Al-Falaq", englishName: "The Daybreak", arabicName: "الفلق", totalAyahs: 5 },
  { id: 114, name: "An-Nas", englishName: "The Mankind", arabicName: "الناس", totalAyahs: 6 }
  // يمكن إضافة باقي السور حسب الحاجة
];

// بعض الآيات لأغراض العرض
export const ayahs: { [surahId: number]: Ayah[] } = {
  1: [
    { 
      number: 1, 
      surahId: 1, 
      text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      words: ["بِسْمِ", "اللَّهِ", "الرَّحْمَنِ", "الرَّحِيمِ"]
    },
    { 
      number: 2, 
      surahId: 1, 
      text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      words: ["الْحَمْدُ", "لِلَّهِ", "رَبِّ", "الْعَالَمِينَ"]
    },
    { 
      number: 3, 
      surahId: 1, 
      text: "الرَّحْمَنِ الرَّحِيمِ",
      words: ["الرَّحْمَنِ", "الرَّحِيمِ"]
    },
    { 
      number: 4, 
      surahId: 1, 
      text: "مَالِكِ يَوْمِ الدِّينِ",
      words: ["مَالِكِ", "يَوْمِ", "الدِّينِ"]
    },
    { 
      number: 5, 
      surahId: 1, 
      text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      words: ["إِيَّاكَ", "نَعْبُدُ", "وَإِيَّاكَ", "نَسْتَعِينُ"]
    },
    { 
      number: 6, 
      surahId: 1, 
      text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      words: ["اهْدِنَا", "الصِّرَاطَ", "الْمُسْتَقِيمَ"]
    },
    { 
      number: 7, 
      surahId: 1, 
      text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      words: ["صِرَاطَ", "الَّذِينَ", "أَنْعَمْتَ", "عَلَيْهِمْ", "غَيْرِ", "الْمَغْضُوبِ", "عَلَيْهِمْ", "وَلَا", "الضَّالِّينَ"]
    }
  ],
  2: [
    { 
      number: 1, 
      surahId: 2, 
      text: "الم",
      words: ["الم"]
    },
    { 
      number: 2, 
      surahId: 2, 
      text: "ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ",
      words: ["ذَلِكَ", "الْكِتَابُ", "لَا", "رَيْبَ", "فِيهِ", "هُدًى", "لِلْمُتَّقِينَ"]
    },
    { 
      number: 3, 
      surahId: 2, 
      text: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ",
      words: ["الَّذِينَ", "يُؤْمِنُونَ", "بِالْغَيْبِ", "وَيُقِيمُونَ", "الصَّلَاةَ", "وَمِمَّا", "رَزَقْنَاهُمْ", "يُنْفِقُونَ"]
    },
    { 
      number: 4, 
      surahId: 2, 
      text: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
      words: ["وَالَّذِينَ", "يُؤْمِنُونَ", "بِمَا", "أُنْزِلَ", "إِلَيْكَ", "وَمَا", "أُنْزِلَ", "مِنْ", "قَبْلِكَ", "وَبِالْآخِرَةِ", "هُمْ", "يُوقِنُونَ"]
    },    { 
      number: 5, 
      surahId: 2, 
      text: "أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ",
      words: ["أُولَئِكَ", "عَلَى", "هُدًى", "مِنْ", "رَبِّهِمْ", "وَأُولَئِكَ", "هُمُ", "الْمُفْلِحُونَ"]
    },
    { 
      number: 6, 
      surahId: 2, 
      text: "إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنْذَرْتَهُمْ أَمْ لَمْ تُنْذِرْهُمْ لَا يُؤْمِنُونَ",
      words: ["إِنَّ", "الَّذِينَ", "كَفَرُوا", "سَوَاءٌ", "عَلَيْهِمْ", "أَأَنْذَرْتَهُمْ", "أَمْ", "لَمْ", "تُنْذِرْهُمْ", "لَا", "يُؤْمِنُونَ"]
    },
    { 
      number: 7, 
      surahId: 2, 
      text: "خَتَمَ اللَّهُ عَلَى قُلُوبِهِمْ وَعَلَى سَمْعِهِمْ وَعَلَى أَبْصَارِهِمْ غِشَاوَةٌ وَلَهُمْ عَذَابٌ عَظِيمٌ",
      words: ["خَتَمَ", "اللَّهُ", "عَلَى", "قُلُوبِهِمْ", "وَعَلَى", "سَمْعِهِمْ", "وَعَلَى", "أَبْصَارِهِمْ", "غِشَاوَةٌ", "وَلَهُمْ", "عَذَابٌ", "عَظِيمٌ"]
    },
    { 
      number: 8, 
      surahId: 2, 
      text: "وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُمْ بِمُؤْمِنِينَ",
      words: ["وَمِنَ", "النَّاسِ", "مَنْ", "يَقُولُ", "آمَنَّا", "بِاللَّهِ", "وَبِالْيَوْمِ", "الْآخِرِ", "وَمَا", "هُمْ", "بِمُؤْمِنِينَ"]
    },
    { 
      number: 9, 
      surahId: 2, 
      text: "يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنْفُسَهُمْ وَمَا يَشْعُرُونَ",
      words: ["يُخَادِعُونَ", "اللَّهَ", "وَالَّذِينَ", "آمَنُوا", "وَمَا", "يَخْدَعُونَ", "إِلَّا", "أَنْفُسَهُمْ", "وَمَا", "يَشْعُرُونَ"]
    },
    { 
      number: 10, 
      surahId: 2, 
      text: "فِي قُلُوبِهِمْ مَرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ",
      words: ["فِي", "قُلُوبِهِمْ", "مَرَضٌ", "فَزَادَهُمُ", "اللَّهُ", "مَرَضًا", "وَلَهُمْ", "عَذَابٌ", "أَلِيمٌ", "بِمَا", "كَانُوا", "يَكْذِبُونَ"]
    }
  ],
  36: [
    { 
      number: 1, 
      surahId: 36, 
      text: "يس",
      words: ["يس"]
    },
    { 
      number: 2, 
      surahId: 36, 
      text: "وَالْقُرْآنِ الْحَكِيمِ",
      words: ["وَالْقُرْآنِ", "الْحَكِيمِ"]
    },
    { 
      number: 3, 
      surahId: 36, 
      text: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ",
      words: ["إِنَّكَ", "لَمِنَ", "الْمُرْسَلِينَ"]
    },
    { 
      number: 4, 
      surahId: 36, 
      text: "عَلَى صِرَاطٍ مُسْتَقِيمٍ",
      words: ["عَلَى", "صِرَاطٍ", "مُسْتَقِيمٍ"]
    },
    { 
      number: 5, 
      surahId: 36, 
      text: "تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ",
      words: ["تَنْزِيلَ", "الْعَزِيزِ", "الرَّحِيمِ"]
    }
  ],
  113: [
    { 
      number: 1, 
      surahId: 113, 
      text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
      words: ["قُلْ", "أَعُوذُ", "بِرَبِّ", "الْفَلَقِ"]
    },
    { 
      number: 2, 
      surahId: 113, 
      text: "مِنْ شَرِّ مَا خَلَقَ",
      words: ["مِنْ", "شَرِّ", "مَا", "خَلَقَ"]
    },
    { 
      number: 3, 
      surahId: 113, 
      text: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      words: ["وَمِنْ", "شَرِّ", "غَاسِقٍ", "إِذَا", "وَقَبَ"]
    },
    { 
      number: 4, 
      surahId: 113, 
      text: "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
      words: ["وَمِنْ", "شَرِّ", "النَّفَّاثَاتِ", "فِي", "الْعُقَدِ"]
    },
    { 
      number: 5, 
      surahId: 113, 
      text: "وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      words: ["وَمِنْ", "شَرِّ", "حَاسِدٍ", "إِذَا", "حَسَدَ"]
    }
  ],
  114: [
    { 
      number: 1, 
      surahId: 114, 
      text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      words: ["قُلْ", "أَعُوذُ", "بِرَبِّ", "النَّاسِ"]
    },
    { 
      number: 2, 
      surahId: 114, 
      text: "مَلِكِ النَّاسِ",
      words: ["مَلِكِ", "النَّاسِ"]
    },
    { 
      number: 3, 
      surahId: 114, 
      text: "إِلَهِ النَّاسِ",
      words: ["إِلَهِ", "النَّاسِ"]
    },
    { 
      number: 4, 
      surahId: 114, 
      text: "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
      words: ["مِنْ", "شَرِّ", "الْوَسْوَاسِ", "الْخَنَّاسِ"]
    },
    { 
      number: 5, 
      surahId: 114, 
      text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
      words: ["الَّذِي", "يُوَسْوِسُ", "فِي", "صُدُورِ", "النَّاسِ"]
    },
    { 
      number: 6, 
      surahId: 114, 
      text: "مِنَ الْجِنَّةِ وَالنَّاسِ",
      words: ["مِنَ", "الْجِنَّةِ", "وَالنَّاسِ"]
    }
  ]
};
