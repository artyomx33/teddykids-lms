-- =========================================
-- 🔍 DISCOVER EMPLOYES.NL LOCATION IDs
-- =========================================
-- This script helps discover the actual location UUIDs from employes.nl API

-- Create a mapping table for discovered location UUIDs
CREATE TABLE IF NOT EXISTS employes_location_discovery (
  id SERIAL PRIMARY KEY,
  location_key text NOT NULL,
  location_name text NOT NULL,
  address text NOT NULL,
  manager text NOT NULL,
  employes_location_id uuid,
  discovery_method text DEFAULT 'manual',
  discovered_at timestamptz DEFAULT now(),
  notes text
);

-- Insert Teddy Kids locations with placeholders for discovered UUIDs
INSERT INTO employes_location_discovery (location_key, location_name, address, manager, employes_location_id, notes)
VALUES
  ('RBW', 'RBW - Rijnsburgerweg 35', 'Rijnsburgerweg 35, Leiden', 'Sofia',
   NULL, 'PASTE DISCOVERED UUID HERE'),

  ('RB3/RB5', 'RB3/RB5 - Rijnsburgerweg 3&5', 'Rijnsburgerweg 3 & 5, Leiden', 'Pamela',
   NULL, 'PASTE DISCOVERED UUID HERE'),

  ('LRZ', 'LRZ - Lorentzkade 15a', 'Lorentzkade 15a, Leiden', 'Antonella',
   NULL, 'PASTE DISCOVERED UUID HERE'),

  ('ZML', 'ZML - Zeemanlaan 22a', 'Zeemanlaan 22a, Leiden', 'Meral',
   NULL, 'PASTE DISCOVERED UUID HERE'),

  ('TISA', 'TISA - Lorentzkade 15a', 'Lorentzkade 15a, Leiden', 'Numa',
   NULL, 'PASTE DISCOVERED UUID HERE')
ON CONFLICT DO NOTHING;

-- Show current discovery status
SELECT '📍 LOCATION DISCOVERY STATUS' as title;

SELECT
  location_key,
  location_name,
  manager,
  CASE
    WHEN employes_location_id IS NULL THEN '❌ UUID NEEDED'
    ELSE '✅ UUID DISCOVERED'
  END as status,
  notes
FROM employes_location_discovery
ORDER BY location_key;

-- Instructions for manual discovery
SELECT '📝 MANUAL DISCOVERY INSTRUCTIONS:' as instructions;
SELECT '1. Log into employes.nl admin panel' as step_1;
SELECT '2. Navigate to Company → Locations' as step_2;
SELECT '3. Find each Teddy Kids location and copy its UUID' as step_3;
SELECT '4. Update this table with: UPDATE employes_location_discovery SET employes_location_id = ''UUID-HERE'' WHERE location_key = ''RBW'';' as step_4;
SELECT '5. Repeat for LRZ, ZML, RB3/RB5, TISA' as step_5;

-- Template for updating discovered UUIDs
SELECT '📋 UPDATE TEMPLATES:' as templates;
SELECT 'UPDATE employes_location_discovery SET employes_location_id = ''PASTE-RBW-UUID-HERE''::uuid WHERE location_key = ''RBW'';' as rbw_template;
SELECT 'UPDATE employes_location_discovery SET employes_location_id = ''PASTE-LRZ-UUID-HERE''::uuid WHERE location_key = ''LRZ'';' as lrz_template;
SELECT 'UPDATE employes_location_discovery SET employes_location_id = ''PASTE-ZML-UUID-HERE''::uuid WHERE location_key = ''ZML'';' as zml_template;
SELECT 'UPDATE employes_location_discovery SET employes_location_id = ''PASTE-RB3RB5-UUID-HERE''::uuid WHERE location_key = ''RB3/RB5'';' as rb3rb5_template;
SELECT 'UPDATE employes_location_discovery SET employes_location_id = ''PASTE-TISA-UUID-HERE''::uuid WHERE location_key = ''TISA'';' as tisa_template;