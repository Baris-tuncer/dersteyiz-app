export const CATEGORIES = [
  { id: 1, name: 'LGS & Ortaokul', group: 'academic' },
  { id: 2, name: 'YKS & Lise', group: 'academic' },
  { id: 3, name: 'İlkokul Temel', group: 'academic' },
  { id: 4, name: 'Sınav Koçluğu', group: 'academic' },
  { id: 5, name: 'Yabancı Dil', group: 'academic' },
  { id: 13, name: 'IELTS', group: 'academic' },
  { id: 14, name: 'TOEFL', group: 'academic' },
  { id: 6, name: 'ALES', group: 'academic' },
  { id: 7, name: 'Açık Öğretim Dersleri', group: 'academic' },
  { id: 8, name: 'Okul Öncesi / Oyun Ablalığı', group: 'special' },
  { id: 9, name: 'Özel Eğitim', group: 'special' },
  { id: 10, name: 'Pilates', group: 'special' },
  { id: 11, name: 'Personal Training', group: 'special' },
  { id: 12, name: 'Enstrüman', group: 'special' },
] as const;

export interface MajorGroup {
  title: string;
  items: string[];
}

export const MAJOR_GROUPS: MajorGroup[] = [
  {
    title: 'Akademik Dersler',
    items: [
      'Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji',
      'Türkçe', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe',
      'Hızlı Okuma',
    ],
  },
  {
    title: 'Sınav Hazırlık',
    items: ['KPSS', 'DGS', 'YDS'],
  },
  {
    title: 'Yabancı Dil',
    items: ['İngilizce', 'Almanca', 'Fransızca', 'Arapça', 'İspanyolca', 'Rusça'],
  },
  {
    title: 'Müzik & Enstrüman',
    items: ['Müzik', 'Piyano', 'Gitar', 'Keman', 'Bateri', 'Bağlama / Saz', 'Ud', 'Flüt', 'Ney'],
  },
  {
    title: 'Spor & Sağlık',
    items: ['Beden Eğitimi', 'Pilates', 'Personal Training', 'Yoga', 'Dans'],
  },
  {
    title: 'Sanat & Tasarım',
    items: ['Resim', 'Grafik Tasarım', 'Fotoğrafçılık'],
  },
  {
    title: 'Teknoloji',
    items: ['Yazılım / Kodlama', 'Dijital Pazarlama'],
  },
  {
    title: 'Çocuk & Özel Eğitim',
    items: ['Sınıf Öğretmenliği', 'Okul Öncesi Öğretmenliği', 'Özel Eğitim', 'Çocuk Gelişimi'],
  },
  {
    title: 'Kişisel Gelişim & Hobi',
    items: ['Astroloji', 'Diksiyon', 'Satranç', 'Drama / Tiyatro', 'Direksiyon Dersi'],
  },
  {
    title: 'Diğer',
    items: ['Diğer'],
  },
];

// Düz liste — geriye uyumluluk için
export const MAJORS: readonly string[] = MAJOR_GROUPS.flatMap((g) => g.items);

// Etiketler kategori grubuna göre filtrelenir
// 'academic' → akademik kategoriler (ids 1-7) + Okul Öncesi (8) + Özel Eğitim (9)
// 'music'    → Enstrüman (12)
// 'sports'   → Pilates (10), Personal Training (11)
// 'common'   → herkese gösterilir
export type TagGroup = 'academic' | 'music' | 'sports' | 'common';

export const TAGS: readonly { id: number; name: string; group: TagGroup }[] = [
  // Ortak
  { id: 8, name: 'Birebir Ders', group: 'common' },
  { id: 9, name: 'Grup Dersi', group: 'common' },
  { id: 11, name: 'Hafta Sonu Ders', group: 'common' },
  { id: 6, name: 'Sıfırdan Başlayanlar İçin', group: 'common' },
  { id: 16, name: 'Yetişkin Başlangıç', group: 'common' },
  // Akademik
  { id: 1, name: 'Sadece Soru Çözümü', group: 'academic' },
  { id: 2, name: 'Konu Anlatımı', group: 'academic' },
  { id: 3, name: 'Yeni Nesil Sorular', group: 'academic' },
  { id: 4, name: 'Derece Öğrencileri İçin', group: 'academic' },
  { id: 5, name: 'Hızlı ve Etkili Okuma', group: 'academic' },
  { id: 7, name: 'Sınava Hazırlık', group: 'academic' },
  { id: 10, name: 'Deneme Sınavı Analizi', group: 'academic' },
  { id: 12, name: 'Yoğun Kurs Programı', group: 'academic' },
  // Müzik & Sanat
  { id: 13, name: 'Nota Eğitimi', group: 'music' },
  { id: 14, name: 'Kulaktan Çalma', group: 'music' },
  { id: 15, name: 'Konservatuar Hazırlık', group: 'music' },
  { id: 17, name: 'Portfolyo Hazırlık', group: 'music' },
  { id: 18, name: 'Güzel Sanatlar Sınav Hazırlık', group: 'music' },
  // Spor & Fitness
  { id: 19, name: 'Kilo Verme Programı', group: 'sports' },
  { id: 20, name: 'Postür Düzeltme', group: 'sports' },
  { id: 21, name: 'Ev Egzersizleri', group: 'sports' },
  { id: 22, name: 'Rehabilitasyon Sonrası', group: 'sports' },
  { id: 23, name: 'Kas Geliştirme', group: 'sports' },
  { id: 24, name: 'Fonksiyonel Antrenman', group: 'sports' },
  { id: 25, name: 'Hamilelik & Doğum Sonrası', group: 'sports' },
  { id: 26, name: 'Esneklik & Mobilite', group: 'sports' },
  { id: 27, name: 'Yaşlılar İçin Egzersiz', group: 'sports' },
  { id: 28, name: 'Açık Hava Antrenmanı', group: 'sports' },
];

// Kategori ID'sine göre hangi etiket grupları gösterilecek
const CATEGORY_TAG_MAP: Record<number, TagGroup[]> = {
  1: ['academic'],   // LGS & Ortaokul
  2: ['academic'],   // YKS & Lise
  3: ['academic'],   // İlkokul Temel
  4: ['academic'],   // Sınav Koçluğu
  5: ['academic'],   // Yabancı Dil
  6: ['academic'],   // ALES
  7: ['academic'],   // Açık Öğretim
  13: ['academic'],  // IELTS
  14: ['academic'],  // TOEFL
  8: ['academic'],   // Okul Öncesi
  9: ['academic'],   // Özel Eğitim
  10: ['sports'],    // Pilates
  11: ['sports'],    // Personal Training
  12: ['music'],     // Enstrüman
};

export function getTagsForCategories(categoryIds: number[]) {
  const groups = new Set<TagGroup>(['common']);
  for (const catId of categoryIds) {
    const mapped = CATEGORY_TAG_MAP[catId];
    if (mapped) mapped.forEach((g) => groups.add(g));
  }
  return TAGS.filter((tag) => groups.has(tag.group));
}

export const TEACHING_MODES = [
  { value: 'online' as const, label: 'Online' },
  { value: 'face_to_face' as const, label: 'Yüz Yüze' },
] as const;
