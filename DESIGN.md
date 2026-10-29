# DESIGN.md — SE Primer

Stitch'e bu dosya ve aşağıdaki ekran açıklamaları verilir. Üç mobil ekran: **Giriş, Sahne, Son**.

## Tasarım ilkeleri
- Mobil öncelikli, 390×844. Tek sütun, en fazla 480 px.
- Terminal estetiği: koyu zemin, tek vurgu rengi, monospace etiketler.
- Dokunma hedefi en az 48 px. Metin kontrastı WCAG AA.
- Hareket yok; `prefers-reduced-motion` saygı görür.

## Renkler
| Ad | Hex | Kullanım |
|---|---|---|
| bg | `#0e1116` | Zemin |
| panel | `#171c24` | Kart |
| line | `#2a3340` | Çerçeve |
| text | `#e6ebf2` | Metin |
| muted | `#8d99ab` | İkincil metin |
| accent | `#5eead4` | Birincil buton, etiket |
| good | `#4ade80` | SON A |
| bad | `#f87171` | SON B |
| warn | `#fbbf24` | Sayaç, ipucu |

## Tipografi
- Gövde: system-ui. Etiketler ve sayaç: ui-monospace.
- Başlık 1.6 rem / 1.15 rem; gövde 1 rem; etiket .72 rem, harf aralığı .08 em.

## Ekranlar

### 1. Giriş
`SE PRIMER` etiketi, "Nöbetçi sensin." başlığı, üç grup: Seviye (3), Rol (3), Hedef (3). Seçili düğme vurgu çerçeveli. Alta tam genişlik "Nöbete başla"; üç grup dolana dek pasif.

### 2. Sahne / Karar
- Sahne: saat etiketi (`08:00 · KRİZ`), olay kartı, rol cümlesi, "Karar ver".
- Karar: ilerleme ("Karar 1 / 3") + (deneyimliyse) sayaç, karar etiketi, soru, iki büyük seçenek, ipucu (seviyeye göre), AI tutor kartı (giriş + yanıt balonları).
- Sonuç: "Seçimin", **Ne oldu**, **Neden oldu**, devam butonu.

### 3. Son
Kart çerçevesi iyi için yeşil, kötü için kırmızı. Etiket `SON A · İYİ` / `SON B · KÖTÜ`, saat ve özet, üç kararın özeti (✓/✗), SON B'de "Bedel" listesi, hedefe göre kapanış notu, "Tekrar oyna".

## Bileşenler
| Bileşen | Durumlar |
|---|---|
| Seçim düğmesi | normal, seçili (`aria-pressed`), odak |
| Birincil buton | normal, pasif |
| İpucu kutusu | sarı sol çizgi |
| Tutor balonu | öğrenci, tutor |

## Stitch istemi (kopyala-yapıştır)
> Mobile app, dark terminal aesthetic, bg #0e1116, accent #5eead4, system-ui + monospace labels. Three screens for "SE Primer", a Turkish interactive story for software engineers: (1) onboarding with three single-choice groups (level, role, goal) and a disabled-until-complete primary button; (2) scene/decision screen with progress, timer, two large option buttons, hint box and an AI tutor chat card; (3) ending screen with green/red bordered card, decision recap list and replay button. 48px touch targets.

`design/` içindeki `giris.png`, `sahne.png`, `karar-tutor.png`, `son.png` **Stitch çıktısı değil**, çalışan uygulamanın Cypress ekran görüntüleridir. Stitch ekranlarını sen üretip aynı klasöre eklemelisin. Uygulama `app/style.css` ile aynı belirteçleri kullanır.
