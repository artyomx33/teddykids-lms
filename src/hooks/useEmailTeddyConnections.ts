import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeddyConnections {
  staff?: Array<{ id: string; full_name: string; role?: string }>;
  contracts?: Array<{ id: string; employee_name: string; contract_type?: string }>;
  reviews?: Array<{ id: string; staff_id: string; review_date: string; score?: number }>;
}

export const useEmailTeddyConnections = (email: any) => {
  const [connections, setConnections] = useState<TeddyConnections | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setConnections(null);
      return;
    }

    const findConnections = async () => {
      setIsLoading(true);
      try {
        const allEmails = [
          email.sender_email,
          ...email.recipient_emails,
          ...email.cc_emails,
          ...email.bcc_emails
        ].filter(Boolean);

        const connections: TeddyConnections = {};

        // Find staff connections based on email addresses
        const { data: staffByEmail } = await supabase
          .from('staff')
          .select('id, full_name, role, email')
          .in('email', allEmails);

        if (staffByEmail && staffByEmail.length > 0) {
          connections.staff = staffByEmail;
        }

        // Find staff connections based on name matching
        const names = [email.sender_name]
          .filter(Boolean)
          .map(name => name.toLowerCase());

        if (names.length > 0) {
          const { data: staffByName } = await supabase
            .from('staff')
            .select('id, full_name, role')
            .ilike('full_name', `%${names[0]}%`);

          if (staffByName && staffByName.length > 0) {
            const existingIds = new Set(connections.staff?.map(s => s.id) || []);
            const newStaff = staffByName.filter(s => !existingIds.has(s.id));
            connections.staff = [...(connections.staff || []), ...newStaff];
          }
        }

        // Find contract connections
        if (connections.staff && connections.staff.length > 0) {
          const staffNames = connections.staff.map(s => s.full_name);
          
          const { data: contracts } = await supabase
            .from('contracts')
            .select('id, employee_name, contract_type')
            .in('employee_name', staffNames)
            .order('created_at', { ascending: false })
            .limit(5);

          if (contracts && contracts.length > 0) {
            connections.contracts = contracts;
          }
        }

        // Find review connections
        if (connections.staff && connections.staff.length > 0) {
          const staffIds = connections.staff.map(s => s.id);
          
          const { data: reviews } = await supabase
            .from('staff_reviews')
            .select('id, staff_id, review_date, score')
            .in('staff_id', staffIds)
            .order('review_date', { ascending: false })
            .limit(5);

          if (reviews && reviews.length > 0) {
            connections.reviews = reviews;
          }
        }

        // Subject-based contract matching
        const contractKeywords = ['contract', 'agreement', 'employment', 'hiring', 'position', 'role'];
        const subjectLower = email.subject?.toLowerCase() || '';
        
        if (contractKeywords.some(keyword => subjectLower.includes(keyword))) {
          // Extract potential names from subject or body
          const textToSearch = `${email.subject} ${email.snippet}`.toLowerCase();
          
          const { data: contractsByContent } = await supabase
            .from('contracts')
            .select('id, employee_name, contract_type')
            .order('created_at', { ascending: false })
            .limit(10);

          if (contractsByContent) {
            const matchingContracts = contractsByContent.filter(contract => 
              textToSearch.includes(contract.employee_name.toLowerCase())
            );

            if (matchingContracts.length > 0) {
              const existingIds = new Set(connections.contracts?.map(c => c.id) || []);
              const newContracts = matchingContracts.filter(c => !existingIds.has(c.id));
              connections.contracts = [...(connections.contracts || []), ...newContracts];
            }
          }
        }

        setConnections(Object.keys(connections).length > 0 ? connections : null);

      } catch (error) {
        console.error('Error finding Teddy Kids connections:', error);
        setConnections(null);
      } finally {
        setIsLoading(false);
      }
    };

    findConnections();
  }, [email]);

  return { connections, isLoading };
};