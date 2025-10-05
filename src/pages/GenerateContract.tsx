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
import { CaoSelector } from "@/components/cao/CaoSelector";
import { SalaryTredeDetector } from "@/components/cao/SalaryTredeDetector";
import type { CaoSelection } from "@/lib/CaoService";
import { ensureStaffExists } from "@/lib/staff";
import { useEmployees, type EmployeeRawData } from "@/hooks/useEmployees";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react";
import { parseRawEmployeeData } from "@/lib/employesProfile";

interface FormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  bsn: string;

  // Address fields to match staff profile
  streetAddress: string;
  houseNumber: string;
  zipcode: string;
  city: string;

  // Contact fields
  phone: string;
  email: string;

  startDate: string;
  endDate: string;
  duration: '' | '6m' | '7m' | '12m' | '18m' | '24m';

  cityOfEmployment: string; // fixed 'Leiden'
  position: string;
  customPosition?: string; // for when position is 'custom'
  positionMan: string; // manual position entry
  scale: string;
  trede: string;
  bruto36h: number; // computed - will be either brutoCAO or brutoMan
  brutoMan: number; // manual bruto entry
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

  // Address fields
  streetAddress: "",
  houseNumber: "",
  zipcode: "",
  city: "",

  // Contact fields
  phone: "",
  email: "",

  startDate: "",
  endDate: "",
  duration: "",

  cityOfEmployment: "Leiden",
  position: "",
  positionMan: "",
  scale: "",
  trede: "",
  bruto36h: 0,
  brutoMan: 0,
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
  const [useCaoCalculator, setUseCaoCalculator] = useState(true);
  const [caoSelection, setCaoSelection] = useState<CaoSelection | undefined>();
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRawData | null>(null);
  const [employeeSelectorOpen, setEmployeeSelectorOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch employees from raw data
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCaoSelection = (selection: CaoSelection) => {
    setFormData(prev => ({
      ...prev,
      scale: selection.scale.toString(),
      trede: selection.trede.toString(),
      bruto36h: selection.calculatedSalary,
      grossMonthly: calculateGrossMonthly(selection.calculatedSalary, prev.hoursPerWeek)
    }));
  };

  const handleEmployeeSelection = (employee: EmployeeRawData) => {
    try {
      const profile = parseRawEmployeeData(employee.api_response);
      setFormData(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        birthDate: profile.birthDate || '',
        bsn: profile.bsn || '',
        streetAddress: profile.streetAddress || '',
        houseNumber: profile.houseNumber || '',
        zipcode: profile.zipcode || '',
        city: profile.city || '',
        phone: profile.phone || '',
        email: profile.email || '',
        position: profile.position || '',
        startDate: profile.startDate || '',
        endDate: profile.endDate || '',
        manager: profile.manager || '',
        hoursPerWeek: profile.hoursPerWeek || 36,
      }));
      setSelectedEmployee(employee);
      setEmployeeSelectorOpen(false);
      toast.success(`Pre-filled data for ${profile.firstName} ${profile.lastName}`);
    } catch (error) {
      console.error('Error parsing employee data:', error);
      toast.error('Error loading employee data');
    }
  };

  const handleClearEmployee = () => {
    setFormData(initialFormData);
    setSelectedEmployee(null);
    toast.info('Form cleared');
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

  // Compute bruto36h based on CAO vs Manual mode
  useEffect(() => {
    if (useCaoCalculator) {
      // CAO mode: compute from scale/trede/startDate
      if (formData.scale && formData.trede && formData.startDate) {
        const bruto = getBruto36hByDate(formData.scale, formData.trede, formData.startDate);
        updateFormData('bruto36h', bruto);
      } else {
        updateFormData('bruto36h', 0);
      }
    } else {
      // Manual mode: use brutoMan
      updateFormData('bruto36h', formData.brutoMan);
    }
  }, [useCaoCalculator, formData.scale, formData.trede, formData.startDate, formData.brutoMan]);

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

    // Address validation
    req("streetAddress", "Street address required");
    req("houseNumber", "House number required");

    // Dutch zipcode validation (e.g., "2313 SZ")
    if (formData.zipcode && !/^[1-9][0-9]{3}\s?[A-Z]{2}$/i.test(formData.zipcode)) {
      newErr.zipcode = "Dutch format: 2313 SZ";
    }
    req("city", "City required");

    // Contact validation
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErr.phone = "Valid phone number required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErr.email = "Valid email required";
    }

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
      toast.error('Missing or invalid fields');
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

      // 🔁 Auto-sync staff directory
      const fullName = `${formData.firstName} ${formData.lastName}`.replace(/\s+/g, " ").trim();
      await ensureStaffExists(fullName, formData.position);

      toast('Contract generated', { description: 'PDF created and saved.' });
      navigate(`/contract/view/${contract.id}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate contract', { description: 'Upload/PDF error' });
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
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Generate Contract</h1>
        <p className="text-muted-foreground mt-1">One-page form. Fill, review, and generate.</p>
      </div>

      {/* Employee Selector */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium">👤 Select Existing Employee</h3>
            {selectedEmployee && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearEmployee}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <Popover open={employeeSelectorOpen} onOpenChange={setEmployeeSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={employeeSelectorOpen}
                className="w-full justify-between"
              >
                {selectedEmployee
                  ? (() => {
                      try {
                        const profile = parseRawEmployeeData(selectedEmployee.api_response);
                        const fullName = `${profile.firstName} ${profile.lastName}`.trim();
                        return fullName || `Employee ${selectedEmployee.employee_id}`;
                      } catch {
                        return `Employee ${selectedEmployee.employee_id}`;
                      }
                    })()
                  : "Search employees..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search employees..." />
                <CommandList>
                  <CommandEmpty>
                    {employeesLoading ? "Loading employees..." : "No employees found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {employees?.map((employee) => {
                      try {
                        const profile = parseRawEmployeeData(employee.api_response);
                        const fullName = `${profile.firstName} ${profile.lastName}`.trim();
                        const displayName = fullName || `Employee ${employee.employee_id}`;

                        return (
                          <CommandItem
                            key={employee.id}
                            value={displayName}
                            onSelect={() => handleEmployeeSelection(employee)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedEmployee?.id === employee.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{displayName}</div>
                              {profile.position && (
                                <div className="text-sm text-muted-foreground">{profile.position}</div>
                              )}
                              {profile.email && (
                                <div className="text-xs text-muted-foreground">{profile.email}</div>
                              )}
                            </div>
                          </CommandItem>
                        );
                      } catch (error) {
                        console.error('Error parsing employee:', employee.id, error);
                        return (
                          <CommandItem
                            key={employee.id}
                            value={`Employee ${employee.employee_id}`}
                            onSelect={() => handleEmployeeSelection(employee)}
                            className="cursor-pointer opacity-50"
                          >
                            <Check className="mr-2 h-4 w-4 opacity-0" />
                            <div className="flex-1">
                              <div className="font-medium">Employee {employee.employee_id}</div>
                              <div className="text-xs text-red-500">Data parsing error</div>
                            </div>
                          </CommandItem>
                        );
                      }
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 mt-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Select an employee to pre-fill all contract data, or fill manually below
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="pt-4 space-y-6">
          {/* Employee Information */}
          <section>
            <h3 className="text-base font-medium mb-3">🧾 Employee Information</h3>
            <div className="grid gap-3 md:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="street-address">Street Address</Label>
                <Input
                  id="street-address"
                  placeholder="e.g., Zeemanlaan"
                  className={errorCls("streetAddress")}
                  value={formData.streetAddress}
                  onChange={(e)=>updateFormData('streetAddress', e.target.value)}
                />
                {errors.streetAddress && <p className="text-xs text-destructive">{errors.streetAddress}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="house-number">House Number</Label>
                <Input
                  id="house-number"
                  placeholder="e.g., 22a"
                  className={errorCls("houseNumber")}
                  value={formData.houseNumber}
                  onChange={(e)=>updateFormData('houseNumber', e.target.value)}
                />
                {errors.houseNumber && <p className="text-xs text-destructive">{errors.houseNumber}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipcode">Zipcode</Label>
                <Input
                  id="zipcode"
                  placeholder="e.g., 2313 SZ"
                  className={errorCls("zipcode")}
                  value={formData.zipcode}
                  onChange={(e)=>updateFormData('zipcode', e.target.value)}
                />
                {errors.zipcode && <p className="text-xs text-destructive">{errors.zipcode}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Leiden"
                  className={errorCls("city")}
                  value={formData.city}
                  onChange={(e)=>updateFormData('city', e.target.value)}
                />
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +31 6 12345678"
                  className={errorCls("phone")}
                  value={formData.phone}
                  onChange={(e)=>updateFormData('phone', e.target.value)}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., name@example.com"
                  className={errorCls("email")}
                  value={formData.email}
                  onChange={(e)=>updateFormData('email', e.target.value)}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
          </section>

          {/* Job Details */}
          <section>
            <h3 className="text-base font-medium mb-3">🏢 Job Details</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select value={formData.position} onValueChange={(v)=>updateFormData('position', v)}>
                  <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pedagogisch Professional">Pedagogisch Professional</SelectItem>
                    <SelectItem value="handyman">Handyman</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem>
                    <SelectItem value="custom">Custom (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.position === 'custom' && (
                  <div className="mt-2">
                    <Label htmlFor="custom-position">Custom Position *</Label>
                    <Input
                      id="custom-position"
                      placeholder="Enter custom position..."
                      value={formData.customPosition || ''}
                      onChange={(e)=>updateFormData('customPosition', e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager *</Label>
                <Select value={formData.manager} onValueChange={(v)=>updateFormData('manager', v)}>
                  <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sofia">Sofia ****</SelectItem>
                    <SelectItem value="meral">Meral ****</SelectItem>
                    <SelectItem value="svetlana">Svetlana ****</SelectItem>
                    <SelectItem value="antonela">Antonela ****</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" readOnly value={formData.cityOfEmployment} />
              </div>
            </div>
          </section>

          {/* Contract Duration */}
          <section>
            <h3 className="text-base font-medium mb-3">📅 Contract Duration</h3>
            <div className="grid gap-3 md:grid-cols-2">
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">💰 Compensation</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseCaoCalculator(!useCaoCalculator)}
              >
                {useCaoCalculator ? 'Manual Entry' : 'CAO Calculator'}
              </Button>
            </div>

            {/* CAO Block with Analysis */}
            {useCaoCalculator ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* CAO Calculator - Left */}
                <div>
                  <CaoSelector
                    value={caoSelection}
                    onChange={(selection) => {
                      setCaoSelection(selection);
                      handleCaoSelection(selection);
                    }}
                    effectiveDate={formData.startDate || new Date().toISOString().split('T')[0]}
                    disabled={!formData.startDate}
                    hoursPerWeek={formData.hoursPerWeek || 36}
                  />
                </div>

                {/* CAO Analysis - Right */}
                <div>
                  {formData.bruto36h > 0 && formData.startDate && (
                    <SalaryTredeDetector
                      salary={formData.bruto36h}
                      effectiveDate={formData.startDate}
                      showAlternatives={false}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-3">Manual salary entry mode</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="manual-position">Position/Job Title</Label>
                      <Input
                        id="manual-position"
                        value={formData.positionMan}
                        onChange={(e)=>updateFormData('positionMan', e.target.value)}
                        placeholder="Enter position title..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-bruto">Bruto (36h) €</Label>
                      <Input
                        id="manual-bruto"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.brutoMan || ''}
                        onChange={(e)=>updateFormData('brutoMan', Number(e.target.value) || 0)}
                        placeholder="Enter bruto amount..."
                      />
                    </div>
                  </div>
                </div>

                {/* Manual Entry Bruto/Netto Display */}
                {formData.brutoMan > 0 && formData.hoursPerWeek > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Bruto - Left */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Bruto
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          €{formData.brutoMan.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      {/* Netto - Right */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Netto
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          €{((formData.hoursPerWeek / 36) * formData.brutoMan).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Compliance Status - Final Summary */}
            {formData.bruto36h > 0 && formData.startDate && (
              <div className={`mt-4 p-3 rounded-lg border ${
                useCaoCalculator
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={useCaoCalculator ? 'text-green-600' : 'text-orange-600'}>
                    {useCaoCalculator ? '✓' : '⚠️'}
                  </span>
                  <span className={`text-sm font-medium ${
                    useCaoCalculator ? 'text-green-800' : 'text-orange-800'
                  }`}>
                    Compliance Status: {useCaoCalculator ? 'COMPLIANT' : 'MANUAL OVERRIDE'}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  useCaoCalculator ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {useCaoCalculator
                    ? '• Salary exactly matches CAO rate'
                    : `• Not following CAO guidelines - Custom salary: €${formData.brutoMan.toLocaleString('nl-NL')}`
                  }
                </p>
                {!useCaoCalculator && (
                  <p className="text-xs text-orange-700 mt-1">
                    • Please ensure compliance with labor agreements
                  </p>
                )}
              </div>
            )}


            {/* Reiskosten */}
            <div className="mt-4">
              <div className="space-y-2">
                <Label>Reiskosten €/month</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.reiskostenPerMonth}
                  onChange={(e)=>updateFormData('reiskostenPerMonth', Number(e.target.value))}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">🗒️ Notes</h4>
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e)=>updateFormData('notes', e.target.value)}
                placeholder="Add any additional notes about the compensation..."
              />
            </div>
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
              <div>Address: {[
                formData.streetAddress && formData.houseNumber ? `${formData.streetAddress} ${formData.houseNumber}` : formData.streetAddress,
                formData.zipcode && formData.city ? `${formData.zipcode} ${formData.city}` : ''
              ].filter(Boolean).join(', ') || '—'}</div>
              <div>Phone: {formData.phone || '—'}</div>
              <div>Email: {formData.email || '—'}</div>
              <div>Position: {useCaoCalculator
                ? (formData.position === 'custom' ? formData.customPosition : formData.position)
                : formData.positionMan
              }</div>
              <div>Manager: {formData.manager}</div>
              {useCaoCalculator && <div>Scale/Trede: {formData.scale}/{formData.trede}</div>}
              <div>Mode: {useCaoCalculator ? 'CAO Calculator' : 'Manual Entry'}</div>
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
