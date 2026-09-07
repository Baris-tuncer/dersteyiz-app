import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';

export default function TermsScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Kullanım Koşulları
      </Text>
      <Text style={styles.lastUpdate}>
        Son güncelleme: 01.01.2025
      </Text>

      <Text style={styles.heading}>1. Genel Hükümler</Text>
      <Text style={styles.paragraph}>
        Bu kullanım koşulları ("Koşullar"), Dersteyiz mobil uygulaması ve web platformu ("Platform") ile kullanıcılar arasındaki ilişkiyi düzenler. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
      </Text>

      <Text style={styles.heading}>2. Hizmet Tanımı</Text>
      <Text style={styles.paragraph}>
        Dersteyiz, öğretmenler ile öğrenci/veli arasında bağlantı kurmayı sağlayan bir aracı platformdur. Platform, öğretmen profili listeleme, arama, filtreleme ve iletişim bilgilerine erişim hizmetleri sunar.
      </Text>
      <Text style={styles.paragraph}>
        Platform, öğretmenler ile öğrenciler arasındaki ders ilişkisinde taraf değildir. Verilen derslerin kalitesi, içeriği veya sonuçları konusunda sorumluluk kabul etmez.
      </Text>

      <Text style={styles.heading}>3. Üyelik ve Hesap</Text>
      <Text style={styles.paragraph}>
        Platformu kullanmak için bir hesap oluşturmanız gerekmektedir. Kayıt sırasında verdiğiniz bilgilerin doğru ve güncel olması sizin sorumluluğunuzdadır.
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Hesap bilgilerinizin güvenliğinden siz sorumlusunuz.
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Hesabınızı başka kişilerle paylaşamazsınız.
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} 18 yaşından küçükler, veli/vasi onayı ile kayıt olabilir.
      </Text>

      <Text style={styles.heading}>4. Öğretmen Yükümlülükleri</Text>
      <Text style={styles.paragraph}>
        Öğretmen olarak kayıt olan kullanıcılar aşağıdaki yükümlülüklere uymayı kabul eder:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Profil bilgilerinin doğru ve güncel olması
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Yüklenen diploma ve sertifikaların gerçeğe uygun olması
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Öğrencilere saygılı ve profesyonel davranılması
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Platform kurallarına aykırı içerik paylaşılmaması
      </Text>

      <Text style={styles.heading}>5. Premium Abonelik</Text>
      <Text style={styles.paragraph}>
        Öğretmenler, profillerini öne çıkarmak için Premium abonelik satın alabilir. Abonelik ücretleri uygulama içi satın alma yoluyla tahsil edilir.
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Abonelik süresi dolmadan iptal edilirse, dönem sonuna kadar aktif kalır.
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} İade talepleri, Apple App Store ve Google Play Store politikalarına tabidir.
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Abonelik fiyatları önceden bildirimde bulunularak değiştirilebilir.
      </Text>

      <Text style={styles.heading}>6. Yasaklanan Davranışlar</Text>
      <Text style={styles.paragraph}>
        Aşağıdaki davranışlar kesinlikle yasaktır ve hesabınızın askıya alınması veya kapatılmasıyla sonuçlanabilir:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Yanıltıcı veya sahte profil bilgileri paylaşmak
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Diğer kullanıcılara hakaret, tehdit veya tacizde bulunmak
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Platformu yasa dışı amaçlarla kullanmak
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Platformun teknik altyapısına zarar vermeye çalışmak
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Uygunsuz, müstehcen veya telif hakkı ihlali içeren içerik paylaşmak
      </Text>

      <Text style={styles.heading}>7. Fikri Mülkiyet</Text>
      <Text style={styles.paragraph}>
        Platform üzerindeki tüm içerik, tasarım, logo, yazılım ve diğer materyaller Dersteyiz'in fikri mülkiyetindedir. İzinsiz kopyalama, dağıtma veya değiştirme yasaktır.
      </Text>

      <Text style={styles.heading}>8. Sorumluluk Sınırlaması</Text>
      <Text style={styles.paragraph}>
        Platform, öğretmen ve öğrenci/veli arasındaki ilişkiden doğan herhangi bir zarardan sorumlu tutulamaz. Platform, hizmetin kesintisiz ve hatasız olacağını garanti etmez.
      </Text>

      <Text style={styles.heading}>9. Değişiklikler</Text>
      <Text style={styles.paragraph}>
        Bu kullanım koşulları önceden bildirimde bulunarak değiştirilebilir. Değişiklikler, platformda yayınlandığı tarihte yürürlüğe girer. Değişikliklerden sonra platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
      </Text>

      <Text style={styles.heading}>10. Uyuşmazlık Çözümü</Text>
      <Text style={styles.paragraph}>
        Bu koşullardan doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
      </Text>

      <Text style={styles.heading}>11. İletişim</Text>
      <Text style={styles.paragraph}>
        Kullanım koşulları ile ilgili sorularınız için destek@dersteyiz.com adresinden bize ulaşabilirsiniz.
      </Text>

      <Text style={styles.footer}>
        Bu kullanım koşullarını okuyarak kabul etmiş sayılırsınız.
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
