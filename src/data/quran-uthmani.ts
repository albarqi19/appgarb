import quranData from 'quran-json/dist/quran.json';

// تعديل الواجهات لتتناسب مع النص العثماني
export interface UthmaniWord {
  text: string;
  transliteration?: string;
  meaning?: string;
  position: number;
}

export interface UthmaniAyah {
  number: number;
  surahId: number;
  text: string;
  textUthmani: string; // النص بالرسم العثماني
  words: UthmaniWord[];
  translation?: string;
  tafsir?: string;
}

export interface UthmaniSurah {
  id: number;
  name: string;
  englishName: string;
  arabicName: string;
  nameArabic: string;
  nameUthmani: string; // اسم السورة بالرسم العثماني
  totalAyahs: number;
  type: 'meccan' | 'medinan';
  orderInRevelation: number;
  relevance?: number;
}

// دالة لتحويل النص إلى كلمات منفصلة
function splitTextIntoWords(text: string): UthmaniWord[] {
  const words = text.trim().split(/\s+/);
  return words.map((word, index) => ({
    text: word,
    position: index + 1
  }));
}

// تحويل بيانات المكتبة إلى الشكل المطلوب
export const uthmaniSurahs: UthmaniSurah[] = (quranData as any[]).map((surah: any) => ({
  id: surah.id,
  name: surah.transliteration,
  englishName: surah.transliteration,
  arabicName: surah.name,
  nameArabic: surah.name,
  nameUthmani: surah.name, // يمكن تحسينها لاحقاً بالرسم العثماني الصحيح
  totalAyahs: surah.total_verses,
  type: surah.type === 'meccan' ? 'meccan' : 'medinan',
  orderInRevelation: surah.id,
}));

// تحويل الآيات إلى الشكل المطلوب مع النص العثماني
export const uthmaniAyahs: { [surahId: number]: UthmaniAyah[] } = {};

// بيانات عثمانية محسنة لسورة البقرة كمثال
const improvedUthmaniData: { [surahId: number]: { ayahNumber: number, uthmaniText: string, words: string[] }[] } = {
  2: [ // سورة البقرة
    {
      ayahNumber: 6,
      uthmaniText: "إِنَّ ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ",
      words: ["إِنَّ", "ٱلَّذِينَ", "كَفَرُوا۟", "سَوَآءٌ", "عَلَيْهِمْ", "ءَأَنذَرْتَهُمْ", "أَمْ", "لَمْ", "تُنذِرْهُمْ", "لَا", "يُؤْمِنُونَ"]
    },
    {
      ayahNumber: 7,
      uthmaniText: "خَتَمَ ٱللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَٰرِهِمْ غِشَٰوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ",
      words: ["خَتَمَ", "ٱللَّهُ", "عَلَىٰ", "قُلُوبِهِمْ", "وَعَلَىٰ", "سَمْعِهِمْ", "ۖ", "وَعَلَىٰ", "أَبْصَٰرِهِمْ", "غِشَٰوَةٌ", "ۖ", "وَلَهُمْ", "عَذَابٌ", "عَظِيمٌ"]
    },
    {
      ayahNumber: 8,
      uthmaniText: "وَمِنَ ٱلنَّاسِ مَن يَقُولُ ءَامَنَّا بِٱللَّهِ وَبِٱلْيَوْمِ ٱلْءَاخِرِ وَمَا هُم بِمُؤْمِنِينَ",
      words: ["وَمِنَ", "ٱلنَّاسِ", "مَن", "يَقُولُ", "ءَامَنَّا", "بِٱللَّهِ", "وَبِٱلْيَوْمِ", "ٱلْءَاخِرِ", "وَمَا", "هُم", "بِمُؤْمِنِينَ"]
    },
    {
      ayahNumber: 9,
      uthmaniText: "يُخَٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ",
      words: ["يُخَٰدِعُونَ", "ٱللَّهَ", "وَٱلَّذِينَ", "ءَامَنُوا۟", "وَمَا", "يَخْدَعُونَ", "إِلَّآ", "أَنفُسَهُمْ", "وَمَا", "يَشْعُرُونَ"]
    },
    {
      ayahNumber: 10,
      uthmaniText: "فِى قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ ٱللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا۟ يَكْذِبُونَ",
      words: ["فِى", "قُلُوبِهِم", "مَّرَضٌ", "فَزَادَهُمُ", "ٱللَّهُ", "مَرَضًا", "ۖ", "وَلَهُمْ", "عَذَابٌ", "أَلِيمٌۢ", "بِمَا", "كَانُوا۟", "يَكْذِبُونَ"]
    }
  ],
  1: [ // سورة الفاتحة
    {
      ayahNumber: 1,
      uthmaniText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      words: ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"]
    },
    {
      ayahNumber: 2,
      uthmaniText: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
      words: ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"]
    },
    {
      ayahNumber: 3,
      uthmaniText: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      words: ["ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"]
    }
  ]
};

(quranData as any[]).forEach((surah: any) => {
  const improvedSurahData = improvedUthmaniData[surah.id];
  
  uthmaniAyahs[surah.id] = surah.verses.map((ayah: any) => {
    // البحث عن البيانات المحسنة لهذه الآية
    const improvedAyah = improvedSurahData?.find(improved => improved.ayahNumber === ayah.id);
    
    if (improvedAyah) {
      // استخدام النص العثماني المحسن
      return {
        number: ayah.id,
        surahId: surah.id,
        text: ayah.text,
        textUthmani: improvedAyah.uthmaniText,
        words: improvedAyah.words.map((word, index) => ({
          text: word,
          position: index + 1
        })),
        translation: undefined,
      };
    } else {
      // استخدام البيانات الأصلية مع تحسينات بسيطة
      return {
        number: ayah.id,
        surahId: surah.id,
        text: ayah.text,
        textUthmani: ayah.text,
        words: splitTextIntoWords(ayah.text),
        translation: undefined,
      };
    }
  });
});

// دوال مساعدة للوصول للبيانات
export function getSurahById(id: number): UthmaniSurah | undefined {
  return uthmaniSurahs.find(surah => surah.id === id);
}

export function getAyahsBySurahId(surahId: number): UthmaniAyah[] {
  return uthmaniAyahs[surahId] || [];
}

export function getAyahByNumber(surahId: number, ayahNumber: number): UthmaniAyah | undefined {
  const ayahs = getAyahsBySurahId(surahId);
  return ayahs.find(ayah => ayah.number === ayahNumber);
}

export function getWordsByAyah(surahId: number, ayahNumber: number): UthmaniWord[] {
  const ayah = getAyahByNumber(surahId, ayahNumber);
  return ayah?.words || [];
}

// فلترة السور حسب النوع
export function getSurahsByType(type: 'meccan' | 'medinan'): UthmaniSurah[] {
  return uthmaniSurahs.filter(surah => surah.type === type);
}

// البحث في النص
export function searchInQuran(query: string): { surah: UthmaniSurah; ayah: UthmaniAyah }[] {
  const results: { surah: UthmaniSurah; ayah: UthmaniAyah }[] = [];
  
  uthmaniSurahs.forEach(surah => {
    const ayahs = getAyahsBySurahId(surah.id);
    ayahs.forEach(ayah => {
      if (ayah.text.includes(query) || ayah.textUthmani.includes(query)) {
        results.push({ surah, ayah });
      }
    });
  });
  
  return results;
}

// إحصائيات القرآن
export const quranStats = {
  totalSurahs: uthmaniSurahs.length,
  totalAyahs: Object.values(uthmaniAyahs).reduce((total, ayahs) => total + ayahs.length, 0),
  meccanSurahs: getSurahsByType('meccan').length,
  medinanSurahs: getSurahsByType('medinan').length,
};

export default {
  surahs: uthmaniSurahs,
  ayahs: uthmaniAyahs,
  getSurahById,
  getAyahsBySurahId,
  getAyahByNumber,
  getWordsByAyah,
  getSurahsByType,
  searchInQuran,
  stats: quranStats,
};
