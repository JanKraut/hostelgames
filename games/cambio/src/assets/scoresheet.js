// Online-Block für Cambio (Seite scoresheet/): Rundenblock aus dem Core (./core/scoresheet-rounds.js).
// Pro Runde schreibt jeder die Summe seiner Karten auf (roter König −1, Joker 0, also auch negativ möglich).
// Ansagen ohne niedrigste Summe kostet nur Strafpunkte, wenn der Tisch das so spielt (Standard: keine);
// gleiche Summe wie der Ansager zählt gegen ihn. Spielende über der Grenze (100), der Niedrigste gewinnt.

import { startSheet } from "./core/scoresheet.js";
import { cardRoundsRules } from "./core/scoresheet-rounds.js";

startSheet(cardRoundsRules({
  id: "cambio",
  minPlayers: 2,
  maxPlayers: 6,
  defaultPlayers: 3,
  min: -20,
  max: 200,
  limit: 100,
  penalty: 0,
  tieLoses: true,
}));
