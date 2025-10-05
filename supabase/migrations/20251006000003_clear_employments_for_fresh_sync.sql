-- Clear all /employments records to allow fresh collection
-- This is safe because we're about to re-import them with the correct endpoint
DELETE FROM employes_raw_data WHERE endpoint = '/employments';
