function calcolaTempo() {
  const m = parseFloat(document.getElementById("massa").value);
  const v0 = parseFloat(document.getElementById("velocita").value);
  const gL = 1.66; // gravità lunare

  // controllo validità
  if (isNaN(m) || isNaN(v0) || m < 10 || m > 100000 || v0 < 1 || v0 > 1000) {
    document.getElementById("risultato").innerText = "Inserisci valori validi.";
    return;
  }

  // forza = massa * gravità lunare
  const forza = m * gL;
  const a = forza / m;  // semplifica: a = gL

  const tempo = v0 / a;

  document.getElementById("risultato").innerText =
    `Tempo di allunaggio: ${tempo.toFixed(2)} secondi`;
}