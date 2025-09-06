import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Run a SQL migration file against Supabase
 * @param filePath Path to the SQL migration file
 */
async function runMigration(filePath: string): Promise<void> {
  console.log(`Running migration: ${filePath}`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Migration file not found at ${filePath}`);
    process.exit(1);
  }
  
  // Read SQL file
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split SQL into statements (simple split by semicolon)
  // This is a basic approach and might need refinement for complex SQL
  const statements = sql
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);
  
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  try {
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      const { error } = await supabase.rpc('pgmigrate', { query: statement });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        process.exit(1);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Unhandled error during migration:', error);
    process.exit(1);
  }
}

/**
 * Alternative approach using a single query with all statements
 * This is useful if the pgmigrate function doesn't exist or if you prefer to run everything in one go
 */
async function runMigrationSingleQuery(filePath: string): Promise<void> {
  console.log(`Running migration as single query: ${filePath}`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Migration file not found at ${filePath}`);
    process.exit(1);
  }
  
  // Read SQL file
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Execute the entire SQL file as a single query
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If the exec_sql function doesn't exist, try direct query
      console.log('exec_sql RPC not available, trying direct query...');
      
      const { error: directError } = await supabase.from('_direct_query').select('*').eq('query', sql).single();
      
      if (directError) {
        console.error('Error executing migration:', directError);
        console.log('Note: This approach requires appropriate database permissions and functions.');
        console.log('You may need to run this migration manually or through Supabase CLI.');
        process.exit(1);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Unhandled error during migration:', error);
    process.exit(1);
  }
}

/**
 * Main function to handle command line arguments and run the migration
 */
async function main() {
  // Get migration file path from command line arguments
  const migrationFilePath = process.argv[2];
  
  if (!migrationFilePath) {
    console.error('Error: Migration file path is required');
    console.log('Usage: npm run migration <migration-file-path>');
    console.log('Example: npm run migration supabase/migrations/20250907_staff_manager_location.sql');
    process.exit(1);
  }
  
  // Resolve path (handle relative paths)
  const resolvedPath = path.resolve(process.cwd(), migrationFilePath);
  
  try {
    // Try the statement-by-statement approach first
    try {
      await runMigration(resolvedPath);
    } catch (error) {
      console.log('Statement-by-statement migration failed, trying single query approach...');
      await runMigrationSingleQuery(resolvedPath);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('You may need to run this migration manually or through Supabase CLI.');
    process.exit(1);
  }
}

// Run the script
main();
