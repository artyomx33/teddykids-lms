import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { createContractRecord, generateContractPdfBlob, uploadContractPdf, updateContractRecord } from "@/lib/contracts";
import { getBruto36hByDate, calculateGrossMonthly } from "@/lib/cao";

interface FormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  bsn: string;
  address: string;

  startDate: string;
  endDate: string;
  duration: '' | '6m' | '7m' | '12m' | '18m' | '24m';

  cityOfEmployment: string; // fixed 'Leiden'
  position: string;
  scale: string;
  trede: string;
  bruto36h: number; // computed
  hoursPerWeek: number;
  grossMonthly: number; // computed

  reiskostenPerMonth: number; // manual

  manager: string;
  notes: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  birthDate: "",
  bsn: "",
  address: "",

  startDate: "",
  endDate: "",
  duration: "",

  cityOfEmployment: "Leiden",
  position: "",
  scale: "",
  trede: "",
  bruto36h: 0,
  hoursPerWeek: 36,
  grossMonthly: 0,

  reiskostenPerMonth: 0,

  manager: "",
  notes: "",
};

export default function GenerateContract() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Compute end date from startDate + duration
  useEffect(() => {
    if (!formData.startDate || !formData.duration) return;
    const start = new Date(formData.startDate);
    let months = 0;
    switch (formData.duration) {
      case '6m': months = 6; break;
      case '7m': months = 7; break;
      case '12m': months = 12; break;
      case '18m': months = 18; break;
      case '24m': months = 24; break;
      default: months = 0;
    }
    if (months > 0) {
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      updateFormData('endDate', end.toISOString().split('T')[0]);
    } else {
      updateFormData('endDate', '');
    }
  }, [formData.startDate, formData.duration]);

  // Compute bruto36h when scale/trede/startDate changes
  useEffect(() => {
    if (formData.scale && formData.trede && formData.startDate) {
      const bruto = getBruto36hByDate(formData.scale, formData.trede, formData.startDate);
      updateFormData('bruto36h', bruto);
    } else {
      updateFormData('bruto36h', 0);
    }
  }, [formData.scale, formData.trede, formData.startDate]);

  // Compute grossMonthly when bruto36h or hoursPerWeek changes
  useEffect(() => {
    if (formData.bruto36h && formData.hoursPerWeek) {
      updateFormData('grossMonthly', calculateGrossMonthly(formData.bruto36h, formData.hoursPerWeek));
    } else {
      updateFormData('grossMonthly', 0);
    }
  }, [formData.bruto36h, formData.hoursPerWeek]);

  /* --------------------------------------------------------------------- */
  /* Validation helpers                                                    */
  /* --------------------------------------------------------------------- */

  const errorCls = (field: keyof FormData) =>
    errors[field]
      ? "border-destructive focus-visible:ring-destructive"
      : "";

  const validate = (): boolean => {
    const newErr: Record<string, string> = {};
    const req = <K extends keyof FormData>(k: K, msg = "Required") => {
      if (!formData[k]) newErr[k] = msg;
    };

    req("firstName");
    req("lastName");
    req("birthDate");

    if (!/^[0-9]{8,9}$/.test(formData.bsn)) newErr.bsn = "8–9 digits";

    req("position");
    req("manager");

    if (formData.scale !== "6") newErr.scale = "Only scale 6 supported";

    const tredeNum = parseInt(formData.trede, 10);
    if (Number.isNaN(tredeNum) || tredeNum < 10 || tredeNum > 23)
      newErr.trede = "Trede 10-23";

    req("startDate");
    if (!formData.duration) newErr.duration = "Select duration";

    if (formData.hoursPerWeek < 1 || formData.hoursPerWeek > 40)
      newErr.hoursPerWeek = "1-40";

    if (formData.grossMonthly === 0)
      newErr.grossMonthly = "Invalid scale/trede";

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast({ title: "Missing or invalid fields", variant: "destructive" });
      return;
    }
    setShowSummary(true);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const computed = {
        bruto36h: getBruto36hByDate(formData.scale, formData.trede, formData.startDate),
        grossMonthly: calculateGrossMonthly(formData.bruto36h, formData.hoursPerWeek),
      };

      const payload = {
        employee_name: `${formData.firstName} ${formData.lastName}`.trim(),
        manager: formData.manager,
        status: 'generated',
        contract_type: 'bepaalde_tijd',
        department: formData.position,
        signed_at: null,
        pdf_path: null,
        query_params: { ...formData, ...computed },
      };

      const contract = await createContractRecord(supabase, payload);
      const pdfBlob = await generateContractPdfBlob({ ...formData, ...computed });
      const pdfPath = await uploadContractPdf(supabase, contract.id, pdfBlob);
      await updateContractRecord(supabase, contract.id, { pdf_path: pdfPath, status: 'generated' });

      toast({ title: 'Contract generated', description: 'PDF created and saved.' });
      navigate(`/contract/view/${contract.id}`);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to generate contract', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openHtmlPreview = () => {
    const w = window.open('');
    if (!w) return;
    w.document.write(`<pre>${JSON.stringify(formData, null, 2)}</pre>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Generate Contract</h1>
        <p className="text-muted-foreground mt-1">One-page form. Fill, review, and generate.</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6 space-y-8">
          {/* Employee Information */}
          <section>
            <h3 className="text-lg font-semibold mb-4">🧾 Employee Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input id="firstName" value={formData.firstName} autoCapitalize="words" onChange={(e)=>updateFormData('firstName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input id="lastName" value={formData.lastName} autoCapitalize="words" onChange={(e)=>updateFormData('lastName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birthdate *</Label>
                <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e)=>updateFormData('birthDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bsn">BSN *</Label>
                <Input
                  id="bsn"
                  placeholder="e.g., 123456789"
                  inputMode="numeric"
                  maxLength={9}
                  className={errorCls("bsn")}
                  value={formData.bsn}
                  onChange={(e)=>{
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= 9) updateFormData('bsn', v);
                }} />
                {errors.bsn && <p className="text-xs text-destructive">{errors.bsn}</p>}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" rows={3} value={formData.address} onChange={(e)=>updateFormData('address', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Job Details */}
          <section>
            <h3 className="text-lg font-semibold mb-4">🏢 Job Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input id="position" value={formData.position} onChange={(e)=>updateFormData('position', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager *</Label>
                <Select value={formData.manager} onValueChange={(v)=>updateFormData('manager', v)}>
                  <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mike-chen">Mike Chen</SelectItem>
                    <SelectItem value="lisa-wang">Lisa Wang</SelectItem>
                    <SelectItem value="david-kim">David Kim</SelectItem>
                    <SelectItem value="anna-brown">Anna Brown</SelectItem>
                    <SelectItem value="tom-lee">Tom Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale">Scale *</Label>
                <Input id="scale" inputMode="numeric" value={formData.scale} onChange={(e)=>updateFormData('scale', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trede">Trede *</Label>
                <Input id="trede" inputMode="numeric" value={formData.trede} onChange={(e)=>updateFormData('trede', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" readOnly value={formData.cityOfEmployment} />
              </div>
            </div>
          </section>

          {/* Contract Duration */}
          <section>
            <h3 className="text-lg font-semibold mb-4">📅 Contract Duration</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date *</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e)=>updateFormData('startDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" readOnly className="bg-muted" value={formData.endDate} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Duration *</Label>
                <div className="flex gap-2 flex-wrap">
                  {(['6m','7m','12m','18m','24m'] as const).map(d => (
                    <Button key={d} type="button" variant={formData.duration===d? 'default':'outline'} onClick={()=>updateFormData('duration', d)}>
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Hours per week *</Label>
                <Input id="hoursPerWeek" type="number" min="1" max="40" value={formData.hoursPerWeek} onChange={(e)=>updateFormData('hoursPerWeek', Number(e.target.value))} />
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section>
            <h3 className="text-lg font-semibold mb-4">💰 Compensation</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Bruto 36h (auto)</Label>
                <Input readOnly className="bg-muted" value={`€ ${formData.bruto36h.toFixed(2)}`} />
              </div>
              <div className="space-y-2">
                <Label>Gross monthly (auto)</Label>
                <Input readOnly className="bg-muted" value={`€ ${formData.grossMonthly.toFixed(2)}`} />
              </div>
              <div className="space-y-2">
                <Label>Reiskosten €/month</Label>
                <Input type="number" min="0" value={formData.reiskostenPerMonth} onChange={(e)=>updateFormData('reiskostenPerMonth', Number(e.target.value))} />
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-lg font-semibold mb-4">🗒️ Notes</h3>
            <Textarea rows={4} value={formData.notes} onChange={(e)=>updateFormData('notes', e.target.value)} />
          </section>

          {/* Submit */}
          <div className="pt-2">
            <Button className="bg-gradient-primary hover:shadow-glow" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {showSummary && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Review and confirm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div>Name: {formData.firstName} {formData.lastName}</div>
              <div>Birthdate: {formData.birthDate}</div>
              <div>BSN: {formData.bsn ? `••••${formData.bsn.slice(-4)}` : '—'}</div>
              <div>Position: {formData.position}</div>
              <div>Manager: {formData.manager}</div>
              <div>Scale/Trede: {formData.scale}/{formData.trede}</div>
              <div>Start → End: {formData.startDate} → {formData.endDate || '—'}</div>
              <div>Hours per week: {formData.hoursPerWeek}</div>
              <div>Bruto 36h: € {formData.bruto36h.toFixed(2)}</div>
              <div>Gross monthly: € {formData.grossMonthly.toFixed(2)}</div>
              <div>Reiskosten: € {formData.reiskostenPerMonth.toFixed(2)}/month</div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Generate PDF
              </Button>
              <Button variant="outline" onClick={openHtmlPreview}>View HTML</Button>
              <Button variant="ghost" onClick={()=>setShowSummary(false)}>Back</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
