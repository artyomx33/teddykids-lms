import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { contractTemplate } from "@/lib/contractTemplate";
import { fillContractTemplate } from "@/lib/utils/replaceTemplatePlaceholders";

/**
 * Creates a new contract record in the database
 * @param supabase Supabase client instance
 * @param payload Contract data to insert
 * @returns The inserted contract record
 */
export async function createContractRecord(supabase, payload: any) {
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      employee_name: payload.employee_name,
      manager: payload.manager,
      status: payload.status || "draft",
      contract_type: payload.contract_type,
      department: payload.department,
      query_params: payload.query_params,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contract: ${error.message}`);
  }

  return data;
}

/**
 * Updates an existing contract record
 * @param supabase Supabase client instance
 * @param id Contract ID to update
 * @param patch Data to update
 * @returns The updated contract record
 */
export async function updateContractRecord(supabase, id: string, patch: any) {
  const { data, error } = await supabase
    .from("contracts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update contract: ${error.message}`);
  }

  return data;
}

/**
 * Lists all contracts ordered by creation date
 * @param supabase Supabase client instance
 * @returns Array of contract records
 */
export async function listContracts(supabase) {
  const { data, error } = await supabase
    .from("contracts")
    .select(
      "id, employee_name, manager, status, signed_at, contract_type, department, pdf_path"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list contracts: ${error.message}`);
  }

  return data || [];
}

/**
 * Gets a single contract by ID
 * @param supabase Supabase client instance
 * @param id Contract ID to retrieve
 * @returns The contract record
 */
export async function getContractById(supabase, id: string) {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to get contract: ${error.message}`);
  }

  return data;
}

/**
 * Uploads a PDF blob to the contracts storage bucket
 * @param supabase Supabase client instance
 * @param path Storage path for the PDF
 * @param blob PDF blob to upload
 * @returns Upload result
 */
export async function uploadContractPdf(supabase, path: string, blob: Blob) {
  const { data, error } = await supabase.storage
    .from("contracts")
    .upload(path, blob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }

  return data;
}

/**
 * Gets a signed URL for a PDF in the contracts bucket
 * @param supabase Supabase client instance
 * @param path Storage path of the PDF
 * @param expiresIn Expiration time in seconds (default: 600)
 * @returns Signed URL to access the PDF
 */
export async function getSignedPdfUrl(
  supabase,
  path: string,
  expiresIn: number = 600
) {
  const { data, error } = await supabase.storage
    .from("contracts")
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Generates a PDF from contract form data using HTML template
 * @param formData Contract form data with computed fields
 * @returns PDF as a Blob (Promise)
 */
export async function generateContractPdfBlob(formData: any): Promise<Blob> {
  // Format currency without € symbol (template already has it)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value).replace('€', '').trim();
  };

  // Prepare template data with the same keys as in ContractView
  const templateData = {
    'NAAM WERKNEMER': `${formData.firstName} ${formData.lastName}`,
    'GEBOORTEDATUM': formData.birthDate || '',
    'BSN': formData.bsn ? `••••${formData.bsn.slice(-4)}` : '',
    'ADRES': formData.address || '',
    'STARTDATUM': formData.startDate || '',
    'DUUR': formData.duration || '',
    'EINDDATUM': formData.endDate || '',
    'UREN PER WEEK': formData.hoursPerWeek || '',
    'POSITIE': formData.position || '',
    'LOCATIE': formData.cityOfEmployment || 'Leiden',
    'SCHAAL': formData.scale || '',
    'TREDE': formData.trede || '',
    'BRUTO36H': formatCurrency(formData.bruto36h || 0),
    'GROSSMONTHLY': formatCurrency(formData.grossMonthly || 0),
    'REISKOSTEN': formatCurrency(formData.reiskostenPerMonth || 0),
    'NOTITIES': formData.notes || '',
    'DATUM VAN ONDERTEKENING': new Date().toLocaleDateString('nl-NL')
  };

  // Fill the template with data
  const filledHtml = fillContractTemplate(contractTemplate, templateData);

  // Create a new PDF document with A4 size in points
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  // Create a temporary container for the HTML
  const container = document.createElement('div');
  container.innerHTML = filledHtml;
  container.style.width = '595pt'; // A4 width in points
  document.body.appendChild(container);

  try {
    // Render the HTML to the PDF
    await doc.html(container, {
      callback: function(doc) {},
      x: 40,
      y: 40,
      width: 515, // 595 - 2*40 = 515 (A4 width minus margins)
      windowWidth: 595,
      margin: [40, 40, 40, 40],
      autoPaging: 'text',
      html2canvas: {
        scale: 0.9,
        letterRendering: true,
      }
    });

    // Return the PDF as a blob
    return doc.output('blob');
  } finally {
    // Clean up the temporary container
    document.body.removeChild(container);
  }
}
