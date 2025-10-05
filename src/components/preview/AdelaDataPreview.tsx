/**
 * 🎯 Adéla Data Preview Component
 *
 * Shows the complete employment data that Lovable extracted for Adéla Jarošová
 * This demonstrates the power of the 2.0 system with real Employes.nl data
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  Briefcase,
  FileText,
  Star
} from "lucide-react";

export function AdelaDataPreview() {
  // Adéla's complete data from Lovable's extraction
  const adelaData = {
    personal: {
      fullName: "Adéla Jarošová",
      employeeNumber: 93,
      email: "adelkajarosova@seznam.cz",
      phone: "+420 605789413",
      dateOfBirth: "September 17, 1996",
      nationality: "Czech (CZ)",
      personalId: "452916677",
      iban: "NL39ABNA0121488381",
      address: {
        street: "Delflandplein 50",
        zipcode: "2624GD",
        city: "Delft",
        country: "Netherlands"
      }
    },
    employment: {
      status: "Active",
      employeeType: "Parttime",
      contractEndDate: "November 9, 2025",
      daysRemaining: 39,
      isExpiring: true
    },
    contracts: [
      {
        id: 1,
        period: "September 1 - November 19, 2024",
        status: "Inactive",
        hoursPerWeek: 30,
        daysPerWeek: 4,
        workingDays: "Monday, Tuesday, Wednesday, Thursday"
      },
      {
        id: 2,
        period: "November 20, 2024 - November 9, 2025",
        status: "Active",
        hoursPerWeek: 30,
        daysPerWeek: 5,
        workingDays: "Monday, Tuesday, Wednesday, Thursday, Friday",
        isSigned: true,
        signedDate: "November 20, 2024"
      }
    ],
    salaryHistory: [
      {
        period: "Sep-Oct 2024",
        hourlyWage: 16.28,
        monthlyWage: 2539,
        yearlyWage: 27421.09,
        status: "Start"
      },
      {
        period: "Dec 2024 - Jun 18, 2025",
        hourlyWage: 17.37,
        monthlyWage: 2709,
        yearlyWage: 29257.08,
        status: "First raise",
        increasePercent: 6.7
      },
      {
        period: "Jun 19-30, 2025",
        hourlyWage: 17.80,
        monthlyWage: 2777,
        yearlyWage: 29991.48,
        status: "Short adjustment",
        increasePercent: 2.5
      },
      {
        period: "Jul 1, 2025 - Current",
        hourlyWage: 18.24,
        monthlyWage: 2846,
        yearlyWage: 30736.68,
        status: "Current",
        increasePercent: 2.5
      }
    ]
  };

  const totalSalaryIncrease = ((adelaData.salaryHistory[3].hourlyWage - adelaData.salaryHistory[0].hourlyWage) / adelaData.salaryHistory[0].hourlyWage * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-purple-800 text-xl">
                🎯 Adéla Jarošová - Complete Employment Profile
              </CardTitle>
              <p className="text-purple-700 text-sm mt-1">
                Real data extracted by Lovable from Employes.nl API - showcasing TeddyKids LMS 2.0 capabilities
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Full Name:</span>
                <div className="font-medium">{adelaData.personal.fullName}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Employee #:</span>
                <div className="font-medium">{adelaData.personal.employeeNumber}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div className="font-medium text-xs">{adelaData.personal.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <div className="font-medium">{adelaData.personal.phone}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date of Birth:</span>
                <div className="font-medium">{adelaData.personal.dateOfBirth}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Nationality:</span>
                <div className="font-medium">{adelaData.personal.nationality}</div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </h4>
              <div className="text-sm text-muted-foreground">
                {adelaData.personal.address.street}<br/>
                {adelaData.personal.address.zipcode} {adelaData.personal.address.city}<br/>
                {adelaData.personal.address.country}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Banking Details
              </h4>
              <div className="text-sm text-muted-foreground font-mono">
                IBAN: {adelaData.personal.iban}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {adelaData.employment.status}
              </Badge>
              <Badge variant="secondary">
                {adelaData.employment.employeeType}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contract End Date:</span>
                <span className="font-medium">{adelaData.employment.contractEndDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Days Remaining:</span>
                <span className="font-medium text-orange-600">{adelaData.employment.daysRemaining} days</span>
              </div>
            </div>

            {adelaData.employment.isExpiring && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-800">
                  ⚠️ Contract expiring soon - renewal action needed
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adelaData.contracts.map((contract, index) => (
              <div key={contract.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Contract {contract.id}</h4>
                  <Badge variant={contract.status === 'Active' ? 'default' : 'secondary'}>
                    {contract.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Period:</span>
                    <div className="font-medium">{contract.period}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hours/Week:</span>
                    <div className="font-medium">{contract.hoursPerWeek}h</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Days/Week:</span>
                    <div className="font-medium">{contract.daysPerWeek} days</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Working Days:</span>
                    <div className="font-medium text-xs">{contract.workingDays}</div>
                  </div>
                </div>

                {contract.isSigned && (
                  <div className="mt-2 text-xs text-green-600">
                    ✅ Signed on {contract.signedDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Salary Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Salary Progression
            <Badge className="ml-2 bg-green-100 text-green-800">
              +{totalSalaryIncrease}% Growth
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adelaData.salaryHistory.map((salary, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{salary.period}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={salary.status === 'Current' ? 'default' : 'secondary'}>
                      {salary.status}
                    </Badge>
                    {salary.increasePercent && (
                      <Badge className="bg-green-100 text-green-800">
                        +{salary.increasePercent}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hourly:</span>
                    <div className="font-medium">€{salary.hourlyWage}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Monthly:</span>
                    <div className="font-medium">€{salary.monthlyWage.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yearly:</span>
                    <div className="font-medium">€{salary.yearlyWage.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <strong>💡 Complete Progression:</strong> From €16.28/hour to €18.24/hour ({totalSalaryIncrease}% increase)
              <br/>
              <strong>📈 Monthly Growth:</strong> €2,539 → €2,846 (+€307 per month)
              <br/>
              <strong>🎯 Working Schedule Evolution:</strong> 4 days/week → 5 days/week (same 30 hours)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-green-800">
              🚀 This is the Power of TeddyKids LMS 2.0!
            </h3>
            <p className="text-green-700">
              Complete, accurate employment data automatically extracted from Employes.nl -
              no more manual entry, no more "draft unknown" contracts!
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Badge className="bg-green-100 text-green-800">
                ✅ Real API Data
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                ✅ Complete History
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                ✅ Dutch Law Compliant
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}