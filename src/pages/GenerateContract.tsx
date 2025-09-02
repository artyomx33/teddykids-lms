import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, User, FileText, Eye, Briefcase, Clock, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { createContractRecord, generateContractPdfBlob, uploadContractPdf, updateContractRecord } from "@/lib/contracts";
import { getBruto36h, calculateGrossMonthly, calculateReiskosten } from "@/lib/cao";

interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  birthDate: string;
  bsn: string;
  address: string;
  
  // Job Info
  position: string;
  scale: string;
  trede: string;
  cityOfEmployment: string;
  manager: string;
  
  // Schedule
  startDate: string;
  endDate: string;
  duration: string; // '6m' | '7m' | '12m' | '18m' | '24m' | ''
  hoursPerWeek: number;
  
  // Salary Info
  bruto36h: number;
  grossMonthly: number;
  reiskostenKm: number;
  reiskostenPerMonth: number;
  
  // Additional Details
  notes: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  birthDate: "",
  bsn: "",
  address: "",
  position: "",
  scale: "",
  trede: "",
  cityOfEmployment: "Leiden",
  manager: "",
  startDate: "",
  endDate: "",
  duration: "",
  hoursPerWeek: 36,
  bruto36h: 0,
  grossMonthly: 0,
  reiskostenKm: 0,
  reiskostenPerMonth: 0,
  notes: "",
};

const steps = [
  {
    id: 1,
    title: "Personal",
    description: "Employee personal details",
    icon: User,
  },
  {
    id: 2,
    title: "Job",
    description: "Position and department",
    icon: Briefcase,
  },
  {
    id: 3,
    title: "Schedule",
    description: "Schedule and timeline",
    icon: Clock,
  },
  {
    id: 4,
    title: "Salary",
    description: "Compensation details",
    icon: DollarSign,
  },
  {
    id: 5,
    title: "Review",
    description: "Review and generate",
    icon: Eye,
  },
];

export default function GenerateContract() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate end date when start date or duration changes
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const startDate = new Date(formData.startDate);
      let months = 0;
      
      switch (formData.duration) {
        case "6m": months = 6; break;
        case "7m": months = 7; break;
        case "12m": months = 12; break;
        case "18m": months = 18; break;
        case "24m": months = 24; break;
        default: months = 0;
      }
      
      if (months > 0) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + months);
        updateFormData("endDate", endDate.toISOString().split('T')[0]);
      }
    }
  }, [formData.startDate, formData.duration]);

  // Calculate bruto36h when scale or trede changes
  useEffect(() => {
    if (formData.scale && formData.trede) {
      const bruto36h = getBruto36h(formData.scale, formData.trede);
      updateFormData("bruto36h", bruto36h);
    }
  }, [formData.scale, formData.trede]);

  // Calculate gross monthly when bruto36h or hoursPerWeek changes
  useEffect(() => {
    if (formData.bruto36h && formData.hoursPerWeek) {
      const grossMonthly = calculateGrossMonthly(formData.bruto36h, formData.hoursPerWeek);
      updateFormData("grossMonthly", grossMonthly);
    }
  }, [formData.bruto36h, formData.hoursPerWeek]);

  // Calculate reiskosten when km or hoursPerWeek changes
  useEffect(() => {
    if (formData.reiskostenKm && formData.hoursPerWeek) {
      const reiskostenPerMonth = calculateReiskosten(formData.reiskostenKm, formData.hoursPerWeek);
      updateFormData("reiskostenPerMonth", reiskostenPerMonth);
    }
  }, [formData.reiskostenKm, formData.hoursPerWeek]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      
      // Ensure all calculated fields are up to date
      const updatedFormData = {
        ...formData,
        bruto36h: getBruto36h(formData.scale, formData.trede),
        grossMonthly: calculateGrossMonthly(formData.bruto36h, formData.hoursPerWeek),
        reiskostenPerMonth: calculateReiskosten(formData.reiskostenKm, formData.hoursPerWeek)
      };
      
      // Create contract record in database
      const payload = {
        employee_name: `${formData.firstName} ${formData.lastName}`,
        manager: formData.manager,
        status: 'generated',
        contract_type: 'bepaalde_tijd',
        department: formData.position,
        signed_at: null,
        pdf_path: null,
        query_params: updatedFormData
      };
      
      // Create contract record
      const contract = await createContractRecord(supabase, payload);
      
      // Generate PDF
      const pdfBlob = await generateContractPdfBlob(updatedFormData);
      
      // Upload PDF to storage
      const pdfPath = await uploadContractPdf(supabase, contract.id, pdfBlob);
      
      // Update contract record with PDF path
      await updateContractRecord(supabase, contract.id, {
        pdf_path: pdfPath,
        status: 'generated'
      });
      
      toast({
        title: "Contract Generated Successfully!",
        description: "The contract has been created and saved to the system.",
      });
      
      // Navigate to view contract page
      navigate(`/contract/view/${contract.id}`);
      
    } catch (error) {
      console.error("Error generating contract:", error);
      toast({
        title: "Error Generating Contract",
        description: "There was a problem generating the contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  placeholder="Enter first name"
                  autoCapitalize="words"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder="Enter last name"
                  autoCapitalize="words"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bsn">BSN *</Label>
                <Input
                  id="bsn"
                  value={formData.bsn}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 9) {
                      updateFormData("bsn", value);
                    }
                  }}
                  placeholder="Enter BSN (8-9 digits)"
                  maxLength={9}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                placeholder="Employee's full address"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position/Functie *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => updateFormData("position", e.target.value)}
                  placeholder="e.g., Childcare Educator"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Reporting Manager *</Label>
                <Select value={formData.manager} onValueChange={(value) => updateFormData("manager", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mike-chen">Mike Chen</SelectItem>
                    <SelectItem value="lisa-wang">Lisa Wang</SelectItem>
                    <SelectItem value="david-kim">David Kim</SelectItem>
                    <SelectItem value="anna-brown">Anna Brown</SelectItem>
                    <SelectItem value="tom-lee">Tom Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scale">Scale *</Label>
                <Input
                  id="scale"
                  value={formData.scale}
                  onChange={(e) => updateFormData("scale", e.target.value)}
                  placeholder="e.g., 6"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trede">Trede *</Label>
                <Input
                  id="trede"
                  value={formData.trede}
                  onChange={(e) => updateFormData("trede", e.target.value)}
                  placeholder="e.g., 10"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cityOfEmployment">City of Employment</Label>
              <Input
                id="cityOfEmployment"
                value={formData.cityOfEmployment}
                onChange={(e) => updateFormData("cityOfEmployment", e.target.value)}
                placeholder="City of Employment"
                defaultValue="Leiden"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contract Duration *</Label>
              <div className="flex flex-wrap gap-2">
                {["6m", "7m", "12m", "18m", "24m"].map((duration) => (
                  <Button
                    key={duration}
                    type="button"
                    variant={formData.duration === duration ? "default" : "outline"}
                    onClick={() => updateFormData("duration", duration)}
                    className={formData.duration === duration ? "bg-gradient-primary" : ""}
                  >
                    {duration}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Working Hours/Week *</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                value={formData.hoursPerWeek.toString()}
                onChange={(e) => updateFormData("hoursPerWeek", Number(e.target.value))}
                placeholder="e.g., 36 hours"
                min="1"
                max="40"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bruto36h">Bruto Salary (36h/week)</Label>
                <Input
                  id="bruto36h"
                  value={`€ ${formData.bruto36h.toFixed(2)}`}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grossMonthly">Gross Monthly Salary</Label>
                <Input
                  id="grossMonthly"
                  value={`€ ${formData.grossMonthly.toFixed(2)}`}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reiskostenKm">Travel Distance (km one-way)</Label>
                <Input
                  id="reiskostenKm"
                  type="number"
                  value={formData.reiskostenKm.toString()}
                  onChange={(e) => updateFormData("reiskostenKm", Number(e.target.value))}
                  placeholder="Distance in km"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reiskostenPerMonth">Travel Allowance (monthly)</Label>
                <Input
                  id="reiskostenPerMonth"
                  value={`€ ${formData.reiskostenPerMonth.toFixed(2)}`}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Any special conditions or notes"
                rows={4}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Contract Summary</h3>
              <p className="text-muted-foreground">
                Please review all details before generating the contract
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Birth Date:</span>
                    <span className="font-medium">{formData.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BSN:</span>
                    <span className="font-medium">••••{formData.bsn.slice(-4)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{formData.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scale/Trede:</span>
                    <span className="font-medium">{formData.scale}/{formData.trede}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{formData.cityOfEmployment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manager:</span>
                    <span className="font-medium capitalize">{formData.manager.replace("-", " ")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Schedule & Duration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{formData.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">{formData.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{formData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours/Week:</span>
                    <span className="font-medium">{formData.hoursPerWeek}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Compensation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bruto (36h):</span>
                    <span className="font-medium">€ {formData.bruto36h.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Gross:</span>
                    <span className="font-medium">€ {formData.grossMonthly.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Travel Distance:</span>
                    <span className="font-medium">{formData.reiskostenKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Travel Allowance:</span>
                    <span className="font-medium">€ {formData.reiskostenPerMonth.toFixed(2)}/month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ready to Generate Contract</p>
                    <p className="text-sm text-muted-foreground">
                      The contract will be generated as a PDF and saved to the system
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Generate New Contract</h1>
        <p className="text-muted-foreground mt-1">
          Create a new employment contract with our step-by-step wizard
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-border">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 bg-background border-2",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-glow"
                      : isCompleted
                      ? "border-success bg-success text-success-foreground"
                      : "border-border bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <Button onClick={nextStep} className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleGenerate} 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Contract
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
