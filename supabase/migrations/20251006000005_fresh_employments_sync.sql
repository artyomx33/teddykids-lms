-- Complete fresh start for /employments endpoint
-- Delete ALL /employments records so we can do a clean full sync
DELETE FROM employes_raw_data WHERE endpoint = '/employments';
