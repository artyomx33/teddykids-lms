-- Fix duplicate /employments records for 11 employees
-- These have duplicate records from partial sync runs

DELETE FROM employes_raw_data 
WHERE endpoint = '/employments' 
AND employee_id IN (
  'bbc4df73-a188-46eb-8e44-1d9dab471116',
  'c4b5490a-59e8-4572-9c60-8d697aa383c6',
  '224134bc-bb0f-4dc4-93ab-cd0d2cfd09cc',
  'c192f03c-c8d2-4cba-aa71-c5bb27526f7a',
  '1f105c14-b11f-4bfb-8b64-f86344797716',
  '91533b03-3ddd-48f5-9ba1-7e829e0eb732',
  '5b635306-413f-4748-9641-8bc69b27c224',
  '392c74a5-358a-4dc5-b280-5b7d44ac594d',
  'e6bb40b1-0c89-410e-98be-3707e0590f6b',
  '69dc8620-6665-4f90-963a-600736e68e95',
  'e23902c0-4760-400f-a2bc-1a2027d50af1'
);
