import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ 
      ok: false, 
      error: 'Method not allowed. Only POST requests are accepted.' 
    });
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    return response.status(500).json({ 
      ok: false, 
      error: 'Database connection string not configured' 
    });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    // Refresh the materialized view concurrently
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY public.contracts_enriched_mat;');
    
    return response.status(200).json({ 
      ok: true,
      message: 'Contracts cache refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error refreshing contracts cache:', error);
    
    return response.status(500).json({ 
      ok: false, 
      error: error.message || 'Unknown error occurred'
    });
  } finally {
    // Always close the client connection
    await client.end();
  }
}
