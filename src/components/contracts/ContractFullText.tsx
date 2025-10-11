import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ContractFullTextProps {
  contract: any;
}

export function ContractFullText({ contract }: ContractFullTextProps) {
  const queryParams = contract.query_params || {};
  
  // Extract data for template
  const employeeName = contract.employee_name || `${queryParams.firstName || ''} ${queryParams.lastName || ''}`.trim();
  const birthDate = queryParams.birthDate;
  const address = formatAddress(queryParams);
  const bsn = queryParams.bsn;
  const startDate = queryParams.startDate;
  const endDate = queryParams.endDate;
  const contractType = queryParams.contractType || contract.contract_type || 'Bepaalde tijd';
  const hoursPerWeek = queryParams.hoursPerWeek;
  const functionTitle = queryParams.functionTitle || queryParams.position;
  const city = queryParams.cityOfEmployment || 'Leiden';
  const scale = queryParams.scale;
  const trede = queryParams.trede;
  const grossMonthly = queryParams.grossMonthly;
  const probation = queryParams.probation || '2 maanden';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Full Contract
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {/* Contract Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Arbeidsovereenkomst</h2>
            <p className="text-muted-foreground">{contractType}</p>
          </div>

          <Separator className="my-4" />

          {/* Parties */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Partijen</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Werkgever:</p>
                <p className="ml-4">
                  Teddy Daycare B.V., handelend onder de naam Teddy Kids,<br />
                  gevestigd aan de Zeemanlaan 22a, 2313 SZ Leiden,<br />
                  rechtsgeldig vertegenwoordigd door de directie.
                </p>
              </div>

              <div>
                <p className="font-medium">Werknemer:</p>
                <p className="ml-4">
                  {employeeName || '[Naam]'},<br />
                  {birthDate && `geboren op ${birthDate},`}<br />
                  {address && `${address},`}<br />
                  {bsn && `BSN: ${maskBsn(bsn)}`}
                </p>
              </div>
            </div>
          </section>

          <Separator className="my-4" />

          {/* Article 1: Duration */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 1 – Duur en proeftijd</h3>
            <p className="text-sm ml-4">
              Deze arbeidsovereenkomst vangt aan op <strong>{startDate || '[Startdatum]'}</strong>
              {endDate && (
                <> en eindigt op <strong>{endDate}</strong></>
              )}
              {!endDate && ' voor onbepaalde tijd'}
              .<br />
              Er geldt een proeftijd van <strong>{probation}</strong>.<br />
              Tussentijdse opzegging is mogelijk met inachtneming van de wettelijke en CAO-opzegtermijnen.
            </p>
          </section>

          {/* Article 2: Function */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 2 – Functie en standplaats</h3>
            <p className="text-sm ml-4">
              Werknemer treedt in dienst als <strong>{functionTitle || '[Functie]'}</strong>.<br />
              De werkzaamheden worden verricht op vestigingen van Teddy Kids in {city}.<br />
              Werkgever kan in overleg de standplaats wijzigen. Werknemer is niet verplicht te verhuizen.
            </p>
          </section>

          {/* Article 3: Working Hours */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 3 – Arbeidsduur en werktijden</h3>
            <p className="text-sm ml-4">
              De overeengekomen arbeidsduur bedraagt <strong>{hoursPerWeek || '[Uren]'} uur per week</strong>.<br />
              De werktijden liggen tussen 07:00 en 19:00 uur, maandag t/m vrijdag, en worden in overleg vastgesteld.<br />
              Plus/min-uren worden bijgehouden volgens het JUS-systeem.
            </p>
          </section>

          {/* Article 4: Salary */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 4 – Salaris en vergoedingen</h3>
            <p className="text-sm ml-4">
              Het salaris is vastgesteld volgens de CAO Kinderopvang,
              {scale && trede && (
                <> schaal <strong>{scale}</strong>, trede <strong>{trede}</strong>,</>
              )}
              {grossMonthly && (
                <> en bedraagt bij een fulltime dienstverband (36 uur) <strong>€{grossMonthly}</strong> bruto per maand.</>
              )}
              <br />
              Het salaris wordt naar rato van de contracturen uitbetaald.<br />
              Werknemer ontvangt 8% vakantietoeslag conform de CAO.<br />
              Reiskostenvergoeding: €0,23 per km voor woon-werkverkeer vanaf 10 km enkele reis.
            </p>
          </section>

          {/* Article 5: Illness */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 5 – Ziekte en verzuim</h3>
            <p className="text-sm ml-4">
              Werknemer meldt zich bij ziekte uiterlijk 07:00 uur of minimaal één uur vóór de geplande werktijd telefonisch bij de leidinggevende of planner.<br />
              Het verzuimprotocol (LIM) is van toepassing.<br />
              Loon wordt doorbetaald conform de CAO Kinderopvang.
            </p>
          </section>

          {/* Article 6: Pension */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 6 – Pensioen</h3>
            <p className="text-sm ml-4">
              Werknemer neemt deel aan het pensioenfonds zoals geregeld in de CAO Kinderopvang.
            </p>
          </section>

          {/* Article 7: Training */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 7 – Opleiding en scholing</h3>
            <p className="text-sm ml-4">
              Wettelijk verplichte opleidingen (o.a. EHBO, BHV, babycursus) worden volledig vergoed door werkgever.<br />
              Voor niet-verplichte opleidingen geldt een terugbetalingsregeling.
            </p>
          </section>

          {/* Article 8: Confidentiality */}
          <section className="mb-6">
            <h3 className="font-semibold text-base mb-3">Artikel 8 – Geheimhouding en privacy</h3>
            <p className="text-sm ml-4">
              Werknemer is verplicht tot strikte geheimhouding van alle vertrouwelijke informatie met betrekking tot kinderen, ouders, collega's en bedrijfsvoering.<br />
              Het gebruik van privételefoons op de groep is uitsluitend toegestaan in noodgevallen.<br />
              Het maken, opslaan of delen van foto's of video's van kinderen op privételefoons is ten strengste verboden.
            </p>
          </section>

          {/* Signatures */}
          <section className="mt-8">
            <h3 className="font-semibold text-base mb-3">Ondertekening</h3>
            
            <div className="space-y-6 text-sm">
              <div>
                <p className="font-medium mb-2">Teddy Daycare B.V.</p>
                <div className="border-b border-muted w-64 h-12 mb-2"></div>
                <p className="text-muted-foreground text-xs">Namens de directie</p>
              </div>

              <div>
                <p className="font-medium mb-2">Werknemer</p>
                <div className="border-b border-muted w-64 h-12 mb-2"></div>
                <p className="text-muted-foreground text-xs">{employeeName}</p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Welcome to the Teddy Family! 🧸
            </p>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function formatAddress(queryParams: any): string {
  const parts = [];
  
  if (queryParams.streetAddress) {
    let street = queryParams.streetAddress;
    if (queryParams.houseNumber) {
      street += ` ${queryParams.houseNumber}`;
    }
    parts.push(street);
  }
  
  if (queryParams.zipcode || queryParams.city) {
    const location = [queryParams.zipcode, queryParams.city].filter(Boolean).join(' ');
    if (location) parts.push(location);
  }
  
  return parts.join(', ');
}

function maskBsn(bsn: string): string {
  if (!bsn) return '';
  if (bsn.length < 4) return bsn;
  return '••••' + bsn.slice(-4);
}


