export const contractTemplate = `
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #0f172a; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    h2 { font-size: 16px; margin: 20px 0 8px; }
    p { margin: 8px 0; line-height: 1.6; }
    .muted { color: #475569; }
    .section { margin: 16px 0; }
    .small { font-size: 12px; }
  </style>

  <h1>Arbeidsovereenkomst</h1>

  <div class="section">
    <p class="muted">De ondergetekenden:</p>
    <p>
      <strong>Werkgever:</strong> Teddy Daycare B.V., gevestigd aan de Zeemanlaan 22a, 2313 SZ Leiden,<br/>
      vertegenwoordigd door Artem Tolmachev
    </p>

    <p>
      <strong>Werknemer:</strong> [NAAM WERKNEMER], geboren op [GEBOORTEDATUM], BSN [BSN],<br/>
      wonende op [ADRES]
    </p>
  </div>

  <div class="section">
    <h2>Arbeidsvoorwaarden</h2>
    <p>
      Treedt in dienst per <strong>[STARTDATUM]</strong> voor de duur van <strong>[DUUR]</strong>, eindigend op <strong>[EINDDATUM]</strong>.<br/>
      Aantal uren per week: <strong>[UREN PER WEEK]</strong>.<br/>
      Functie: <strong>[POSITIE]</strong><br/>
      Locatie: <strong>[LOCATIE]</strong>
    </p>
    <p>
      Salaris: schaal <strong>[SCHAAL]</strong>, trede <strong>[TREDE]</strong> → bruto bij 36u: <strong>€[BRUTO36H]</strong><br/>
      Bruto op basis van [UREN PER WEEK] uur: <strong>€[GROSSMONTHLY]</strong> per maand<br/>
      Reiskostenvergoeding: <strong>€[REISKOSTEN]</strong> per maand
    </p>
  </div>

  <div class="section">
    <h2>Bijzonderheden</h2>
    <p>[NOTITIES]</p>
  </div>

  <div class="section">
    <p>
      Getekend te Leiden<br/>
      [DATUM VAN ONDERTEKENING]
    </p>
  </div>
`;

/*
 * REQUIRED PLACEHOLDERS
 * - [NAAM WERKNEMER]
 * - [GEBOORTEDATUM]
 * - [BSN]
 * - [ADRES]
 * - [STARTDATUM]
 * - [EINDDATUM]
 * - [DUUR]
 * - [UREN PER WEEK]
 * - [POSITIE]
 * - [LOCATIE]
 * - [SCHAAL]
 * - [TREDE]
 * - [BRUTO36H]
 * - [GROSSMONTHLY]
 * - [REISKOSTEN]
 * - [NOTITIES]
 * - [DATUM VAN ONDERTEKENING]
 */
