-- Remove test/practice records from staff table
DELETE FROM public.staff 
WHERE full_name IN (
    'sdfksdjf lkjdfkldsj',
    'artemmskiii tolmachevketeee',
    'Artem Tolmachev',
    'artem tolmachev'
);