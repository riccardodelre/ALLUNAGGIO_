function calcolaTempo() {
  const massaNav = parseFloat(document.getElementById("massa").value);
  const velocitaIniziale = parseFloat(document.getElementById("velocita").value);

  // Validazione input
  if (
    isNaN(massaNav) || isNaN(velocitaIniziale) ||
    massaNav < 10 || massaNav > 100000 ||
    velocitaIniziale < 1 || velocitaIniziale > 1000
  ) {
    document.getElementById("risultato").innerHTML = "Inserisci valori validi!";
    return;
  }

  // Costanti
  const gL = 1.66; // m/s^2 accelerazione di gravità lunare

  // Accelerazione (Forza risultante = m_nav * gL, quindi a = gL)
  const accelerazione = gL;

  // Tempo di allunaggio (t = v0 / a)
  const tempo = velocitaIniziale / accelerazione;

  document.getElementById("risultato").innerHTML =
    `Accelerazione: <b>${accelerazione.toFixed(2)} m/s²</b><br>` +
    `Tempo: <b>${tempo.toFixed(2)} s</b>`;
}