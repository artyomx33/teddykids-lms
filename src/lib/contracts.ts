import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

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
 * Generates a PDF from contract form data
 * @param formData Contract form data
 * @returns PDF as a Blob
 */
export function generateContractPdfBlob(formData: any): Blob {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(20);
  doc.text("Teddy Kids Employment Contract", 105, 20, { align: "center" });
  
  // Add logo placeholder
  doc.setFontSize(10);
  doc.text("[Teddy Kids Logo]", 105, 30, { align: "center" });
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // Employee information section
  doc.setFontSize(16);
  doc.text("Employee Information", 20, 45);
  
  doc.setFontSize(12);
  doc.text(`Name: ${formData.firstName} ${formData.lastName}`, 20, 55);
  doc.text(`Email: ${formData.email}`, 20, 65);
  doc.text(`Phone: ${formData.phone || "N/A"}`, 20, 75);
  doc.text(`Address: ${formData.address || "N/A"}`, 20, 85);
  
  // Contract details section
  doc.setFontSize(16);
  doc.text("Contract Details", 20, 105);
  
  doc.setFontSize(12);
  doc.text(`Position: ${formData.position}`, 20, 115);
  doc.text(`Department: ${formData.department.replace("-", " ")}`, 20, 125);
  doc.text(`Contract Type: ${formData.contractType.replace("-", " ")}`, 20, 135);
  doc.text(`Start Date: ${formData.startDate}`, 20, 145);
  doc.text(`Duration: ${formData.duration || "Indefinite"}`, 20, 155);
  doc.text(`Working Hours: ${formData.workingHours || "N/A"} per week`, 20, 165);
  doc.text(`Annual Salary: ${formData.salary}`, 20, 175);
  doc.text(`Reporting Manager: ${formData.manager.replace("-", " ")}`, 20, 185);
  
  // Signature section
  doc.setFontSize(16);
  doc.text("Signatures", 20, 205);
  
  doc.setFontSize(12);
  doc.text("Employee Signature: _________________________", 20, 215);
  doc.text("Date: ______________", 20, 225);
  
  doc.text("Employer Signature: _________________________", 20, 235);
  doc.text("Date: ______________", 20, 245);
  
  // Footer
  doc.setFontSize(10);
  doc.text("Teddy Kids LMS - Confidential", 105, 280, { align: "center" });
  
  // Convert the PDF to a blob
  return doc.output("blob");
}
