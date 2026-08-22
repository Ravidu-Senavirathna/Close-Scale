import axiosClient from './axiosClient';

export interface LeadData {
  id?: number;
  company_name: string;
  industry?: string;
  lead_source?: string;
  contact_name: string;
  job_title?: string;
  email_address: string;
  phone_number?: string;
  estimated_value: string;
  currency: string;
  assigned_to?: number | string | null;
  assigned_to_name?: string;
  priority: string;
  notes?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const leadsApi = {
  getLeads: async () => {
    const response = await axiosClient.get('/api/leads/');
    return response.data;
  },
  
  createLead: async (leadData: Partial<LeadData>) => {
    const response = await axiosClient.post('/api/leads/', leadData);
    return response.data;
  }
};
