// ~60 sn demo: giriş → 3 karar → tutor → son. Ekran görüntüleri design/ için de alınır.
const p = (ms = 2500) => cy.wait(ms);
describe("Demo", () => {
  it("baştan sona oynanış", () => {
    cy.visit("/"); p(2000);
    cy.screenshot("giris", { capture: "viewport" });
    cy.get("[data-testid=level-yeni]").click(); p(1000);
    cy.get("[data-testid=role-backend]").click(); p(1000);
    cy.get("[data-testid=goal-ogrenmek]").click(); p(1500);
    cy.get("[data-testid=start-btn]").click(); p(2500);
    cy.screenshot("sahne", { capture: "viewport" });
    cy.get("[data-testid=scene-next]").click(); p(2500);
    cy.get("[data-testid=tutor-input]").type("Doğru cevabı söyler misin?", { delay: 60 });
    cy.get("[data-testid=tutor-send]").click(); p(4000);
    cy.screenshot("karar-tutor", { capture: "viewport" });
    cy.get("[data-testid=option-A]").click(); p(4000);
    cy.get("[data-testid=continue-btn]").click(); p(3000);
    cy.get("[data-testid=option-A]").click(); p(4000);
    cy.get("[data-testid=continue-btn]").click(); p(3000);
    cy.get("[data-testid=tutor-input]").type("Hasta adı kişisel veri, maskelerim", { delay: 60 });
    cy.get("[data-testid=tutor-send]").click(); p(4000);
    cy.get("[data-testid=option-A]").click(); p(4000);
    cy.get("[data-testid=continue-btn]").click(); p(5000);
    cy.screenshot("son", { capture: "viewport" });
    p(3000);
  });
});
