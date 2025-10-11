/**
 * Dutch Tax Calculator
 * 
 * Simple estimation of net salary based on Dutch tax brackets (2024)
 * Note: This is a simplified calculation for display purposes
 */

interface TaxCalculationResult {
  grossMonthly: number;
  netMonthly: number;
  taxAmount: number;
  taxPercentage: number;
}

/**
 * Calculate estimated net salary from gross monthly salary
 * Uses simplified 2024 Dutch tax rates
 */
export function calculateNetSalary(grossMonthly: number): TaxCalculationResult {
  const grossYearly = grossMonthly * 12;
  
  // 2024 Dutch tax brackets (simplified)
  let taxableIncome = grossYearly;
  let totalTax = 0;
  
  // Bracket 1: €0 - €75,518 = 36.97%
  // Bracket 2: €75,518+ = 49.50%
  
  if (taxableIncome <= 75518) {
    totalTax = taxableIncome * 0.3697;
  } else {
    totalTax = (75518 * 0.3697) + ((taxableIncome - 75518) * 0.4950);
  }
  
  // Apply general tax credit (approximately €3,362 in 2024)
  const taxCredit = 3362;
  totalTax = Math.max(0, totalTax - taxCredit);
  
  // Social contributions (simplified - about 27.65% of gross)
  const socialContributions = grossYearly * 0.2765;
  
  // Total deductions
  const totalDeductions = totalTax + socialContributions;
  
  // Net yearly
  const netYearly = grossYearly - totalDeductions;
  const netMonthly = netYearly / 12;
  
  return {
    grossMonthly,
    netMonthly: Math.round(netMonthly),
    taxAmount: Math.round(totalDeductions / 12),
    taxPercentage: Math.round((totalDeductions / grossYearly) * 100),
  };
}

/**
 * Quick estimate - rule of thumb: ~70% of gross for most salaries
 */
export function quickEstimateNet(grossMonthly: number): number {
  return Math.round(grossMonthly * 0.70);
}
