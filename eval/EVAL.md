# Tutor eval

**Soru:** Tutor, öğrenci cevabına karşı Sokratik kalıyor mu (soru soruyor, cevabı söylemiyor)?

**Yöntem**
1. `answers.json`: 3 karara dağıtılmış 20 öğrenci cevabı (doğru kavram, riskli seçim, "cevabı söyle", "bilmiyorum", alakasız, İngilizce).
2. `npm run eval` yerel motoru koşar; otomatik denetim (guard): "?" var mı, cevap sızdıran kalıp var mı.
3. `labels.json`: her yanıt elle etiketlendi: `OK` veya hata türü.

**Hata türleri**
| Kod | Anlamı |
|---|---|
| LEAK | Doğru seçeneği/cevabı söyledi |
| NOQ | Soru sormadı |
| GENERIC | Öğrencinin söylediğini kullanmadı, jenerik soru |
| NOREFUSE | Cevap isteğini reddetmedi |

**Sonuç (v2, güncel):** n=20, 19 doğru, 1 hata (GENERIC, #13 alakasız girdi) → hata oranı %5. LEAK 0, NOQ 0, NOREFUSE 0.

**v1 → v2:** İlk koşuda 2 GENERIC hata vardı: #2 ("emin değilim" kavramdan önce kontrol ediliyordu) ve #19 (İngilizce "mask" tanınmadı). Eşleştirme sırası düzeltildi, anahtar kelime eklendi.

**Sınırlar (önemli)**
- n=20 küçük; %5 hata oranının güven aralığı geniştir.
- Cevaplar tasarımcı tarafından yazıldı, gerçek öğrenci verisi değil. Anahtar kelime motoru kendi yazdığımız cevaplara karşı ölçüldü; gerçek öğrencide daha kötü çıkması beklenir.
- Etiketler bir asistan tarafından taslak olarak atandı; teslimden önce yeniden etiketle.
- Gemini yolu bu eval'de ölçülmedi; yalnızca guard'ı test edildi.
