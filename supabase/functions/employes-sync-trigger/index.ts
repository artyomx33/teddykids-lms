/**
 * 🎯 EMPLOYES SYNC ORCHESTRATOR
 * Master function that coordinates all sync operations
 * Can be triggered manually (frontend) or automatically (scheduler)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for frontend access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎯 Sync Orchestrator: Starting sync operation...')
    
    // Parse request body
    const body = await req.json().catch(() => ({}))
    const source = body.source || 'manual'
    const triggeredBy = body.triggered_by || 'unknown'
    
    console.log(`📍 Sync triggered by: ${source} (${triggeredBy})`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create sync session
    console.log('📝 Creating sync session...')
    const { data: session, error: sessionError } = await supabase
      .from('employes_sync_sessions')
      .insert({
        session_type: 'full_sync',
        status: 'running',
        started_at: new Date().toISOString(),
        source: source,
        triggered_by: triggeredBy,
        source_function: 'employes-sync-trigger'
      })
      .select()
      .single()

    if (sessionError) {
      console.error('❌ Failed to create sync session:', sessionError)
      throw new Error(`Failed to create sync session: ${sessionError.message}`)
    }

    console.log(`✅ Sync session created: ${session.id}`)

    const results = {
      session_id: session.id,
      snapshot: null as any,
      history: null as any,
      changes: null as any,
      errors: [] as string[]
    }

    // Step 1: Snapshot Collector (using slug: employes-snapshot-collector)
    console.log('📸 Step 1/3: Calling snapshot collector...')
    try {
      const snapshotResponse = await supabase.functions.invoke('employes-snapshot-collector', {
        body: { 
          mode: 'full',
          session_id: session.id 
        }
      })

      if (snapshotResponse.error) {
        throw new Error(`Snapshot collector error: ${snapshotResponse.error.message}`)
      }

      results.snapshot = snapshotResponse.data
      console.log(`✅ Snapshot collected: ${results.snapshot?.employees_processed || 0} employees`)
    } catch (error) {
      const errorMsg = `Snapshot collection failed: ${error.message}`
      console.error(`❌ ${errorMsg}`)
      results.errors.push(errorMsg)
    }

    // Step 2: History Collector (using slug: employes-history-collector)
    console.log('📚 Step 2/3: Calling history collector...')
    try {
      const historyResponse = await supabase.functions.invoke('employes-history-collector', {
        body: { 
          mode: 'full',
          session_id: session.id 
        }
      })

      if (historyResponse.error) {
        throw new Error(`History collector error: ${historyResponse.error.message}`)
      }

      results.history = historyResponse.data
      console.log(`✅ History collected: ${results.history?.employees_processed || 0} employees`)
    } catch (error) {
      const errorMsg = `History collection failed: ${error.message}`
      console.error(`❌ ${errorMsg}`)
      results.errors.push(errorMsg)
    }

    // Step 3: Change Detector (using slug: employes-change-detector)
    console.log('🔍 Step 3/3: Calling change detector...')
    try {
      const changesResponse = await supabase.functions.invoke('employes-change-detector', {
        body: { 
          mode: 'full',
          session_id: session.id 
        }
      })

      if (changesResponse.error) {
        throw new Error(`Change detector error: ${changesResponse.error.message}`)
      }

      results.changes = changesResponse.data
      console.log(`✅ Changes detected: ${results.changes?.changes_detected || 0} changes`)
    } catch (error) {
      const errorMsg = `Change detection failed: ${error.message}`
      console.error(`❌ ${errorMsg}`)
      results.errors.push(errorMsg)
    }

    // Update sync session
    const finalStatus = results.errors.length > 0 ? 'completed_with_errors' : 'completed'
    console.log(`📝 Updating sync session status: ${finalStatus}`)
    
    await supabase
      .from('employes_sync_sessions')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        total_records: results.snapshot?.employees_processed || 0,
        successful_records: (results.snapshot?.employees_processed || 0) - results.errors.length,
        failed_records: results.errors.length,
        sync_details: {
          employees_processed: results.snapshot?.employees_processed || 0,
          history_collected: results.history?.employees_processed || 0,
          changes_detected: results.changes?.changes_detected || 0,
          errors: results.errors
        }
      })
      .eq('id', session.id)

    // Log summary
    console.log('🎉 Sync orchestrator completed!')
    console.log(`   - Employees processed: ${results.snapshot?.employees_processed || 0}`)
    console.log(`   - History collected: ${results.history?.employees_processed || 0}`)
    console.log(`   - Changes detected: ${results.changes?.changes_detected || 0}`)
    console.log(`   - Errors: ${results.errors.length}`)

    // Return response
    return new Response(
      JSON.stringify({
        success: results.errors.length === 0,
        session_id: session.id,
        summary: {
          employees_processed: results.snapshot?.employees_processed || 0,
          history_collected: results.history?.employees_processed || 0,
          changes_detected: results.changes?.changes_detected || 0,
          errors: results.errors
        },
        message: results.errors.length === 0 
          ? 'Sync completed successfully' 
          : `Sync completed with ${results.errors.length} error(s)`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: results.errors.length === 0 ? 200 : 207 // 207 = Multi-Status (partial success)
      }
    )

  } catch (error) {
    console.error('💥 Sync orchestrator failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Sync orchestrator failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
