// Online-Block für Cabo (Seite scoresheet/): Rundenblock aus dem Core (./core/scoresheet-rounds.js).
// Pro Runde schreibt jeder die Summe seiner Karten auf; wer „Cabo“ gesagt hat, bekommt 0 (niedrigste oder
// gleiche Summe) oder seine Summe plus Strafpunkte. Das Spiel endet über der Grenze (100), der Niedrigste gewinnt.
// Genau 100 Punkte: Punktestand fällt auf 50, einmal pro Spieler.

import { startSheet } from "./core/scoresheet.js";
import { cardRoundsRules } from "./core/scoresheet-rounds.js";

startSheet(cardRoundsRules({
  id: "cabo",
  minPlayers: 2,
  maxPlayers: 5,
  defaultPlayers: 3,
  min: 0,
  max: 200,
  limit: 100,
  penalty: 10,
  callerZero: true,
  reset: true,
}));
