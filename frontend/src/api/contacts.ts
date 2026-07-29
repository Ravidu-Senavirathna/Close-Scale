import api from "./axiosClient";

// ── Types ─────────────────────────────────────────────────────────────────

export interface Organization {
  id: number;
  name: string;
  industry: string;
  website: string;
  address: string;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  organization: number | null;
  organization_name?: string;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ── Organization Service ─────────────────────────────────────────────────

export const organizationService = {
  async getOrganizations(search?: string, industry?: string) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (industry) params.append("industry", industry);
    
    const response = await api.get<{ count: number; results: Organization[] }>(`/api/organizations/?${params.toString()}`);
    return response.data;
  },

  async getOrganization(id: number) {
    const response = await api.get<Organization>(`/api/organizations/${id}/`);
    return response.data;
  },

  async createOrganization(data: Partial<Organization>) {
    const response = await api.post<Organization>("/api/organizations/", data);
    return response.data;
  },

  async updateOrganization(id: number, data: Partial<Organization>) {
    const response = await api.patch<Organization>(`/api/organizations/${id}/`, data);
    return response.data;
  },

  async deleteOrganization(id: number) {
    await api.delete(`/api/organizations/${id}/`);
  },
};

// ── Contact Service ───────────────────────────────────────────────────────

export const contactService = {
  async getContacts(search?: string, organizationId?: number) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (organizationId) params.append("organization", organizationId.toString());
    
    const response = await api.get<{ count: number; results: Contact[] }>(`/api/contacts/?${params.toString()}`);
    return response.data;
  },

  async getContact(id: number) {
    const response = await api.get<Contact>(`/api/contacts/${id}/`);
    return response.data;
  },

  async createContact(data: Partial<Contact>) {
    const response = await api.post<Contact>("/api/contacts/", data);
    return response.data;
  },

  async updateContact(id: number, data: Partial<Contact>) {
    const response = await api.patch<Contact>(`/api/contacts/${id}/`, data);
    return response.data;
  },

  async deleteContact(id: number) {
    await api.delete(`/api/contacts/${id}/`);
  },
};
