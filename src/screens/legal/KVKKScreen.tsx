import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';

export default function KVKKScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        KVKK Aydınlatma Metni
      </Text>
      <Text style={styles.lastUpdate}>
        Son güncelleme: 01.01.2025
      </Text>

      <Text style={styles.heading}>1. Veri Sorumlusu</Text>
      <Text style={styles.paragraph}>
        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, kişisel verileriniz; veri sorumlusu sıfatıyla Dersteyiz platformu ("Platform") tarafından aşağıda açıklanan amaçlarla işlenebilecektir.
      </Text>

      <Text style={styles.heading}>2. İşlenen Kişisel Veriler</Text>
      <Text style={styles.paragraph}>
        Platform tarafından aşağıdaki kişisel verileriniz işlenmektedir:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kimlik bilgileri: Ad, soyad
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} İletişim bilgileri: E-posta adresi, telefon numarası
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Mesleki bilgiler: Branş, deneyim, diploma bilgileri (öğretmenler için)
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kullanım verileri: Uygulama kullanım istatistikleri, cihaz bilgileri
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Profil fotoğrafı
      </Text>

      <Text style={styles.heading}>3. Kişisel Verilerin İşlenme Amaçları</Text>
      <Text style={styles.paragraph}>
        Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Üyelik işlemlerinin gerçekleştirilmesi ve hesap yönetimi
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Öğretmen ve veli/öğrenci eşleştirme hizmetinin sunulması
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Öğretmen profil doğrulama süreçlerinin yürütülmesi
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Abonelik ve ödeme işlemlerinin yönetilmesi
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kullanıcı destek hizmetlerinin sağlanması
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Yasal yükümlülüklerin yerine getirilmesi
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Platform güvenliğinin sağlanması
      </Text>

      <Text style={styles.heading}>4. Kişisel Verilerin Aktarılması</Text>
      <Text style={styles.paragraph}>
        Kişisel verileriniz; yasal yükümlülüklerin yerine getirilmesi amacıyla yetkili kamu kurum ve kuruluşlarına, hizmet aldığımız iş ortaklarına (hosting, ödeme altyapısı sağlayıcıları) ve hukuki zorunluluk hallerinde ilgili taraflara aktarılabilir. Verileriniz yurt dışına aktarılması durumunda KVKK'nın 9. maddesi kapsamında gerekli tedbirler alınmaktadır.
      </Text>

      <Text style={styles.heading}>5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</Text>
      <Text style={styles.paragraph}>
        Kişisel verileriniz; Platform üzerinden elektronik ortamda, üyelik formu, profil oluşturma ve uygulama kullanımı sırasında otomatik yollarla toplanmaktadır. Bu veriler KVKK'nın 5. ve 6. maddelerinde belirtilen; açık rızanız, sözleşmenin kurulması ve ifası, hukuki yükümlülük ve meşru menfaat hukuki sebeplerine dayanılarak işlenmektedir.
      </Text>

      <Text style={styles.heading}>6. Veri Sahibinin Hakları</Text>
      <Text style={styles.paragraph}>
        KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kişisel verilerinizin işlenip işlenmediğini öğrenme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kişisel verilerinizin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Eksik veya yanlış işlenen kişisel verilerin düzeltilmesini isteme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
      </Text>
      <Text style={styles.listItem}>
        {'\u2022'} Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme
      </Text>

      <Text style={styles.heading}>7. İletişim</Text>
      <Text style={styles.paragraph}>
        Yukarıda belirtilen haklarınıza ilişkin taleplerinizi destek@dersteyiz.net adresine e-posta göndererek veya uygulama içi destek hattı üzerinden iletebilirsiniz.
      </Text>

      <Text style={styles.footer}>
        Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır.
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
