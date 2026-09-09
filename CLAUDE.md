@AGENTS.md

# Dersteyiz App

Expo SDK 57 / React Native ile yazilmis Turkce ogretmen-veli marketplace uygulamasi.

## Teknoloji

- **Framework:** Expo SDK 57, React Native
- **Build:** Development build (prebuild yapildi, `npx expo run:ios`)
- **Backend:** Supabase (auth, database, storage)
- **Supabase Project Ref:** `dosuweocrtcotvsunefn`
- **Video:** expo-video (`useVideoPlayer` + `VideoView`)
- **Navigation:** React Navigation (native-stack + bottom-tabs)
- **State:** React Context (AuthContext, SubscriptionContext)

## Calistirma

```bash
# Development build (Expo Go degil)
npx expo run:ios

# EAS Build (production)
npx eas-cli build --platform ios --profile production
```

## Proje Yapisi

```
src/
  components/     # TeacherCard, FilterBar, VideoPlayerModal, Badge, FilterModal
  constants/      # colors.ts, categories.ts, cities.ts
  contexts/       # AuthContext, SubscriptionContext
  navigation/     # RootNavigator, MainTabs, AuthStack
  screens/
    HomeScreen          # Ana sayfa - veli: filtre+liste, ogretmen: dashboard+liste
    TeacherDetailScreen # Ogretmen detay sayfasi
    FavoritesScreen     # Favoriler
    auth/               # Login, Register, ProfileSetup, Welcome, ForgotPassword
    profile/            # ProfileScreen, EditProfileScreen, Settings, AdminPanel
  services/       # teacherService, storageService, reportService
  types/          # teacher.ts, navigation.ts, auth.ts
```

## Onemli Dosyalar

- `src/components/VideoPlayerModal.tsx` — expo-video ile video oynatma (Modal icinde)
- `src/components/TeacherCard.tsx` — Ogretmen kart componenti (video butonu, WhatsApp, badge'ler)
- `src/components/FilterBar.tsx` — Arama + filtre chip'leri (kategori, brans, fiyat, mod, sehir, etiket)
- `src/screens/HomeScreen.tsx` — Ogretmen icin dashboard (profil karti, istatistikler), veli icin liste+filtre
- `src/screens/auth/ProfileSetupScreen.tsx` — Ogretmen kayit formu (video yukleme dahil)
- `src/config/supabase.ts` — Supabase client (anahtarlar app.json extra'dan gelir)

## Supabase

- **URL:** https://dosuweocrtcotvsunefn.supabase.co
- **Storage Bucket'lari:** avatars, diplomas, videos
- **Onemli Tablolar:** teachers, profiles, teacher_categories, teacher_tags, teacher_modes, teacher_locations
- **Auth:** Email/password, user_metadata.role = "teacher" | "parent"

## Test Hesaplari

- **Ogretmen:** gulsahsoyupak@hotmail.com (profile_id: ca8e76c9-cf88-4fa6-8a86-5a5cfdc7b54a)
- **Veli:** veli@test.com / Test1234!

## Tasarim

- **Navy:** #1B3A5C (primary)
- **Orange:** #F07B1C (accent, fiyat)
- **Verified badge:** Navy renk MaterialIcons "verified"
- **Filter chip'leri:** flexWrap, aktif=navy bg, inaktif=beyaz+border, secim sayisi turuncu badge
- **Video butonu:** NavyLight bg, play-circle ikon + "Tanitim Videosu" text + chevron

## Bilinen Durumlar

- expo-video Expo Go'da calismiyor, development build gerekli
- iOS simulator'da ses cikisi yok (gercek cihazda calisir)
- Video yukleme: ImagePicker ile galeriden secim, base64 ile Supabase Storage'a upload
- Buyuk videolar (4K HEVC) icin sikistirma henuz uygulamada yok, ileride ffmpeg-kit eklenebilir
