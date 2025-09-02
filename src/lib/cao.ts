type CaoSalaryTable = {
  [scale: string]: {
    [trede: string]: number;
  };
};

import { salaryTable } from "./salaryTable";

/* -------------------------------------------------------------------------- */
/* Fallback static table (legacy).                                            */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* Date-aware CAO lookup                                                      */
/* -------------------------------------------------------------------------- */

function getSalaryByDate(scale: string, dateStr: string, trede: number): number {
  if (!scale || !dateStr || !trede) return 0;

  const mappedScaleKey = scale === "6" ? "schaal6" : "";
  if (!mappedScaleKey) return 0;

  const scaleObj = (salaryTable as any)[mappedScaleKey] as Record<
    string,
    Record<number, number>
  >;
  if (!scaleObj) return 0;

  const applicableKey = Object.keys(scaleObj)
    .filter((d) => d <= dateStr)
    .sort((a, b) => (a > b ? -1 : 1))[0];

  if (!applicableKey) return 0;

  const value = scaleObj[applicableKey][trede];
  return typeof value === "number" ? value : 0;
}

export function getBruto36hByDate(
  scale: string,
  tredeStr: string,
  startDate: string
): number {
  const trede = parseInt(tredeStr, 10);
  if (Number.isNaN(trede)) return 0;
  return getSalaryByDate(scale, startDate, trede);
}

export function getBruto36h(scale: string, trede: string): number {
  const today = new Date().toISOString().split("T")[0];
  const byDate = getBruto36hByDate(scale, trede, today);
  if (byDate) return byDate;

  /* legacy fallback */
  const scaleTable = caoSalaryTable[scale];
  if (!scaleTable) return 0;
  const salary = scaleTable[trede];
  return salary ?? 0;
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
