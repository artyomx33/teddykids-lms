-- Check what endpoints we have data for
SELECT 
  'ENDPOINTS AVAILABLE' as report,
  endpoint,
  COUNT(*) as record_count
FROM employes_raw_data
WHERE is_latest = true
GROUP BY endpoint
ORDER BY record_count DESC;

-- Check sample employment data structure
SELECT 
  'SAMPLE EMPLOYMENT DATA' as report,
  data
FROM employes_raw_data
WHERE endpoint = '/employments'
  AND is_latest = true
LIMIT 1;

-- Check what fields are in employment changes
SELECT 
  'CHANGE TYPES' as report,
  change_type,
  COUNT(*) as count
FROM employes_changes
GROUP BY change_type
ORDER BY count DESC;

-- Sample change with metadata
SELECT 
  'SAMPLE CHANGE METADATA' as report,
  change_type,
  field_path,
  metadata
FROM employes_changes
LIMIT 5;

-- Check current timeline event types
SELECT 
  'CURRENT TIMELINE EVENTS' as report,
  event_type,
  COUNT(*) as count,
  string_agg(DISTINCT event_description, ', ') as descriptions
FROM employes_timeline_v2
GROUP BY event_type
ORDER BY count DESC;

