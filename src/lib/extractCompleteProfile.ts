import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts complete employee profile from Employes.nl and generates comprehensive report
 */
export async function extractCompleteEmployeeProfile(email?: string, staffId?: string) {
  console.log('🚀 Starting complete profile extraction...');
  console.log('Parameters:', { email, staffId });

  try {
    // Call the edge function to do the extraction
    const { data, error } = await supabase.functions.invoke('employes-integration', {
      body: {
        action: 'extract_complete_profile',
        email,
        staff_id: staffId
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (data?.error) {
      console.error('Extraction error:', data.error);
      throw new Error(data.error);
    }

    console.log('✅ Extraction completed successfully');
    console.log('Data points extracted:', data?.data?.extraction_summary?.data_points_extracted);

    return data?.data;
  } catch (error: any) {
    console.error('❌ Complete profile extraction failed:', error);
    throw error;
  }
}

/**
 * Format extraction report as Markdown
 */
export function formatExtractionReportAsMarkdown(report: any): string {
  const timestamp = new Date(report.timestamp).toLocaleString();
  
  let md = `# 🎯 COMPLETE EMPLOYES.NL DATA EXTRACTION FOR ${report.employee.basic_info?.full_name || 'EMPLOYEE'}\n\n`;
  md += `**Extraction Date:** ${timestamp}\n`;
  md += `**Status:** ${report.extraction_summary.success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
  md += `**Data Points Extracted:** ${report.extraction_summary.data_points_extracted}\n\n`;
  md += `---\n\n`;

  // Executive Summary
  md += `## 🎬 EXECUTIVE SUMMARY\n\n`;
  md += `This report contains a comprehensive extraction of ALL available data for **${report.employee.basic_info?.full_name}** from the Employes.nl API.\n\n`;
  md += `**Key Findings:**\n`;
  md += `- ✅ Employee found in Employes.nl (ID: ${report.employee.employes_id})\n`;
  md += `- 📊 ${report.salary_progression.total_records} salary records extracted\n`;
  md += `- 📝 ${report.contract_timeline.total_contracts} contracts found\n`;
  md += `- 📅 ${report.employment_history.total_periods} employment periods identified\n`;
  md += `- 🔍 ${report.endpoints_tested.length} API endpoints tested\n`;
  md += `- 💾 ${report.extraction_summary.data_points_extracted} total data points captured\n\n`;
  
  if (report.extraction_summary.errors.length > 0) {
    md += `**⚠️ Errors:** ${report.extraction_summary.errors.length}\n`;
    report.extraction_summary.errors.forEach((err: string) => {
      md += `  - ${err}\n`;
    });
    md += `\n`;
  }
  
  md += `---\n\n`;

  // Employee Identity
  md += `## 👤 EMPLOYEE IDENTITY\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Full Name** | ${report.employee.basic_info?.full_name || 'N/A'} |\n`;
  md += `| **First Name** | ${report.employee.basic_info?.first_name || 'N/A'} |\n`;
  md += `| **Surname** | ${report.employee.basic_info?.surname || 'N/A'} |\n`;
  md += `| **Initials** | ${report.employee.basic_info?.initials || 'N/A'} |\n`;
  md += `| **Employee Number** | ${report.employee.basic_info?.employee_number || 'N/A'} |\n`;
  md += `| **Employes ID** | ${report.employee.employes_id || 'N/A'} |\n`;
  md += `| **LMS Staff ID** | ${report.employee.lms_staff_id || 'N/A'} |\n`;
  md += `| **Status** | ${report.employee.basic_info?.status || 'N/A'} |\n\n`;

  // Personal Details
  md += `## 📋 PERSONAL DETAILS\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Date of Birth** | ${report.employee.personal_details?.date_of_birth || 'N/A'} |\n`;
  md += `| **Nationality** | ${report.employee.personal_details?.nationality_id || 'N/A'} |\n`;
  md += `| **Gender** | ${report.employee.personal_details?.gender || 'N/A'} |\n`;
  md += `| **ID Number** | ${report.employee.personal_details?.personal_identification_number || 'N/A'} |\n\n`;

  // Contact Information
  md += `## 📞 CONTACT INFORMATION\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Email** | ${report.employee.contact?.email || 'N/A'} |\n`;
  md += `| **Phone** | ${report.employee.contact?.phone || 'N/A'} |\n`;
  md += `| **Mobile** | ${report.employee.contact?.mobile || 'N/A'} |\n\n`;

  // Address Information
  md += `## 🏠 ADDRESS INFORMATION\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Street** | ${report.employee.address?.street || 'N/A'} |\n`;
  md += `| **House Number** | ${report.employee.address?.housenumber || 'N/A'} |\n`;
  md += `| **Zipcode** | ${report.employee.address?.zipcode || 'N/A'} |\n`;
  md += `| **City** | ${report.employee.address?.city || 'N/A'} |\n`;
  md += `| **Country** | ${report.employee.address?.country_code || 'N/A'} |\n\n`;

  // Employment Status
  md += `## 💼 EMPLOYMENT STATUS\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Status** | ${report.employee.employment_status?.status || 'N/A'} |\n`;
  md += `| **Department** | ${report.employee.employment_status?.department || 'N/A'} |\n`;
  md += `| **Department ID** | ${report.employee.employment_status?.department_id || 'N/A'} |\n`;
  md += `| **Location** | ${report.employee.employment_status?.location || 'N/A'} |\n`;
  md += `| **Location ID** | ${report.employee.employment_status?.location_id || 'N/A'} |\n`;
  md += `| **Position** | ${report.employee.employment_status?.position || 'N/A'} |\n`;
  md += `| **Role** | ${report.employee.employment_status?.role || 'N/A'} |\n`;
  md += `| **Job Title** | ${report.employee.employment_status?.job_title || 'N/A'} |\n\n`;

  // Salary Progression
  md += `## 💰 SALARY PROGRESSION\n\n`;
  md += `**Total Salary Records:** ${report.salary_progression.total_records}\n`;
  md += `**Data Source:** ${report.salary_progression.source}\n\n`;
  
  if (report.salary_progression.records.length > 0) {
    md += `### Salary Timeline\n\n`;
    md += `| Start Date | End Date | Monthly | Hourly | Yearly | Hours/Week | Scale | Trede |\n`;
    md += `|------------|----------|---------|--------|--------|------------|-------|-------|\n`;
    
    report.salary_progression.records.forEach((sal: any) => {
      md += `| ${sal.start_date || 'N/A'} | ${sal.end_date || 'current'} | €${sal.month_wage || 'N/A'} | €${sal.hour_wage || 'N/A'} | €${sal.yearly_wage || 'N/A'} | ${sal.hours_per_week || 'N/A'} | ${sal.scale || 'N/A'} | ${sal.trede || 'N/A'} |\n`;
    });
    md += `\n`;
  } else {
    md += `*No salary history records found in nested employment data*\n\n`;
  }

  // Contract Timeline
  md += `## 📝 CONTRACT TIMELINE\n\n`;
  md += `**Total Contracts:** ${report.contract_timeline.total_contracts}\n`;
  md += `**Data Source:** ${report.contract_timeline.source}\n\n`;
  
  if (report.contract_timeline.contracts.length > 0) {
    md += `### Contract History\n\n`;
    md += `| Period | Type | Hours/Week | FTE | Indefinite |\n`;
    md += `|--------|------|------------|-----|------------|\n`;
    
    report.contract_timeline.contracts.forEach((contract: any) => {
      md += `| ${contract.period || 'N/A'} | ${contract.type || 'N/A'} | ${contract.hours_per_week || 'N/A'} | ${contract.fte || 'N/A'} | ${contract.indefinite ? 'Yes' : 'No'} |\n`;
    });
    md += `\n`;
  } else {
    md += `*No contract records found in nested employment data*\n\n`;
  }

  // Employment History
  md += `## 📅 EMPLOYMENT HISTORY TIMELINE\n\n`;
  md += `**Total Periods:** ${report.employment_history.total_periods}\n\n`;
  
  if (report.employment_history.periods.length > 0) {
    report.employment_history.periods.forEach((period: any, index: number) => {
      md += `### Period ${index + 1}\n\n`;
      md += `**Employment ID:** ${period.employment_id || 'N/A'}\n`;
      md += `**Duration:** ${period.start_date || 'N/A'} to ${period.end_date || 'current'}\n\n`;
      
      md += `**Contract Details:**\n`;
      md += `\`\`\`json\n${JSON.stringify(period.contract, null, 2)}\n\`\`\`\n\n`;
      
      md += `**Salary Details:**\n`;
      md += `\`\`\`json\n${JSON.stringify(period.salary, null, 2)}\n\`\`\`\n\n`;
      
      if (Object.keys(period.hours).length > 0) {
        md += `**Working Hours:**\n`;
        md += `\`\`\`json\n${JSON.stringify(period.hours, null, 2)}\n\`\`\`\n\n`;
      }
      
      if (Object.keys(period.tax).length > 0) {
        md += `**Tax Information:**\n`;
        md += `\`\`\`json\n${JSON.stringify(period.tax, null, 2)}\n\`\`\`\n\n`;
      }
    });
  } else {
    md += `*No employment periods found*\n\n`;
  }

  // API Endpoints Tested
  md += `## 📡 API ENDPOINTS TESTED\n\n`;
  md += `Total endpoints tested: ${report.endpoints_tested.length}\n\n`;
  md += `| Endpoint | Method | Status | Success | Has Data | Notes |\n`;
  md += `|----------|--------|--------|---------|----------|-------|\n`;
  
  report.endpoints_tested.forEach((endpoint: any) => {
    const successEmoji = endpoint.success ? '✅' : '❌';
    const dataEmoji = endpoint.has_data ? '📦' : '📭';
    md += `| ${endpoint.endpoint} | ${endpoint.method} | ${endpoint.status || 'N/A'} | ${successEmoji} | ${dataEmoji} | ${endpoint.error || '-'} |\n`;
  });
  md += `\n`;

  // Data Availability Matrix
  md += `## 📊 DATA AVAILABILITY MATRIX\n\n`;
  md += `This matrix shows which data points are available from Employes.nl:\n\n`;
  
  const matrix = report.data_availability_matrix;
  
  md += `### Personal Information\n`;
  md += formatAvailabilitySection(matrix.personal_information);
  
  md += `### Employment Data\n`;
  md += formatAvailabilitySection(matrix.employment_data);
  
  md += `### Salary Data\n`;
  md += formatAvailabilitySection(matrix.salary_data);
  
  md += `### Contract Data\n`;
  md += formatAvailabilitySection(matrix.contract_data);
  
  md += `### Payroll Data\n`;
  md += formatAvailabilitySection(matrix.payroll_data);
  
  md += `\n`;

  // Recommendations
  md += `## 💡 IMPLEMENTATION RECOMMENDATIONS\n\n`;
  md += `Based on this extraction, here are the recommended next steps:\n\n`;
  
  md += `### 1. Salary History Integration ✅\n`;
  md += `- **Source:** Nested employment data contains complete salary progression\n`;
  md += `- **Implementation:** Extract from \`employee.employments[].salary\` arrays\n`;
  md += `- **Storage:** \`cao_salary_history\` table\n`;
  md += `- **Status:** ${report.salary_progression.total_records > 0 ? 'DATA AVAILABLE' : 'NO DATA FOUND'}\n\n`;
  
  md += `### 2. Contract Timeline Integration ✅\n`;
  md += `- **Source:** Nested employment data contains contract periods\n`;
  md += `- **Implementation:** Extract from \`employee.employments[].contract\` objects\n`;
  md += `- **Storage:** \`contracts_enriched\` table\n`;
  md += `- **Status:** ${report.contract_timeline.total_contracts > 0 ? 'DATA AVAILABLE' : 'NO DATA FOUND'}\n\n`;
  
  md += `### 3. Employment Events Timeline ✅\n`;
  md += `- **Source:** Employment period start/end dates show complete timeline\n`;
  md += `- **Implementation:** Track hire, promotions, contract changes\n`;
  md += `- **Storage:** \`staff_employment_history\` table\n`;
  md += `- **Status:** ${report.employment_history.total_periods > 0 ? 'DATA AVAILABLE' : 'NO DATA FOUND'}\n\n`;
  
  md += `### 4. Working Schedule & Hours\n`;
  md += `- **Source:** Contract hours_per_week and FTE data\n`;
  md += `- **Implementation:** Track schedule changes over time\n`;
  md += `- **Status:** ${matrix.contract_data?.working_hours ? 'DATA AVAILABLE' : 'LIMITED DATA'}\n\n`;
  
  md += `### 5. Payroll Integration\n`;
  md += `- **Source:** Payrun endpoints (if accessible)\n`;
  md += `- **Implementation:** Extract wage components and deductions\n`;
  md += `- **Status:** ${report.payroll_data?.available ? 'ENDPOINT ACCESSIBLE' : 'NEEDS INVESTIGATION'}\n\n`;

  // Extraction Summary
  md += `## 📈 EXTRACTION SUMMARY\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| **Success** | ${report.extraction_summary.success ? '✅ Yes' : '❌ No'} |\n`;
  md += `| **Data Points Extracted** | ${report.extraction_summary.data_points_extracted} |\n`;
  md += `| **Errors** | ${report.extraction_summary.errors.length} |\n`;
  md += `| **Warnings** | ${report.extraction_summary.warnings.length} |\n`;
  md += `| **Endpoints Tested** | ${report.endpoints_tested.length} |\n`;
  md += `| **Successful Endpoints** | ${report.endpoints_tested.filter((e: any) => e.success).length} |\n`;
  md += `| **Salary Records Found** | ${report.salary_progression.total_records} |\n`;
  md += `| **Contracts Found** | ${report.contract_timeline.total_contracts} |\n`;
  md += `| **Employment Periods** | ${report.employment_history.total_periods} |\n\n`;

  // Footer
  md += `---\n\n`;
  md += `**Generated by:** TeddyKids LMS - Employes.nl Integration\n`;
  md += `**Extraction Function:** \`extract_complete_profile\`\n`;
  md += `**Employee:** ${report.employee.basic_info?.full_name}\n`;
  md += `**Email:** ${report.employee.contact?.email || 'N/A'}\n`;
  md += `**LMS Staff ID:** ${report.employee.lms_staff_id || 'N/A'}\n`;
  md += `**Employes ID:** ${report.employee.employes_id || 'N/A'}\n`;
  md += `**Timestamp:** ${timestamp}\n`;

  return md;
}

function formatAvailabilitySection(section: any): string {
  let md = '';
  for (const [key, value] of Object.entries(section)) {
    const icon = value ? '✅' : '❌';
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    md += `- ${icon} **${label}:** ${typeof value === 'boolean' ? (value ? 'Available' : 'Not Available') : value}\n`;
  }
  md += `\n`;
  return md;
}

/**
 * Download extraction report as MD file
 */
export function downloadExtractionReport(report: any, filename: string = 'adela_complete_extraction.md') {
  const markdown = formatExtractionReportAsMarkdown(report);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
