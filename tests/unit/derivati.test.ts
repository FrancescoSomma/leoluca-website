import { describe, it, expect } from "vitest";
import { dimensioniDerivati } from "../../src/components/derivati";

// Stessi due fixture del container test di Foto.astro (Ruling R42): il
// calcolo si sposta qui perché è puro, senza rete, e i due casi coprono i
// due rami possibili (lato lungo verticale e orizzontale).
describe("dimensioniDerivati", () => {
  it("un ritratto 4480×6720 scarta le larghezze il cui lato lungo supera i 2400 px", () => {
    const { larghezze, larghezza, altezza } = dimensioniDerivati(4480, 6720);
    expect(larghezze).toEqual([400, 800, 1200, 1600]);
    expect(larghezza).toBe(1600);
    expect(altezza).toBe(2400);
  });

  it("un orizzontale 5472×3648 (il poster di prova) arriva fino a 2400 px", () => {
    const { larghezze, larghezza, altezza } = dimensioniDerivati(5472, 3648);
    expect(larghezze).toEqual([400, 800, 1200, 1600, 2400]);
    expect(larghezza).toBe(2400);
    expect(altezza).toBe(1600);
  });
});
