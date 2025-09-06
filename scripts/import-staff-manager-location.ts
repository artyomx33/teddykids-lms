import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types
interface StaffCSVRow {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  bsn: string;
  gender: string;
  nationality: string;
  street: string;
  house_number: string;
  house_addition: string;
  postal_code: string;
  city: string;
  country: string;
  iban: string;
  position: string;
  department: string;
  employment_status: string;
  start_date: string;
  end_date: string;
  termination_date: string;
  hours_per_week: string;
  days_per_week: string;
  salary_fulltime: string;
  salary_hourly: string;
  contract_signed: string;
  employee_number: string;
  manager: string;
  location: string;
  is_intern: string;
  intern_year: string;
  has_id_card: string;
  has_bank_card: string;
  has_pok: string;
  has_vog: string;
  has_prk: string;
  has_employees: string;
  has_portobase: string;
  patch_staff_docs: string;
  matching_strategy: string;
  location_key: string;
}

interface StaffUpdateData {
  manager: string | null;
  location_key: string | null;
}

// Function to derive location_key from address data
function deriveLocationKey(row: StaffCSVRow): string | null {
  // If postal_code and city are available, create a standardized location key
  if (row.postal_code && row.city) {
    // Normalize postal code (remove spaces, uppercase)
    const normalizedPostalCode = row.postal_code.replace(/\s+/g, '').toUpperCase();
    
    // Normalize city (lowercase, remove special characters)
    const normalizedCity = row.city.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Create location key in format: [postal_code]_[city]
    return `${normalizedPostalCode}_${normalizedCity}`;
  }
  
  // If location field is provided, use it as a fallback
  if (row.location) {
    // Normalize location (lowercase, replace spaces with underscores)
    return row.location.toLowerCase().replace(/\s+/g, '_');
  }
  
  return null;
}

// Main function to process CSV and update staff records
async function importStaffManagerLocation(csvFilePath: string): Promise<void> {
  console.log('Starting staff manager and location import...');
  
  // Check if file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`Error: File not found at ${csvFilePath}`);
    process.exit(1);
  }
  
  const results: StaffCSVRow[] = [];
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    );
  
  // Parse CSV file
  for await (const row of parser) {
    results.push(row as StaffCSVRow);
  }
  
  console.log(`Parsed ${results.length} rows from CSV`);
  
  // Process each row and update database
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const row of results) {
    try {
      // Extract matching strategy (default to email if not specified)
      const matchingStrategy = row.matching_strategy || `Match by email: ${row.email}`;
      
      // Parse matching strategy to get field and value
      let matchField = 'email';
      let matchValue = row.email;
      
      if (matchingStrategy.includes(':')) {
        const [strategyType, strategyValue] = matchingStrategy.split(':', 2);
        if (strategyType.includes('email')) {
          matchField = 'email';
          matchValue = strategyValue.trim();
        } else if (strategyType.includes('employee_number')) {
          matchField = 'employee_number';
          matchValue = strategyValue.trim();
        } else if (strategyType.includes('bsn')) {
          matchField = 'bsn';
          matchValue = strategyValue.trim();
        }
      }
      
      if (!matchValue) {
        console.warn(`Skipping row with empty match value: ${JSON.stringify(row)}`);
        skipCount++;
        continue;
      }
      
      // Prepare update data
      const updateData: StaffUpdateData = {
        manager: row.manager || null,
        location_key: null
      };
      
      // Only derive location_key if it's not already provided in the CSV
      if (row.location_key) {
        updateData.location_key = row.location_key;
      } else {
        updateData.location_key = deriveLocationKey(row);
      }
      
      // Find the staff record
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, location_key')
        .eq(matchField, matchValue)
        .maybeSingle();
      
      if (staffError) {
        console.error(`Error finding staff with ${matchField}=${matchValue}:`, staffError);
        errorCount++;
        continue;
      }
      
      if (!staffData) {
        console.warn(`No staff found with ${matchField}=${matchValue}`);
        skipCount++;
        continue;
      }
      
      // Preserve existing non-null location_key values
      if (staffData.location_key) {
        console.log(`Preserving existing location_key for ${matchValue}: ${staffData.location_key}`);
        updateData.location_key = staffData.location_key;
      }
      
      // Update the staff record
      const { error: updateError } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', staffData.id);
      
      if (updateError) {
        console.error(`Error updating staff ${matchValue}:`, updateError);
        errorCount++;
        continue;
      }
      
      console.log(`Updated staff ${matchValue} with manager=${updateData.manager}, location_key=${updateData.location_key}`);
      successCount++;
    } catch (error) {
      console.error(`Error processing row:`, error);
      errorCount++;
    }
  }
  
  console.log('Import completed:');
  console.log(`- Successfully updated: ${successCount}`);
  console.log(`- Skipped: ${skipCount}`);
  console.log(`- Errors: ${errorCount}`);
}

// CLI interface
async function main() {
  // Get CSV file path from command line arguments
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('Error: CSV file path is required');
    console.log('Usage: npm run import-staff-manager-location <csv-file-path>');
    process.exit(1);
  }
  
  try {
    await importStaffManagerLocation(csvFilePath);
    process.exit(0);
  } catch (error) {
    console.error('Unhandled error during import:', error);
    process.exit(1);
  }
}

// Run the script
main();
