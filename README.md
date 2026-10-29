# SE Primer

Kişiye uyum sağlayan kitap, bu kez yazılım mühendisi için: oyuncu karar verir, uygulama o kararın teknik sonucunu gösterir. YZM301 ödevi.

## Çalıştırma

```bash
npm install
npm start          # http://localhost:8080 (telefonda aynı ağdan aç)
npm run eval       # tutor eval → eval/RESULTS.md
npm test           # sunucuyu açar, Cypress'i başsız çalıştırır, video cypress/videos/ altına yazar
```

Uygulama build gerektirmeyen statik dosyalardır (`app/`). Google AI Studio'ya aynı dosyalar yüklenebilir; tutor için isteğe bağlı Gemini anahtarı: tarayıcı konsolunda `localStorage.setItem("gemini_key","...")`. Anahtar yoksa yerel Sokratik motor çalışır.

## Teslim haritası

| Teslim | Dosya |
|---|---|
| spec | [spec.md](spec.md) |
| Tasarım | [DESIGN.md](DESIGN.md), `design/` |
| Uygulama | `app/` |
| Tutor eval | [eval/](eval/EVAL.md), [eval/RESULTS.md](eval/RESULTS.md) |
| Cypress | `cypress/e2e/primer.cy.js`, `cypress/videos/` |

## Ürün kararı: yapmadığım 3 özellik

1. **Sınırsız serbest sohbet tutoru:** serbest sohbet cevabı sızdırma riskini artırır; tutor tek karar bağlamında kısa ve korumalı kalır.
2. **Kullanıcı hesabı ve ilerleme kaydı:** tek oturumluk 5 dakikalık deneyim için hesap sürtünme yaratır, kapsam dışıdır.
3. **Gerçek log veya hasta verisiyle çalışma:** KVKK'ya göre özel nitelikli veriyle öğretmek, öğrettiğimiz ilkeye aykırıdır; yalnızca uydurma örnek kullanılır.

## Dürüst durum notları
- Stitch ekranları ve AI Studio yayını bu repoda **yoktur**; ikisi de hesap gerektirir. DESIGN.md ve `app/` bunları üretmeye hazırdır.
- Eval etiketlerini bir asistan taslak olarak yazdı; teslimden önce `eval/labels.json` dosyasını **kendin yeniden etiketle**.
- 60 sn demo videosunu `npm test` ile çıkan Cypress videosundan veya telefon kaydından al.
