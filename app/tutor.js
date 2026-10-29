/* SE Primer — Sokratik AI tutor.
 * Kural: ipucu verir, cevabı söylemez. Her yanıt bir soru içerir.
 * Varsayılan motor yerel ve deterministiktir (test/eval edilebilir).
 * İsteğe bağlı: Gemini anahtarı verilirse model çağrılır, çıktı korumadan (guard) geçmezse yerel motora düşer. */
(function (root) {
  const norm = (s) =>
    String(s || "")
      .toLocaleLowerCase("tr")
      .replace(/[’']/g, "'");

  const ASK_ANSWER = /(cevab[ıi]\s*(söyle|ver)|doğru\s*(cevap|seçenek|şık)|hangisi\s*doğru|hangisini\s*seç|ne\s*yapmal[ıi]y[ıi]m|söyle\s*gitsin|just\s*tell|which\s*(one|option)|what\s*should\s*i)/;
  const GIVE_UP = /(bilmiyorum|fikrim\s*yok|emin\s*değilim|anlamad[ıi]m|i\s*don'?t\s*know)/;

  const TOPICS = {
    d1: {
      concepts: [
        { re: /(şema|schema|migrasyon|migration|tablo|kolon)/, ack: "Şemaya değinmen iyi.", next: "Şema değiştiyse eski sürüm yeni veriyi okuyabilir mi? Bunu hangi kayıttan veya komuttan görürsün?" },
        { re: /(yedek|backup|snapshot)/, ack: "Yedek almayı düşünmen yerinde.", next: "Yedeğin ne kadar eski olduğunu ve geri yüklemenin kaç dakika süreceğini biliyor musun?" },
        { re: /(kök|root\s*cause|neden\s*çök|log|hata\s*kayd)/, ack: "Nedeni anlamak istemen iyi bir refleks.", next: "Kök nedeni bulmak dakikalar sürerse, bu sürede hastalar için ne yaparsın?" },
        { re: /(geri\s*dön|rollback|eski\s*sürüm)/, ack: "Geri dönüş bir seçenek.", next: "Geri dönmenin bilinmeyen bir riski var mı? Veri tarafında neyi kontrol edersin?" },
        { re: /(yama|hotfix|patch|canl[ıi]da)/, ack: "Yama hızlı görünüyor.", next: "Hatanın kaynağını bilmeden yaptığın değişikliğin yeni bir hata açmayacağından nasıl emin olursun?" },
      ],
      fallback: "Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?",
      giveUp: "Cevabı ben vermeyeyim, ama küçük bir adım atalım: bu gece yayına çıkan sürümde veritabanına dokunan bir değişiklik var mıydı? Bunu nereden öğrenirsin?",
    },
    d2: {
      concepts: [
        { re: /(smoke|duman|kısa\s*test|regresyon|regression)/, ack: "Test türünü ayırt etmen güzel.", next: "Bu test hangi akışı kapsar, hangisini kapsamaz?" },
        { re: /(risk|maliyet|bedel|hasta|bekli)/, ack: "Riski ve bekleyen hastaları birlikte tartıyorsun.", next: "Beş dakikalık gecikmenin ve bozuk bir yayının maliyetini nasıl karşılaştırırsın?" },
        { re: /(canl[ıi]|prod|yayın|deploy)/, ack: "Yayın kararı geri alınabilir mi, onu düşünmek gerek.", next: "Yayından sonra bir sorun çıkarsa geri alma yolun hazır mı?" },
        { re: /(otomatik|pipeline|ci\b|cd\b)/, ack: "Otomasyon iyi bir fikir.", next: "Pipeline'daki hangi adımı atlamak güvenli, hangisini atlamak değil?" },
      ],
      fallback: "Kısa bir test neyi garanti eder, neyi garanti etmez? Beş dakikanın maliyetiyle yanlış yayının maliyetini nasıl kıyaslarsın?",
      giveUp: "Önce şunu düşün: yanlış bir yayın yapılırsa kaç hasta etkilenir ve bunu geri almak ne kadar sürer?",
    },
    d3: {
      concepts: [
        { re: /(kvkk|kişisel\s*veri|özel\s*nitelik|sağlık\s*veri)/, ack: "Yasal çerçeveyi hatırlaman iyi.", next: "Hasta adı bir hata ayıklama için gerekli mi? Gerekli olmayan veriyi neden taşıyorsun?" },
        { re: /(maske|mask|anonim|gizle|sansür)/, ack: "Maskeleme tek yol değil, ama bir yol.", next: "Maskelenmiş logda hatayı hâlâ yeniden üretebilir misin? Neyi kaybedersin?" },
        { re: /(erişim|yetki|kanal|danışman|kimler)/, ack: "Erişimi sorgulaman önemli.", next: "Kanalda olmaması gereken biri bu veriyi görürse kime, ne zaman bildirim yaparsın?" },
        { re: /(zaman|acil|hız|vakit)/, ack: "Zaman baskısı gerçek.", next: "Acele, kişisel veriyle ilgili bir kararı değiştirir mi? Maskelemek ne kadar süre alır?" },
        { re: /(olduğu\s*gibi|direkt|hemen\s*at)/, ack: "Hız cazip.", next: "O log kanalda kaldığında kaç kişi görür ve sonradan silebilir misin?" },
      ],
      fallback: "Log dosyasını ekibe attığında o veriye kimler erişir ve hasta adı neden kişisel veri sayılır?",
      giveUp: "Basit başla: hasta adı bir hatayı bulmak için gerekli mi, yoksa sadece loga yazılmış bir ayrıntı mı?",
    },
  };

  /* Yerel motor. input: { decisionId, text } → string */
  function localReply(input) {
    const topic = TOPICS[input.decisionId] || TOPICS.d1;
    const t = norm(input.text);

    if (ASK_ANSWER.test(t)) {
      return "Cevabı söylemeyeceğim, çünkü kararı senin vermen gerek. Ama sana yardım edeyim: " + topic.fallback;
    }
    if (!t.trim()) return topic.fallback;

    for (const c of topic.concepts) {
      if (c.re.test(t)) return c.ack + " " + c.next;
    }
    if (GIVE_UP.test(t)) return topic.giveUp;
    return "Bunu biraz açar mısın? " + topic.fallback;
  }

  /* Koruma: model çıktısı cevabı söylüyor mu veya soru içermiyor mu? */
  const LEAK = /(doğru\s*(cevap|seçenek|karar)\s*(a|b)\b|(a|b)\s*(şıkk?ını|seçeneğini|'?yı|'?yi)\s*(seç|tercih)|seçmelisin|yapmalısın|en\s*iyi\s*seçenek|doğru\s*olan)/;
  function guard(text) {
    const s = norm(text);
    if (!s.includes("?")) return false;
    if (LEAK.test(s)) return false;
    return true;
  }

  const SYSTEM_PROMPT =
    "Sen bir yazılım mühendisliği Sokratik tutorusun. Oyuncu bir sağlık sistemi krizinde karar veriyor. " +
    "KURAL 1: Hangi seçeneğin doğru olduğunu ASLA söyleme, seçenek harfi önerme. " +
    "KURAL 2: Her yanıt en fazla 2 cümle olsun ve en az bir soru içersin. " +
    "KURAL 3: Oyuncunun cevabında doğru bir kavram varsa onu tek cümleyle onayla, sonra bir adım derine inen bir soru sor. " +
    "KURAL 4: Oyuncu cevabı doğrudan isterse nazikçe reddet ve daha küçük bir soru sor. Türkçe yaz.";

  /* Asenkron arayüz: anahtar yoksa yerel motor; varsa Gemini + guard + geri düşüş. */
  async function reply(input, opts) {
    const o = opts || {};
    if (o.apiKey && typeof fetch === "function") {
      try {
        const model = o.model || "gemini-2.5-flash";
        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(o.apiKey),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: "user", parts: [{ text: "Karar: " + input.decisionId + "\nÖğrenci: " + input.text }] }],
              generationConfig: { temperature: 0.4, maxOutputTokens: 200 },
            }),
          }
        );
        const data = await res.json();
        const text = data && data.candidates && data.candidates[0] && data.candidates[0].content.parts.map((p) => p.text).join("");
        if (text && guard(text)) return { text: text.trim(), source: "gemini" };
      } catch (e) {
        /* geri düş */
      }
    }
    return { text: localReply(input), source: "local" };
  }

  const api = { reply, localReply, guard, SYSTEM_PROMPT, TOPICS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SETutor = api;
})(typeof window !== "undefined" ? window : globalThis);
