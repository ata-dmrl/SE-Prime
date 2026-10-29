// SE Primer — tüm yollar E2E. Beklenen son, spec.md §5 kuralından bağımsız yazıldı:
// Son A ⇔ KVKK=A ve en az 2 güvenli seçim.
const onboard = (level = "orta", role = "backend", goal = "ogrenmek") => {
  cy.visit("/");
  cy.get(`[data-testid=level-${level}]`).click();
  cy.get(`[data-testid=role-${role}]`).click();
  cy.get(`[data-testid=goal-${goal}]`).click();
  cy.get("[data-testid=start-btn]").click();
  cy.get("[data-testid=scene-next]").click();
};

const expectedEnding = ([d1, d2, d3]) => {
  const safe = [d1 === "A", d2 === "A", d3 === "A"].filter(Boolean).length;
  return d3 === "A" && safe >= 2 ? "SON A" : "SON B";
};

describe("Giriş", () => {
  it("3 soru cevaplanmadan başlatılamaz", () => {
    cy.visit("/");
    cy.get("[data-testid=start-btn]").should("be.disabled");
    cy.get("[data-testid=level-yeni]").click();
    cy.get("[data-testid=role-devops]").click();
    cy.get("[data-testid=start-btn]").should("be.disabled");
    cy.get("[data-testid=goal-mulakat]").click();
    cy.get("[data-testid=start-btn]").should("be.enabled");
  });

  it("rol anlatıya yansır", () => {
    cy.visit("/");
    cy.get("[data-testid=level-orta]").click();
    cy.get("[data-testid=role-frontend]").click();
    cy.get("[data-testid=goal-is]").click();
    cy.get("[data-testid=start-btn]").click();
    cy.get("[data-testid=scene-text]").should("contain", "randevu sistemi çöktü");
    cy.get("[data-testid=role-intro]").should("contain", "boş bir ekran");
  });
});

describe("Tüm yollar (2^3 = 8)", () => {
  const paths = [];
  for (const a of "AB") for (const b of "AB") for (const c of "AB") paths.push([a, b, c]);

  paths.forEach((p) => {
    it(`yol ${p.join("")} → ${expectedEnding(p)}`, () => {
      onboard();
      p.forEach((opt, i) => {
        cy.get("[data-testid=prompt]").should("be.visible");
        cy.get(`[data-testid=option-${opt}]`).click();
        cy.get("[data-testid=outcome-what]").should("not.be.empty");
        cy.get("[data-testid=outcome-why]").should("not.be.empty");
        cy.get("[data-testid=continue-btn]").click();
      });
      cy.get("[data-testid=ending-title]").should("contain", expectedEnding(p));
      cy.get("[data-testid=recap] li").should("have.length", 3);
      if (expectedEnding(p) === "SON B") cy.get("[data-testid=reasons] li").should("have.length.at.least", 1);
      cy.get("[data-testid=goal-note]").should("contain", "Öğrenme notu");
    });
  });

  it("hedef kapanış notunu değiştirir", () => {
    onboard("orta", "backend", "mulakat");
    ["A", "A", "A"].forEach((o) => { cy.get(`[data-testid=option-${o}]`).click(); cy.get("[data-testid=continue-btn]").click(); });
    cy.get("[data-testid=goal-note]").should("contain", "Mülakat notu");
  });

  it("tekrar oyna girişe döner", () => {
    onboard();
    ["A", "A", "A"].forEach((o) => { cy.get(`[data-testid=option-${o}]`).click(); cy.get("[data-testid=continue-btn]").click(); });
    cy.get("[data-testid=replay-btn]").click();
    cy.get("[data-testid=start-btn]").should("be.disabled");
  });
});

describe("Kişiselleştirme: seviye", () => {
  it("'Yeni başladım' her kararda ipucu görür", () => {
    onboard("yeni");
    for (let i = 0; i < 3; i++) {
      cy.get("[data-testid=hint-text]").should("be.visible");
      cy.get("[data-testid=option-A]").click();
      cy.get("[data-testid=continue-btn]").click();
    }
  });

  it("'Biraz biliyorum' ipucunu isteyince görür", () => {
    onboard("orta");
    cy.get("[data-testid=hint-text]").should("not.exist");
    cy.get("[data-testid=hint-btn]").click();
    cy.get("[data-testid=hint-text]").should("be.visible");
  });

  it("'Deneyimliyim' ipucu görmez ve 60 sn süre baskısı altındadır", () => {
    cy.clock();
    onboard("deneyimli");
    cy.get("[data-testid=hint-text]").should("not.exist");
    cy.get("[data-testid=hint-btn]").should("not.exist");
    cy.get("[data-testid=timer]").should("contain", "60");
    cy.tick(10000);
    cy.get("[data-testid=timer]").should("contain", "50");
  });

  it("süre dolunca acele (B) karar verilir", () => {
    cy.clock();
    onboard("deneyimli");
    cy.tick(60000);
    cy.get("[data-testid=timeout-note]").should("be.visible");
    cy.get("[data-testid=chosen]").should("contain", "B)");
  });
});

describe("AI tutor", () => {
  beforeEach(() => onboard("orta"));

  it("cevabı söylemez, soru sorar", () => {
    cy.get("[data-testid=tutor-input]").type("Doğru cevabı söyler misin, A mı B mi?");
    cy.get("[data-testid=tutor-send]").click();
    cy.get("[data-testid=tutor-tutor]").should("contain", "?").and("contain", "söylemeyeceğim");
    cy.get("[data-testid=tutor-tutor]").invoke("text").should("not.match", /seçmelisin|doğru cevap (a|b)\b/i);
  });

  it("öğrencinin kavramını kullanıp derine iner", () => {
    cy.get("[data-testid=tutor-input]").type("Şemayı kontrol ederim");
    cy.get("[data-testid=tutor-send]").click();
    cy.get("[data-testid=tutor-tutor]").should("contain", "Şema").and("contain", "?");
  });
});
