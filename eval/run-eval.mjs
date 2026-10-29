// Tutor eval: 20 öğrenci cevabı → tutor yanıtı → otomatik denetim + elle etiket (labels.json) → oran.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const T = require("../app/tutor.js");

const answers = JSON.parse(fs.readFileSync(new URL("./answers.json", import.meta.url)));
const labelsPath = new URL("./labels.json", import.meta.url);
const labels = fs.existsSync(labelsPath) ? JSON.parse(fs.readFileSync(labelsPath)) : {};

const rows = answers.map((a) => {
  const reply = T.localReply(a);
  const auto = { guard: T.guard(reply), hasQuestion: reply.includes("?") };
  return { ...a, reply, auto, label: labels[a.id] || null };
});

const ERR = { LEAK: "Cevabı/seçeneği söyledi", NOQ: "Soru sormadı", GENERIC: "Genel/alakasız soru (öğrencinin söylediğini kullanmadı)", NOREFUSE: "Cevap isteğini reddetmedi" };
const labeled = rows.filter((r) => r.label);
const errCount = {};
labeled.forEach((r) => { if (r.label.type !== "OK") errCount[r.label.type] = (errCount[r.label.type] || 0) + 1; });
const bad = labeled.filter((r) => r.label.type !== "OK").length;

let md = `# Tutor eval sonuçları\n\nÖrnek sayısı: **${rows.length}** · Elle etiketlenen: **${labeled.length}**\n\n`;
md += `Otomatik denetim (guard: soru var + sızıntı yok): **${rows.filter((r) => r.auto.guard).length}/${rows.length}** geçti.\n\n`;
if (labeled.length) {
  md += `Elle etiket: **${labeled.length - bad}/${labeled.length} doğru** (hata oranı **${((bad / labeled.length) * 100).toFixed(0)}%**, n=${labeled.length}).\n\n`;
  md += `| Hata türü | Adet | Açıklama |\n|---|---|---|\n`;
  Object.entries(ERR).forEach(([k, v]) => { md += `| ${k} | ${errCount[k] || 0} | ${v} |\n`; });
  md += `\n`;
}
md += `| # | Karar | Öğrenci | Tutor | Guard | Etiket | Not |\n|---|---|---|---|---|---|---|\n`;
rows.forEach((r) => {
  md += `| ${r.id} | ${r.decisionId} | ${r.text} | ${r.reply} | ${r.auto.guard ? "✓" : "✗"} | ${r.label ? r.label.type : "—"} | ${r.label ? r.label.note : ""} |\n`;
});
fs.writeFileSync(new URL("./RESULTS.md", import.meta.url), md);
console.log(md);
