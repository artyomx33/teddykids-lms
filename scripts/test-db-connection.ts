import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Error: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables are required'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test database connection and check if staff table exists
 */
async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test basic connection with a simple query
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_prisma_migrations')
      .select('count()', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('Connection test failed:', connectionError);
      return false;
    }
    
    console.log('✅ Connection successful!');
    
    // Check if staff table exists and has data
    const { data: staffCount, error: staffError } = await supabase
      .from('staff')
      .select('count()', { count: 'exact', head: true });
    
    if (staffError) {
      console.error('Error checking staff table:', staffError);
      console.log('❌ Staff table may not exist or you may not have permission to access it');
      return false;
    }
    
    const count = staffCount?.[0]?.count || 0;
    console.log(`✅ Staff table exists with ${count} records`);
    
    // Check if manager and location_key columns exist
    try {
      const { error: columnCheckError } = await supabase
        .from('staff')
        .select('manager, location_key')
        .limit(1);
      
      if (columnCheckError) {
        console.log('❌ Manager and location_key columns do not exist yet');
        console.log('You need to run the migration: supabase/migrations/20250907_staff_manager_location.sql');
      } else {
        console.log('✅ Manager and location_key columns exist');
      }
    } catch (error) {
      console.log('❌ Error checking for manager and location_key columns:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error during connection test:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const success = await testConnection();
    
    if (success) {
      console.log('✅ All connection tests passed');
      process.exit(0);
    } else {
      console.error('❌ Connection test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
}

// Run the script
main();
