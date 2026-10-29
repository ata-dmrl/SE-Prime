/* SE Primer — senaryo verisi ve saf oyun mantığı (DOM'a dokunmaz). */
(function (root) {
  const ROLES = {
    backend: { label: "Backend", intro: "Randevu API'sinin sahibi sensin; hata logları senin ekranında." },
    frontend: { label: "Frontend", intro: "Hastalar boş bir ekran görüyor; ilk şikâyetler sana geliyor." },
    devops: { label: "DevOps / SRE", intro: "Pipeline ve altyapı senin; bu gece yapılan dağıtımı sen onaylamıştın." },
  };

  const LEVELS = {
    yeni: { label: "Yeni başladım", hints: "always", timer: 0 },
    orta: { label: "Biraz biliyorum", hints: "onDemand", timer: 0 },
    deneyimli: { label: "Deneyimliyim", hints: "none", timer: 60 },
  };

  const GOALS = {
    ogrenmek: { label: "Öğrenmek", closing: "Öğrenme notu: Her kararın bir bedeli var. Bedeli önceden sormak, mühendisliğin yarısı." },
    mulakat: { label: "Mülakat hazırlığı", closing: "Mülakat notu: 'Neden?' sorusuna kararını, alternatifini ve riski birlikte söyleyerek cevap ver." },
    is: { label: "İşte kullanmak", closing: "İş notu: Bu akışı olay sonrası (postmortem) belgenin ilk taslağı olarak kullanabilirsin." },
  };

  const START = {
    time: "08:00",
    title: "Kriz",
    text: "08:00, randevu sistemi çöktü. Nöbetçi sensin. Dün gece yeni sürüm çıktı. 300 hasta bekliyor.",
  };

  // safe: mühendislik açısından savunulabilir seçenek.
  const DECISIONS = [
    {
      id: "d1",
      tag: "KARAR 1 · MİMARİ",
      prompt: "Hatalar yeni sürümden sonra başladı. Ne yaparsın?",
      hint: "Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?",
      options: {
        A: {
          label: "Eski sürüme geri dön",
          safe: true,
          what: "Eski sürüm 08:09'da yeniden devreye girdi. Hata oranı hızla düştü.",
          why: "Geri dönüş, bilinen son iyi duruma dönmenin en az riskli yoludur. Şema değişikliği olmadığını doğruladığın için veri bozulmadı.",
        },
        B: {
          label: "Canlıda yama yap",
          safe: false,
          what: "Canlıya elle yama yapıldı. Hata bir süre azaldı, sonra başka bir uç noktada yeniden başladı.",
          why: "Canlıda yama, hatanın kök nedenini bilmeden değişkeni artırır. Doğrulanmamış değişiklik yeni hata yüzeyi açar.",
        },
      },
    },
    {
      id: "d2",
      tag: "KARAR 2 · TEST",
      prompt: "Düzeltme hazır. Yayına nasıl alırsın?",
      hint: "Kısa bir test neyi garanti eder, neyi etmez? Beş dakikanın maliyetini yanlış yayının maliyetiyle kıyasla.",
      options: {
        A: {
          label: "Önce kısa test koş",
          safe: true,
          what: "Beş dakikalık duman (smoke) testi koştu. Randevu oluşturma akışı geçti, bir uç noktada uyarı çıktı ve düzeltildi.",
          why: "Kısa test her şeyi kanıtlamaz ama kritik akışın çalıştığını düşük maliyetle gösterir. Hasta bekliyor, ama bozuk yayının bedeli beş dakikadan büyüktür.",
        },
        B: {
          label: "Hemen yayına al",
          safe: false,
          what: "Düzeltme hemen yayına çıktı. Randevu oluşturma çalıştı ama iptal akışında yeni bir hata çıktı.",
          why: "Testsiz yayın hızı artırır, geri bildirimi geciktirir. Hata artık kullanıcıda bulunuyor ve geri alması pahalı.",
        },
      },
    },
    {
      id: "d3",
      tag: "KARAR 3 · KVKK",
      prompt: "Logda hasta adı var. Ekibe log dosyasını paylaşman gerekiyor. Ne yaparsın?",
      hint: "Log dosyasını attığında o veriye kimler erişir? Hasta adı neden kişisel veridir?",
      options: {
        A: {
          label: "Maskele",
          safe: true,
          what: "Hasta adları maskelendi (ör. A*** Y***). Ekip hatayı gördü, kişisel veri paylaşılmadı.",
          why: "Hata ayıklamak için kimlik bilgisine ihtiyaç yok. Veri minimizasyonu (KVKK md. 4) ilkesi gereği yalnızca gerekli veri paylaşılır.",
        },
        B: {
          label: "Ekibe olduğu gibi at",
          safe: false,
          what: "Log, hasta adlarıyla birlikte ekip kanalına gitti. Kanalda dış danışmanlar da var.",
          why: "Sağlık verisi özel nitelikli kişisel veridir. Gerekçesiz paylaşım, yetkisiz erişim ve veri ihlali bildirimi yükümlülüğü doğurabilir.",
        },
      },
    },
  ];

  const ENDINGS = {
    A: {
      id: "A",
      kind: "iyi",
      time: "08:25",
      title: "SON A · İYİ",
      text: "08:25 sistem ayakta, veri güvende. 300 hastanın randevusu korundu.",
    },
    B: {
      id: "B",
      kind: "kotu",
      time: "09:40",
      title: "SON B · KÖTÜ",
      text: "Sistem ayakta ama bedeli ağır oldu.",
    },
  };

  /* Son kuralı (spec.md §5): KVKK kararı güvenli VE en az 2 güvenli seçim → Son A. */
  function computeEnding(choices) {
    const safeCount = DECISIONS.reduce((n, d) => n + (d.options[choices[d.id]] && d.options[choices[d.id]].safe ? 1 : 0), 0);
    const kvkkSafe = !!(choices.d3 && DECISIONS[2].options[choices.d3].safe);
    return kvkkSafe && safeCount >= 2 ? "A" : "B";
  }

  function badReasons(choices) {
    const out = [];
    DECISIONS.forEach((d) => {
      const o = d.options[choices[d.id]];
      if (o && !o.safe) out.push(d.tag.split("·")[1].trim() + ": " + o.label + " → " + o.why);
    });
    return out;
  }

  /* Seviye → davranış. */
  function levelBehavior(level) {
    return LEVELS[level] || LEVELS.orta;
  }

  const api = { ROLES, LEVELS, GOALS, START, DECISIONS, ENDINGS, computeEnding, badReasons, levelBehavior };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SEStory = api;
})(typeof window !== "undefined" ? window : globalThis);
