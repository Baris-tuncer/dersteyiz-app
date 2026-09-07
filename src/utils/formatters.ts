export function formatPrice(amount: number): string {
  return `₺${amount}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const intl = cleaned.startsWith('0') ? `90${cleaned.slice(1)}` : cleaned.startsWith('90') ? cleaned : `90${cleaned}`;
  const url = `https://wa.me/${intl}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
