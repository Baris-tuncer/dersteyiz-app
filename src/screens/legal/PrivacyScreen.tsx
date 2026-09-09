import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';

export default function PrivacyScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Gizlilik Politikası
      </Text>
      <Text style={styles.lastUpdate}>
        Son güncelleme: 01.01.2025
      </Text>

      <Text style={styles.heading}>1. Giriş</Text>
      <Text style={styles.paragraph}>
        Dersteyiz olarak kullanıcılarımızın gizliliğine büyük önem veriyoruz. Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklamaktadır.
      </Text>

      <Text style={styles.heading}>2. Toplanan Bilgiler</Text>
      <Text style={styles.subheading}>2.1 Doğrudan Sağladığınız Bilgiler</Text>
      <Text style={styles.listItem}>
        {'\u2022'} Hesap oluştururken: ad, soyad, e-posta, telefon numarası, rol (öğretmen/veli)
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Öğretmen profili: branş, biyografi, deneyim, saatlik ücret, diploma
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Profil fotoğrafı
      </Text>

      <Text style={styles.subheading}>2.2 Otomatik Toplanan Bilgiler</Text>
      <Text style={styles.listItem}>
        {'\u2022'} Cihaz bilgileri: cihaz modeli, işletim sistemi, benzersiz cihaz tanımlayıcıları
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kullanım verileri: uygulama etkileşimleri, görüntülenen profiller, arama sorguları
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Çerezler ve benzeri teknolojiler aracılığıyla toplanan veriler
      </Text>

      <Text style={styles.heading}>3. Bilgilerin Kullanım Amaçları</Text>
      <Text style={styles.paragraph}>
        Topladığımız bilgileri aşağıdaki amaçlarla kullanmaktayız:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Hesap oluşturma ve kimlik doğrulama
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Öğretmen-öğrenci eşleştirme hizmetini sunma
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Öğretmen diploma ve yeterlilik doğrulaması
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Abonelik ve ödeme işlemleri
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Bildirim gönderme (izin verildiyse)
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Hizmet kalitesini iyileştirme ve analiz
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Yasal yükümlülüklere uyum
      </Text>

      <Text style={styles.heading}>4. Bilgilerin Paylaşılması</Text>
      <Text style={styles.paragraph}>
        Kişisel bilgileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Hizmet sağlayıcılar: Hosting (Supabase), analitik, ödeme işleme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Yasal zorunluluklar: Mahkeme kararı veya yasal talep üzerine
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Güvenlik: Dolandırıcılık veya güvenlik tehditlerini önlemek için
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Açık rıza: Sizin açık onayınız ile
      </Text>

      <Text style={styles.heading}>5. Veri Güvenliği</Text>
      <Text style={styles.paragraph}>
        Kişisel verilerinizi korumak için endüstri standartlarına uygun teknik ve organizasyonel güvenlik önlemleri alıyoruz. Bunlar arasında:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} SSL/TLS şifreleme ile veri iletimi
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Şifrelerin hash algoritması ile saklanması
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Düzenli güvenlik denetimleri
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Erişim kontrolü ve yetkilendirme mekanizmaları
      </Text>

      <Text style={styles.heading}>6. Veri Saklama Süresi</Text>
      <Text style={styles.paragraph}>
        Kişisel verileriniz, hesabınız aktif olduğu sürece saklanır. Hesabınızı sildiğinizde, verileriniz yasal saklama yükümlülüklerine tabi olmadığı sürece 30 gün içinde silinir veya anonimleştirilir.
      </Text>

      <Text style={styles.heading}>7. Çocukların Gizliliği</Text>
      <Text style={styles.paragraph}>
        Platformumuz 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşından küçük kullanıcılardan bilerek kişisel veri toplamıyoruz. Böyle bir durumun farkına varırsak, ilgili verileri derhal sileriz.
      </Text>

      <Text style={styles.heading}>8. Haklarınız</Text>
      <Text style={styles.paragraph}>
        KVKK ve ilgili mevzuat kapsamında aşağıdaki haklara sahipsiniz:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Verilerinize erişim ve kopyasını talep etme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Verilerinizin düzeltilmesini isteme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Verilerinizin silinmesini talep etme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Veri işlemeye itiraz etme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Veri taşınabilirliği hakkı
      </Text>

      <Text style={styles.heading}>9. Değişiklikler</Text>
      <Text style={styles.paragraph}>
        Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler yapıldığında, uygulama içi bildirim veya e-posta yoluyla sizi bilgilendireceğiz. Değişiklikler yayınlandığı tarihte yürürlüğe girer.
      </Text>

      <Text style={styles.heading}>10. İletişim</Text>
      <Text style={styles.paragraph}>
        Gizlilik politikamız veya kişisel verilerinizle ilgili sorularınız için destek@dersteyiz.net adresinden bize ulaşabilirsiniz.
      </Text>

      <Text style={styles.footer}>
        Dersteyiz'i kullanarak bu gizlilik politikasını kabul etmiş sayılırsınız.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  lastUpdate: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: 20,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    paddingLeft: 12,
    marginBottom: 4,
  },
  footer: {
    fontSize: 13,
    color: Colors.textTertiary,
    lineHeight: 20,
    marginTop: 28,
    fontStyle: 'italic',
  },
});
