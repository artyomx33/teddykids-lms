import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, User, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FormData {
  // Employee Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  
  // Contract Details
  contractType: string;
  department: string;
  position: string;
  startDate: string;
  duration: string;
  salary: string;
  workingHours: string;
  manager: string;
  
  // Additional Details
  additionalNotes: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  contractType: "",
  department: "",
  position: "",
  startDate: "",
  duration: "",
  salary: "",
  workingHours: "",
  manager: "",
  additionalNotes: "",
};

const steps = [
  {
    id: 1,
    title: "Employee Info",
    description: "Basic employee information",
    icon: User,
  },
  {
    id: 2,
    title: "Contract Details",
    description: "Contract terms and conditions",
    icon: FileText,
  },
  {
    id: 3,
    title: "Review & Generate",
    description: "Review and generate contract",
    icon: Eye,
  },
];

export default function GenerateContract() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleGenerate = () => {
    // Here you would typically send the data to your backend
    console.log("Generating contract with data:", formData);
    // Show success message or redirect
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="employee@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
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
                <Label htmlFor="contractType">Contract Type *</Label>
                <Select value={formData.contractType} onValueChange={(value) => updateFormData("contractType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => updateFormData("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infant-care">Infant Care</SelectItem>
                    <SelectItem value="toddler-care">Toddler Care</SelectItem>
                    <SelectItem value="preschool">Preschool</SelectItem>
                    <SelectItem value="after-school">After School Care</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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

            <div className="grid gap-4 md:grid-cols-3">
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
                <Label htmlFor="duration">Contract Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => updateFormData("duration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="1-year">1 Year</SelectItem>
                    <SelectItem value="2-years">2 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHours">Working Hours/Week</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => updateFormData("workingHours", e.target.value)}
                  placeholder="e.g., 40 hours"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary (Annual) *</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => updateFormData("salary", e.target.value)}
                placeholder="e.g., €35,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => updateFormData("additionalNotes", e.target.value)}
                placeholder="Any additional contract terms or notes"
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Contract Summary</h3>
              <p className="text-muted-foreground">
                Please review the contract details before generating
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Employee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{formData.phone || "—"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{formData.contractType.replace("-", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium capitalize">{formData.department.replace("-", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{formData.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{formData.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="font-medium">{formData.salary}</span>
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
                    <p className="font-medium text-foreground">Ready to Generate</p>
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
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : isCompleted
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={cn(
                        "text-sm font-medium",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-px mx-4 transition-colors duration-300",
                      isCompleted ? "bg-success" : "bg-border"
                    )} />
                  )}
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
            <Button onClick={handleGenerate} className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <FileText className="w-4 h-4 mr-2" />
              Generate Contract
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}