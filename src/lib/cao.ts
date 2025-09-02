type CaoSalaryTable = {
  [scale: string]: {
    [trede: string]: number;
  };
};

const caoSalaryTable: CaoSalaryTable = {
  "6": {
    "1": 2500,
    "2": 2600,
    "3": 2700,
    "4": 2800,
    "5": 2900,
    "6": 3000,
    "7": 3100,
    "8": 3200,
    "9": 3300,
    "10": 3400,
    "11": 3500,
    "12": 3600,
  },
};

export function getBruto36h(scale: string, trede: string): number {
  if (!scale || !trede) return 0;
  
  const scaleTable = caoSalaryTable[scale];
  if (!scaleTable) return 0;
  
  const salary = scaleTable[trede];
  return salary !== undefined ? salary : 0;
}

export function calculateGrossMonthly(bruto36h: number, hoursPerWeek: number): number {
  if (!bruto36h || !hoursPerWeek) return 0;
  const result = bruto36h * (hoursPerWeek / 36);
  return Number(result.toFixed(2));
}

export function calculateReiskosten(km: number, hoursPerWeek: number): number {
  if (!km || km <= 0 || !hoursPerWeek) return 0;
  
  const daysPerWeek = Math.min(5, Math.ceil(hoursPerWeek / 8));
  
  const yearly = km * 0.23 * 2 * daysPerWeek * 46.5;
  return Number((yearly / 12).toFixed(2));
}
