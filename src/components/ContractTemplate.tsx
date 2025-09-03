import React from 'react';

export type ContractParams = {
  firstName: string;
  lastName: string;
  birthDate: string;
  bsn?: string;
  address?: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  cityOfEmployment?: string;
  position: string;
  manager?: string;
  scale?: string | number;
  trede?: string | number;
  bruto36h?: number;
  hoursPerWeek?: number;
  grossMonthly?: number;
  reiskostenPerMonth?: number;
  notes?: string;
};

const fmtMoney = (v?: number) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(v).replace('\u00a0', ' ')
    : '';

const maskBsn = (bsn?: string) => (bsn ? `••••${bsn.slice(-4)}` : '');

export default function ContractTemplate(props: ContractParams) {
  const fullName = `${props.firstName ?? ''} ${props.lastName ?? ''}`.trim();
  const city = props.cityOfEmployment || 'Leiden';

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', color: '#0f172a' }}>
      <style>{`
        h1 { font-size: 22px; margin: 0 0 12px; }
        h2 { font-size: 16px; margin: 20px 0 8px; }
        p { margin: 8px 0; line-height: 1.6; }
        .muted { color: #475569; }
        .section { margin: 16px 0; }
        .small { font-size: 12px; }
        .hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <img src="/teddykids-logo-placeholder.svg" alt="Teddy Kids logo" style={{ maxWidth: 140, marginBottom: 8 }} />
        <h1 style={{ margin: 0 }}>Arbeidsovereenkomst</h1>
      </div>
      <hr className="hr" />

      <div className="section">
        <p className="muted">De ondergetekenden:</p>
        <p>
          <strong>Werkgever:</strong> Teddy Daycare B.V., gevestigd aan de Zeemanlaan 22a, 2313 SZ Leiden,<br/>
          vertegenwoordigd door Artem Tolmachev
        </p>

        <p>
          <strong>Werknemer:</strong> {fullName}, geboren op {props.birthDate}, BSN {maskBsn(props.bsn)},<br/>
          wonende op {props.address || ''}
        </p>
      </div>

      <div className="section">
        <h2>Arbeidsvoorwaarden</h2>
        <p>
          Treedt in dienst per <strong>{props.startDate}</strong> voor de duur van <strong>{props.duration || ''}</strong>, eindigend op <strong>{props.endDate || ''}</strong>.<br/>
          Aantal uren per week: <strong>{props.hoursPerWeek ?? ''}</strong>.<br/>
          Functie: <strong>{props.position}</strong><br/>
          Locatie: <strong>{city}</strong>
        </p>
        <p>
          Salaris: schaal <strong>{props.scale ?? ''}</strong>, trede <strong>{props.trede ?? ''}</strong> → bruto bij 36u: <strong>{fmtMoney(props.bruto36h)}</strong><br/>
          Bruto op basis van {props.hoursPerWeek ?? ''} uur: <strong>{fmtMoney(props.grossMonthly)}</strong> per maand<br/>
          Reiskostenvergoeding: <strong>{fmtMoney(props.reiskostenPerMonth)}</strong> per maand
        </p>
      </div>

      <div className="section">
        <h2>Bijzonderheden</h2>
        <p>{props.notes || ''}</p>
      </div>

      <div className="section">
        <h2>Handtekeningen</h2>
        <p className="small muted">Werknemer:</p>
        <p style={{ height: 48, borderBottom: '1px solid #cbd5e1', width: '60%' }} />
        <p className="small muted">Datum: ____________________</p>
        <br/>
        <p className="small muted">Werkgever (Teddy Kids):</p>
        <p style={{ height: 48, borderBottom: '1px solid #cbd5e1', width: '60%' }} />
        <p className="small muted">Datum: ____________________</p>
      </div>

      <div className="section">
        <p>
          Getekend te Leiden<br/>
          {new Date().toLocaleDateString('nl-NL')}
        </p>
      </div>
    </div>
  );
}
