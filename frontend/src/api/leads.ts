import axiosClient from './axiosClient';

export interface LeadNote {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
}

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
  lead_notes?: LeadNote[];
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const leadsApi = {
  getLeads: async () => {
    const response = await axiosClient.get('/api/leads/');
    return response.data.results || response.data;
  },
  
  getLeadById: async (id: string | number) => {
    const response = await axiosClient.get(`/api/leads/${id}/`);
    return response.data;
  },
  
  createLead: async (leadData: Partial<LeadData>) => {
    const response = await axiosClient.post('/api/leads/', leadData);
    return response.data;
  },
  
  updateLead: async (id: string | number, leadData: Partial<LeadData>) => {
    const response = await axiosClient.patch(`/api/leads/${id}/`, leadData);
    return response.data;
  },

  addNote: async (id: string | number, content: string) => {
    const response = await axiosClient.post(`/api/leads/${id}/add_note/`, { content });
    return response.data;
  },

  deleteNote: async (leadId: string | number, noteId: number) => {
    const response = await axiosClient.delete(`/api/leads/${leadId}/delete_note/${noteId}/`);
    return response.data;
  },

  updateNote: async (leadId: string | number, noteId: number, content: string) => {
    const response = await axiosClient.patch(`/api/leads/${leadId}/edit_note/${noteId}/`, { content });
    return response.data;
  }
};
