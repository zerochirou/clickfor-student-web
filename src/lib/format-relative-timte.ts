export function formatRelativeTime(dateInput: Date | string | number): string {
  // 1. Konversi input ke objek Date jika berupa string atau timestamp
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  // Jika tanggal tidak valid, kembalikan string kosong atau placeholder
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  // Hitung selisih waktu dalam satuan detik
  const deltaSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

  // 2. Tentukan pembagian waktu berdasarkan detik
  const cutoffs = [
    { type: 'second', value: 60 },
    { type: 'minute', value: 60 },
    { type: 'hour', value: 24 },
    { type: 'day', value: 7 },
    { type: 'week', value: 4.345 },
    { type: 'month', value: 12 },
    { type: 'year', value: Infinity },
  ] as const;

  let delta = Math.abs(deltaSeconds);
  let unit: Intl.RelativeTimeFormatUnit = 'second';

  // Cari unit waktu yang cocok berdasarkan selisih angka
  for (const cutoff of cutoffs) {
    if (delta < cutoff.value) {
      unit = cutoff.type;
      break;
    }
    delta /= cutoff.value;
  }

  // 3. Gunakan Intl.RelativeTimeFormat bawaan browser (Bahasa Indonesia)
  const formatter = new Intl.RelativeTimeFormat('id', {
    numeric: 'auto', // Mengubah "1 hari lalu" menjadi "kemarin" atau "0 hari lalu" menjadi "hari ini"
    style: 'long', // Menampilkan versi panjang seperti "menit", bukan "mnt."
  });

  // Nilai dibulatkan secara negatif/positif tergantung masa lalu atau masa depan
  const value = Math.round(deltaSeconds < 0 ? -delta : delta);

  return formatter.format(value, unit);
}
