-- ============================================================
-- 20 Mock Teachers for App Store / Play Store Screenshots
-- ============================================================

-- 1. Create auth.users (trigger auto-creates profiles)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
('aaaaaaaa-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ayse.yilmaz@mock.com','$2a$10$mock00000000000000000000000000001',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Ayşe Yılmaz","phone_number":"5321001001"}',now()-interval '8 months',now()),
('aaaaaaaa-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','mehmet.kara@mock.com','$2a$10$mock00000000000000000000000000002',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Mehmet Kara","phone_number":"5321001002"}',now()-interval '7 months',now()),
('aaaaaaaa-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','elif.demir@mock.com','$2a$10$mock00000000000000000000000000003',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Elif Demir","phone_number":"5321001003"}',now()-interval '6 months',now()),
('aaaaaaaa-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','can.ozkan@mock.com','$2a$10$mock00000000000000000000000000004',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Can Özkan","phone_number":"5321001004"}',now()-interval '10 months',now()),
('aaaaaaaa-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','selin.aydin@mock.com','$2a$10$mock00000000000000000000000000005',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Selin Aydın","phone_number":"5321001005"}',now()-interval '4 months',now()),
('aaaaaaaa-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','deniz.yildiz@mock.com','$2a$10$mock00000000000000000000000000006',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Deniz Yıldız","phone_number":"5321001006"}',now()-interval '12 months',now()),
('aaaaaaaa-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated','emre.celik@mock.com','$2a$10$mock00000000000000000000000000007',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Emre Çelik","phone_number":"5321001007"}',now()-interval '7 months',now()),
('aaaaaaaa-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated','zeynep.arslan@mock.com','$2a$10$mock00000000000000000000000000008',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Zeynep Arslan","phone_number":"5321001008"}',now()-interval '15 months',now()),
('aaaaaaaa-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated','burcu.sahin@mock.com','$2a$10$mock00000000000000000000000000009',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Burcu Şahin","phone_number":"5321001009"}',now()-interval '8 months',now()),
('aaaaaaaa-0000-0000-0000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','murat.koc@mock.com','$2a$10$mock0000000000000000000000000000a',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Murat Koç","phone_number":"5321001010"}',now()-interval '6 months',now()),
('aaaaaaaa-0000-0000-0000-00000000000b','00000000-0000-0000-0000-000000000000','authenticated','authenticated','derya.gunes@mock.com','$2a$10$mock0000000000000000000000000000b',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Derya Güneş","phone_number":"5321001011"}',now()-interval '9 months',now()),
('aaaaaaaa-0000-0000-0000-00000000000c','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hakan.yilmaz@mock.com','$2a$10$mock0000000000000000000000000000c',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Hakan Yılmaz","phone_number":"5321001012"}',now()-interval '20 months',now()),
('aaaaaaaa-0000-0000-0000-00000000000d','00000000-0000-0000-0000-000000000000','authenticated','authenticated','baris.aksoy@mock.com','$2a$10$mock0000000000000000000000000000d',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Barış Aksoy","phone_number":"5321001013"}',now()-interval '5 months',now()),
('aaaaaaaa-0000-0000-0000-00000000000e','00000000-0000-0000-0000-000000000000','authenticated','authenticated','naz.erdogan@mock.com','$2a$10$mock0000000000000000000000000000e',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Naz Erdoğan","phone_number":"5321001014"}',now()-interval '11 months',now()),
('aaaaaaaa-0000-0000-0000-00000000000f','00000000-0000-0000-0000-000000000000','authenticated','authenticated','tolga.ozturk@mock.com','$2a$10$mock0000000000000000000000000000f',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Tolga Öztürk","phone_number":"5321001015"}',now()-interval '7 months',now()),
('aaaaaaaa-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000000','authenticated','authenticated','gamze.kilic@mock.com','$2a$10$mock00000000000000000000000000010',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Gamze Kılıç","phone_number":"5321001016"}',now()-interval '6 months',now()),
('aaaaaaaa-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000000','authenticated','authenticated','fatma.korkmaz@mock.com','$2a$10$mock00000000000000000000000000011',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Fatma Korkmaz","phone_number":"5321001017"}',now()-interval '18 months',now()),
('aaaaaaaa-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000000','authenticated','authenticated','esra.turan@mock.com','$2a$10$mock00000000000000000000000000012',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Esra Turan","phone_number":"5321001018"}',now()-interval '10 months',now()),
('aaaaaaaa-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000000','authenticated','authenticated','melis.yalcin@mock.com','$2a$10$mock00000000000000000000000000013',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Melis Yalçın","phone_number":"5321001019"}',now()-interval '3 months',now()),
('aaaaaaaa-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000000','authenticated','authenticated','oguz.tan@mock.com','$2a$10$mock00000000000000000000000000014',now(),'{"provider":"email","providers":["email"]}','{"role":"teacher","full_name":"Oğuz Tan","phone_number":"5321001020"}',now()-interval '8 months',now());

-- 2. Update auto-created profiles with avatars and email_verified
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000001';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000002';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000003';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000004';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000005';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000006';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000007';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000008';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000009';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-00000000000a';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-00000000000b';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-00000000000c';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-00000000000d';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-00000000000e';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-00000000000f';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000010';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000011';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000012';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000013';
UPDATE public.profiles SET avatar_url='https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face', email_verified=true WHERE id='aaaaaaaa-0000-0000-0000-000000000014';

-- 3. Create teachers
INSERT INTO public.teachers (profile_id, bio, major, university, phone_number, email, hourly_rate, diploma_url, diploma_status, diploma_type, subscription_status, is_verified, avg_rating, review_count, experience_years, show_diploma, offers_trial, view_count, contact_count) VALUES
('aaaaaaaa-0000-0000-0000-000000000001','İstanbul Üniversitesi Matematik bölümü mezunu. 8 yıldır özel ders veriyorum. LGS ve YKS sınavlarında yüzlerce öğrencimi başarıyla hazırladım. Geometri ve problem çözme konularında uzmanım.','Matematik','İstanbul Üniversitesi','5321001001','ayse.yilmaz@mock.com',2000,null,'approved','diploma',true,true,4.8,23,8,false,true,342,28),
('aaaaaaaa-0000-0000-0000-000000000002','Boğaziçi Üniversitesi Fizik bölümü mezunu. Kavramsal anlama odaklı, soru çözüm teknikleriyle desteklenen dersler veriyorum. TYT ve AYT Fizik konusunda uzmanım.','Fizik','Boğaziçi Üniversitesi','5321001002','mehmet.kara@mock.com',2200,null,'approved','diploma',true,true,4.6,15,5,false,true,189,14),
('aaaaaaaa-0000-0000-0000-000000000003','Cambridge CELTA sertifikalı İngilizce öğretmeni. Konuşma ağırlıklı derslerle öğrencilerimin özgüvenini artırıyorum. IELTS ve TOEFL hazırlık dersleri de veriyorum.','İngilizce','Hacettepe Üniversitesi','5321001003','elif.demir@mock.com',1800,null,'approved','certificate',true,true,4.9,31,6,false,true,456,38),
('aaaaaaaa-0000-0000-0000-000000000004','ODTÜ Kimya mezunu. 10 yıllık tecrübemle AYT Kimya konularında uzmanlaşmış, sınav odaklı ders veriyorum. Organik kimya ve problem çözme alanında güçlüyüm.','Kimya','Orta Doğu Teknik Üniversitesi','5321001004','can.ozkan@mock.com',2500,null,'approved','diploma',true,true,4.7,19,10,false,false,267,21),
('aaaaaaaa-0000-0000-0000-000000000005','Türk Dili ve Edebiyatı mezunuyum. Paragraf analizi, dil bilgisi ve edebiyat derslerinde öğrencilerimi sınavlara hazırlıyorum. Yazılı anlatım ve kompozisyon çalışmaları yapıyoruz.','Edebiyat','Marmara Üniversitesi','5321001005','selin.aydin@mock.com',1700,null,'approved','diploma',true,true,4.5,12,4,false,true,156,11),
('aaaaaaaa-0000-0000-0000-000000000006','İTÜ Konservatuar mezunu piyano eğitmeni. Başlangıç seviyesinden ileri seviyeye kadar her yaş grubuna piyano dersi veriyorum. Klasik ve pop müzik repertuvarı çalışıyoruz.','Piyano','İstanbul Teknik Üniversitesi','5321001006','deniz.yildiz@mock.com',2000,null,'approved','diploma',true,true,4.9,27,12,false,true,298,24),
('aaaaaaaa-0000-0000-0000-000000000007','Profesyonel müzisyen ve gitar eğitmeni. Akustik ve elektro gitar dersleri. Sıfırdan başlayanlardan ileri seviyeye kadar, her seviyeye uygun programlar hazırlıyorum.','Gitar','Bilkent Üniversitesi','5321001007','emre.celik@mock.com',1800,null,'approved','certificate',true,true,4.4,9,7,false,true,178,13),
('aaaaaaaa-0000-0000-0000-000000000008','15 yıllık konser deneyimine sahip keman sanatçısı ve eğitmen. Çocuklar ve yetişkinler için klasik keman eğitimi. Konservatuar hazırlık programları da uyguluyorum.','Keman','İstanbul Üniversitesi','5321001008','zeynep.arslan@mock.com',2200,null,'approved','diploma',true,true,5.0,18,15,false,false,312,19),
('aaaaaaaa-0000-0000-0000-000000000009','Uluslararası sertifikalı Pilates eğitmeni. Mat Pilates ve Reformer Pilates dersleri veriyorum. Duruş bozukluğu, bel-sırt ağrıları ve postür düzeltme konusunda uzmanım.','Pilates','Marmara Üniversitesi','5321001009','burcu.sahin@mock.com',2500,null,'approved','certificate',true,true,4.8,22,8,false,true,289,25),
('aaaaaaaa-0000-0000-0000-00000000000a','ACE sertifikalı Personal Trainer. Kilo verme, kas geliştirme ve fonksiyonel antrenman programları hazırlıyorum. Online ve yüz yüze antrenman seçenekleri mevcut.','Personal Training','Akdeniz Üniversitesi','5321001010','murat.koc@mock.com',3000,null,'approved','certificate',true,true,4.6,14,6,false,false,234,17),
('aaaaaaaa-0000-0000-0000-00000000000b','RYT-500 sertifikalı yoga eğitmeni. Hatha, Vinyasa ve Yin Yoga dersleri veriyorum. Stres yönetimi ve nefes teknikleri konusunda uzmanım. Tüm seviyeler için uygundur.','Yoga','Ege Üniversitesi','5321001011','derya.gunes@mock.com',2000,null,'approved','certificate',true,true,4.7,20,9,false,true,267,22),
('aaaaaaaa-0000-0000-0000-00000000000c','20 yıllık deneyimli direksiyon eğitmeni. Sıfırdan ehliyet hazırlık, ileri sürüş teknikleri ve trafik korkusu olan bireyler için özel programlar. Sabırlı ve güvenli eğitim.','Direksiyon Dersi','Gazi Üniversitesi','5321001012','hakan.yilmaz@mock.com',1500,null,'approved','certificate',true,true,4.3,35,20,false,false,445,42),
('aaaaaaaa-0000-0000-0000-00000000000d','Full-stack yazılım geliştirici ve eğitmen. Python, JavaScript, React ve mobil uygulama geliştirme dersleri. Sıfırdan yazılıma başlamak isteyenler için uygun müfredat.','Yazılım / Kodlama','Bilkent Üniversitesi','5321001013','baris.aksoy@mock.com',3500,null,'approved','diploma',true,true,4.9,16,5,false,true,378,31),
('aaaaaaaa-0000-0000-0000-00000000000e','Güzel Sanatlar Fakültesi mezunu ressam ve eğitmen. Yağlıboya, suluboya, karakalem ve dijital çizim dersleri. Portfolyo hazırlık ve güzel sanatlar sınav hazırlık programları.','Resim','Dokuz Eylül Üniversitesi','5321001014','naz.erdogan@mock.com',1800,null,'approved','diploma',true,true,4.5,8,11,false,true,167,10),
('aaaaaaaa-0000-0000-0000-00000000000f','Goethe-Institut C2 sertifikalı Almanca eğitmeni. A1''den C1''e kadar tüm seviyelerde ders veriyorum. TestDaF ve Goethe sınav hazırlık programlarım mevcut.','Almanca','Ankara Üniversitesi','5321001015','tolga.ozturk@mock.com',2000,null,'approved','certificate',true,true,4.6,13,7,false,true,198,15),
('aaaaaaaa-0000-0000-0000-000000000010','Hacettepe Biyoloji mezunu. TYT ve AYT Biyoloji derslerinde uzmanım. Genetik, ekoloji ve hücre biyolojisi konularında detaylı konu anlatımı ve soru çözümü yapıyorum.','Biyoloji','Hacettepe Üniversitesi','5321001016','gamze.kilic@mock.com',1900,null,'approved','diploma',true,true,4.4,11,6,false,true,145,9),
('aaaaaaaa-0000-0000-0000-000000000011','18 yıllık deneyimli sınıf öğretmeni. İlkokul 1-4. sınıf öğrencilerine matematik, Türkçe ve fen bilimleri derslerinde destek veriyorum. Okuma yazma öğretimi konusunda uzmanım.','Sınıf Öğretmenliği','Dokuz Eylül Üniversitesi','5321001017','fatma.korkmaz@mock.com',1500,null,'approved','diploma',true,true,4.8,29,18,false,true,412,34),
('aaaaaaaa-0000-0000-0000-000000000012','Özel eğitim uzmanı. Disleksi, dikkat eksikliği ve otizm spektrum bozukluğu olan çocuklarla bireysel çalışıyorum. Aile danışmanlığı ve ev programı desteği de sağlıyorum.','Özel Eğitim','Ankara Üniversitesi','5321001018','esra.turan@mock.com',2800,null,'approved','diploma',true,true,4.9,17,10,false,false,256,18),
('aaaaaaaa-0000-0000-0000-000000000013','Profesyonel astrolog ve eğitmen. Natal harita analizi, transit yorumlama ve astroloji eğitimi veriyorum. Başlangıç ve ileri seviye kurslarım mevcut.','Astroloji','İstanbul Üniversitesi','5321001019','melis.yalcin@mock.com',2000,null,'pending','certificate',true,false,4.2,7,3,false,true,134,8),
('aaaaaaaa-0000-0000-0000-000000000014','KPSS Eğitim Bilimleri ve Genel Yetenek uzmanı. 8 yıldır KPSS adaylarını hazırlıyorum. Yüzlerce öğrencim atanmıştır. Deneme sınavı analizi ve konu takip sistemi uyguluyorum.','KPSS','Gazi Üniversitesi','5321001020','oguz.tan@mock.com',2200,null,'approved','diploma',true,true,4.7,21,8,false,true,356,29);

-- 4. Teacher modes
INSERT INTO public.teacher_modes (teacher_id, mode) VALUES
('aaaaaaaa-0000-0000-0000-000000000001','online'),('aaaaaaaa-0000-0000-0000-000000000001','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000002','online'),
('aaaaaaaa-0000-0000-0000-000000000003','online'),('aaaaaaaa-0000-0000-0000-000000000003','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000004','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000005','online'),
('aaaaaaaa-0000-0000-0000-000000000006','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000007','online'),('aaaaaaaa-0000-0000-0000-000000000007','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000008','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000009','online'),('aaaaaaaa-0000-0000-0000-000000000009','face_to_face'),
('aaaaaaaa-0000-0000-0000-00000000000a','face_to_face'),
('aaaaaaaa-0000-0000-0000-00000000000b','online'),('aaaaaaaa-0000-0000-0000-00000000000b','face_to_face'),
('aaaaaaaa-0000-0000-0000-00000000000c','face_to_face'),
('aaaaaaaa-0000-0000-0000-00000000000d','online'),
('aaaaaaaa-0000-0000-0000-00000000000e','face_to_face'),
('aaaaaaaa-0000-0000-0000-00000000000f','online'),
('aaaaaaaa-0000-0000-0000-000000000010','online'),('aaaaaaaa-0000-0000-0000-000000000010','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000011','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000012','face_to_face'),
('aaaaaaaa-0000-0000-0000-000000000013','online'),
('aaaaaaaa-0000-0000-0000-000000000014','online'),('aaaaaaaa-0000-0000-0000-000000000014','face_to_face');

-- 5. Teacher locations
INSERT INTO public.teacher_locations (teacher_id, city, district) VALUES
('aaaaaaaa-0000-0000-0000-000000000001','İstanbul','Kadıköy'),('aaaaaaaa-0000-0000-0000-000000000001','İstanbul','Üsküdar'),
('aaaaaaaa-0000-0000-0000-000000000002','Ankara','Çankaya'),
('aaaaaaaa-0000-0000-0000-000000000003','İstanbul','Beşiktaş'),('aaaaaaaa-0000-0000-0000-000000000003','İstanbul','Şişli'),
('aaaaaaaa-0000-0000-0000-000000000004','İzmir','Bornova'),
('aaaaaaaa-0000-0000-0000-000000000005','İstanbul','Üsküdar'),
('aaaaaaaa-0000-0000-0000-000000000006','Ankara','Çankaya'),
('aaaaaaaa-0000-0000-0000-000000000007','İstanbul','Kadıköy'),
('aaaaaaaa-0000-0000-0000-000000000008','İstanbul','Beşiktaş'),
('aaaaaaaa-0000-0000-0000-000000000009','İstanbul','Kadıköy'),('aaaaaaaa-0000-0000-0000-000000000009','İstanbul','Ataşehir'),
('aaaaaaaa-0000-0000-0000-00000000000a','İstanbul','Beşiktaş'),
('aaaaaaaa-0000-0000-0000-00000000000b','Antalya','Muratpaşa'),('aaaaaaaa-0000-0000-0000-00000000000b','Antalya','Konyaaltı'),
('aaaaaaaa-0000-0000-0000-00000000000c','İstanbul','Bakırköy'),('aaaaaaaa-0000-0000-0000-00000000000c','İstanbul','Bahçelievler'),
('aaaaaaaa-0000-0000-0000-00000000000d','İstanbul','Kadıköy'),
('aaaaaaaa-0000-0000-0000-00000000000e','İzmir','Konak'),
('aaaaaaaa-0000-0000-0000-00000000000f','Ankara','Çankaya'),
('aaaaaaaa-0000-0000-0000-000000000010','İstanbul','Ataşehir'),
('aaaaaaaa-0000-0000-0000-000000000011','İzmir','Karşıyaka'),('aaaaaaaa-0000-0000-0000-000000000011','İzmir','Bornova'),
('aaaaaaaa-0000-0000-0000-000000000012','Ankara','Çankaya'),
('aaaaaaaa-0000-0000-0000-000000000013','İstanbul','Kadıköy'),
('aaaaaaaa-0000-0000-0000-000000000014','Ankara','Çankaya');

-- 6. Teacher categories
INSERT INTO public.teacher_categories (teacher_id, category_id) VALUES
('aaaaaaaa-0000-0000-0000-000000000001',1),('aaaaaaaa-0000-0000-0000-000000000001',2),
('aaaaaaaa-0000-0000-0000-000000000002',2),
('aaaaaaaa-0000-0000-0000-000000000003',5),('aaaaaaaa-0000-0000-0000-000000000003',13),('aaaaaaaa-0000-0000-0000-000000000003',14),
('aaaaaaaa-0000-0000-0000-000000000004',2),
('aaaaaaaa-0000-0000-0000-000000000005',1),('aaaaaaaa-0000-0000-0000-000000000005',2),
('aaaaaaaa-0000-0000-0000-000000000006',12),
('aaaaaaaa-0000-0000-0000-000000000007',12),
('aaaaaaaa-0000-0000-0000-000000000008',12),
('aaaaaaaa-0000-0000-0000-000000000009',10),
('aaaaaaaa-0000-0000-0000-00000000000a',11),
('aaaaaaaa-0000-0000-0000-00000000000b',18),
('aaaaaaaa-0000-0000-0000-00000000000c',21),
('aaaaaaaa-0000-0000-0000-00000000000d',20),
('aaaaaaaa-0000-0000-0000-00000000000e',19),
('aaaaaaaa-0000-0000-0000-00000000000f',5),
('aaaaaaaa-0000-0000-0000-000000000010',2),
('aaaaaaaa-0000-0000-0000-000000000011',3),
('aaaaaaaa-0000-0000-0000-000000000012',9),('aaaaaaaa-0000-0000-0000-000000000012',22),
('aaaaaaaa-0000-0000-0000-000000000013',21),
('aaaaaaaa-0000-0000-0000-000000000014',15),('aaaaaaaa-0000-0000-0000-000000000014',4);

-- 7. Teacher tags
INSERT INTO public.teacher_tags (teacher_id, tag_id) VALUES
('aaaaaaaa-0000-0000-0000-000000000001',2),('aaaaaaaa-0000-0000-0000-000000000001',3),('aaaaaaaa-0000-0000-0000-000000000001',8),
('aaaaaaaa-0000-0000-0000-000000000002',1),('aaaaaaaa-0000-0000-0000-000000000002',7),
('aaaaaaaa-0000-0000-0000-000000000003',16),('aaaaaaaa-0000-0000-0000-000000000003',8),('aaaaaaaa-0000-0000-0000-000000000003',9),
('aaaaaaaa-0000-0000-0000-000000000004',4),('aaaaaaaa-0000-0000-0000-000000000004',12),
('aaaaaaaa-0000-0000-0000-000000000005',2),('aaaaaaaa-0000-0000-0000-000000000005',11),
('aaaaaaaa-0000-0000-0000-000000000006',13),('aaaaaaaa-0000-0000-0000-000000000006',15),('aaaaaaaa-0000-0000-0000-000000000006',8),
('aaaaaaaa-0000-0000-0000-000000000007',14),('aaaaaaaa-0000-0000-0000-000000000007',6),
('aaaaaaaa-0000-0000-0000-000000000008',13),('aaaaaaaa-0000-0000-0000-000000000008',15),
('aaaaaaaa-0000-0000-0000-000000000009',20),('aaaaaaaa-0000-0000-0000-000000000009',8),('aaaaaaaa-0000-0000-0000-000000000009',9),
('aaaaaaaa-0000-0000-0000-00000000000a',23),('aaaaaaaa-0000-0000-0000-00000000000a',24),('aaaaaaaa-0000-0000-0000-00000000000a',19),
('aaaaaaaa-0000-0000-0000-00000000000b',26),('aaaaaaaa-0000-0000-0000-00000000000b',9),('aaaaaaaa-0000-0000-0000-00000000000b',16),
('aaaaaaaa-0000-0000-0000-00000000000c',6),('aaaaaaaa-0000-0000-0000-00000000000c',8),
('aaaaaaaa-0000-0000-0000-00000000000d',6),('aaaaaaaa-0000-0000-0000-00000000000d',8),
('aaaaaaaa-0000-0000-0000-00000000000e',17),('aaaaaaaa-0000-0000-0000-00000000000e',18),('aaaaaaaa-0000-0000-0000-00000000000e',8),
('aaaaaaaa-0000-0000-0000-00000000000f',6),('aaaaaaaa-0000-0000-0000-00000000000f',7),('aaaaaaaa-0000-0000-0000-00000000000f',16),
('aaaaaaaa-0000-0000-0000-000000000010',2),('aaaaaaaa-0000-0000-0000-000000000010',10),
('aaaaaaaa-0000-0000-0000-000000000011',5),('aaaaaaaa-0000-0000-0000-000000000011',8),
('aaaaaaaa-0000-0000-0000-000000000012',8),
('aaaaaaaa-0000-0000-0000-000000000013',6),('aaaaaaaa-0000-0000-0000-000000000013',9),
('aaaaaaaa-0000-0000-0000-000000000014',7),('aaaaaaaa-0000-0000-0000-000000000014',10),('aaaaaaaa-0000-0000-0000-000000000014',12);
