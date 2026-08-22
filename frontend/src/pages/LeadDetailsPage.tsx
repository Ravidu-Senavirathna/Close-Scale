import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, User, Phone, Mail, DollarSign, Calendar, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { leadsApi } from '../api/leads';
import type { LeadData } from '../api/leads';

import BadgeSelect from '../components/BadgeSelect';
import './LeadDetailsPage.css';

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Inline edit states
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingDeal, setIsEditingDeal] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isNotesPreview, setIsNotesPreview] = useState(false);
  
  // Form states for inline editing
  const [companyForm, setCompanyForm] = useState({ company_name: '', industry: '', lead_source: '' });
  const [contactForm, setContactForm] = useState({ contact_name: '', job_title: '', email_address: '', phone_number: '' });
  const [dealForm, setDealForm] = useState({ estimated_value: '', currency: 'USD', assigned_to: '' });
  const [notesForm, setNotesForm] = useState({ notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const startEditCompany = () => {
    setCompanyForm({
      company_name: lead?.company_name || '',
      industry: lead?.industry || '',
      lead_source: lead?.lead_source || ''
    });
    setIsEditingCompany(true);
  };

  const startEditContact = () => {
    setContactForm({
      contact_name: lead?.contact_name || '',
      job_title: lead?.job_title || '',
      email_address: lead?.email_address || '',
      phone_number: lead?.phone_number || ''
    });
    setIsEditingContact(true);
  };

  const startEditDeal = () => {
    setDealForm({
      estimated_value: lead?.estimated_value || '0',
      currency: lead?.currency || 'USD',
      assigned_to: lead?.assigned_to ? String(lead?.assigned_to) : ''
    });
    setIsEditingDeal(true);
  };

  const startEditNotes = () => {
    setNotesForm({
      notes: lead?.notes || ''
    });
    setIsEditingNotes(true);
    setIsNotesPreview(false);
  };

  const handleInlineSave = async (payload: any, onSuccess: () => void) => {
    if (!lead || !id) return;
    try {
      setIsSaving(true);
      const updatedLead = await leadsApi.updateLead(id, payload);
      setLead(updatedLead);
      onSuccess();
    } catch (err) {
      console.error('Failed to save inline edit', err);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const data = await leadsApi.getLeadById(id);
          setLead(data);
        }
      } catch (err: any) {
        console.error('Failed to fetch lead details', err);
        setError('Failed to load lead information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead || !id) return;
    try {
      setLead({ ...lead, status: newStatus }); // Optimistic update
      await leadsApi.updateLead(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      // Revert on failure (could refetch or just alert)
      alert('Failed to update status.');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!lead || !id) return;
    try {
      setLead({ ...lead, priority: newPriority }); // Optimistic update
      await leadsApi.updateLead(id, { priority: newPriority });
    } catch (err) {
      console.error('Failed to update priority', err);
      alert('Failed to update priority.');
    }
  };

  if (isLoading) {
    return (
      <div className="lead-details-page">
        <div className="loading-state">Loading lead information...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="lead-details-page">
        <div className="error-state">
          <p>{error || 'Lead not found.'}</p>
          <Link to="/leads" className="btn-back">← Back to Leads</Link>
        </div>
      </div>
    );
  }

  let currencySymbol = '$';
  if (lead.currency === 'EUR') currencySymbol = '€';
  if (lead.currency === 'LKR') currencySymbol = 'LKR ';
  
  const formattedValue = `${currencySymbol}${parseInt(lead.estimated_value || '0').toLocaleString()}`;

  const getStatusClass = (status: string) => `status-${status.toLowerCase()}`;

  return (
    <div className="lead-details-page">
      <div className="page-header">
        <Link to="/leads" className="btn-back">
          <ArrowLeft size={16} /> Back to Leads
        </Link>
        <div className="header-content">
          <div>
            <h1>{lead.company_name}</h1>
            <p className="subtitle">{lead.contact_name} • {lead.industry || 'Unknown Industry'}</p>
          </div>
          <div className="header-actions">
            <BadgeSelect
              value={lead.status}
              onChange={handleStatusChange}
              badgeClass={`badge-status ${getStatusClass(lead.status)}`}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Assessment', label: 'Assessment' },
                { value: 'Closed', label: 'Closed' }
              ]}
            />
            
            <BadgeSelect
              value={lead.priority}
              onChange={handlePriorityChange}
              badgeClass={`priority-badge priority-${lead.priority?.toLowerCase()}`}
              options={[
                { value: 'Low', label: 'Low Priority' },
                { value: 'Medium', label: 'Medium Priority' },
                { value: 'High', label: 'High Priority' }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="card-section">
          <h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} /> Company Information
            </span>
            
              <button className="btn-edit-section" onClick={startEditCompany} title="Edit Company Information">
                <Edit2 size={14} className="edit-icon" />
              </button>
          </h2>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Company Name</span>
              <span className="value">{lead.company_name}</span>
            </div>
            <div className="info-item">
              <span className="label">Industry</span>
              <span className="value">{lead.industry || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">Lead Source</span>
              <span className="value">{lead.lead_source || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card-section">
          <h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> Contact Information
            </span>
            
              <button className="btn-edit-section" onClick={startEditContact} title="Edit Contact Information">
                <Edit2 size={14} className="edit-icon" />
              </button>
          </h2>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Full Name</span>
              <span className="value">{lead.contact_name}</span>
            </div>
            <div className="info-item">
              <span className="label">Job Title</span>
              <span className="value">{lead.job_title || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">
                <Mail size={14} className="inline-icon" /> Email
              </span>
              <span className="value">
                <a href={`mailto:${lead.email_address}`}>{lead.email_address}</a>
              </span>
            </div>
            <div className="info-item">
              <span className="label">
                <Phone size={14} className="inline-icon" /> Phone
              </span>
              <span className="value">
                {lead.phone_number ? <a href={`tel:${lead.phone_number}`}>{lead.phone_number}</a> : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="card-section">
          <h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} /> Deal Details
            </span>
            
              <button className="btn-edit-section" onClick={startEditDeal} title="Edit Deal Details">
                <Edit2 size={14} className="edit-icon" />
              </button>
          </h2>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Estimated Value</span>
              <span className="value highlight-value">{formattedValue}</span>
            </div>
            <div className="info-item">
              <span className="label">Assigned To</span>
              <span className="value">
                {lead.assigned_to_name ? (
                  <div className="rep-badge">
                    <span className="rep-dot"></span>
                    {lead.assigned_to_name}
                  </div>
                ) : 'Unassigned'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">
                <Calendar size={14} className="inline-icon" /> Created On
              </span>
              <span className="value">
                {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="card-section full-width">
          <h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Notes
            </span>
            
              <button className="btn-edit-section" onClick={startEditNotes} title="Edit Notes">
                <Edit2 size={14} className="edit-icon" />
              </button>
          </h2>
          <div className="notes-content">
            {lead.notes ? (
              <>
                <div className="markdown-notes">
                  <ReactMarkdown>{lead.notes}</ReactMarkdown>
                </div>
                {lead.updated_at && (
                  <div className="notes-timestamp">
                    Last updated: {new Date(lead.updated_at).toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <p className="empty-text">No notes provided for this lead.</p>
            )}
          </div>
        </div>
      </div>
      

      {/* Modals */}
      {isEditingCompany && (
        <div className="edit-modal-overlay" onClick={() => setIsEditingCompany(false)}>
          <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
            <h3>Edit Company Information</h3>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" value={companyForm.company_name} onChange={e => setCompanyForm({...companyForm, company_name: e.target.value})} className="inline-input" />
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input type="text" value={companyForm.industry} onChange={e => setCompanyForm({...companyForm, industry: e.target.value})} className="inline-input" />
            </div>
            <div className="form-group">
              <label>Lead Source</label>
              <input type="text" value={companyForm.lead_source} onChange={e => setCompanyForm({...companyForm, lead_source: e.target.value})} className="inline-input" />
            </div>
            <div className="inline-edit-actions">
              <button className="btn-cancel-inline" onClick={() => setIsEditingCompany(false)} disabled={isSaving}>Cancel</button>
              <button className="btn-save-inline" onClick={() => handleInlineSave(companyForm, () => setIsEditingCompany(false))} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingContact && (
        <div className="edit-modal-overlay" onClick={() => setIsEditingContact(false)}>
          <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
            <h3>Edit Contact Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={contactForm.contact_name} onChange={e => setContactForm({...contactForm, contact_name: e.target.value})} className="inline-input" />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" value={contactForm.job_title} onChange={e => setContactForm({...contactForm, job_title: e.target.value})} className="inline-input" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={contactForm.email_address} onChange={e => setContactForm({...contactForm, email_address: e.target.value})} className="inline-input" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={contactForm.phone_number} onChange={e => setContactForm({...contactForm, phone_number: e.target.value})} className="inline-input" />
            </div>
            <div className="inline-edit-actions">
              <button className="btn-cancel-inline" onClick={() => setIsEditingContact(false)} disabled={isSaving}>Cancel</button>
              <button className="btn-save-inline" onClick={() => handleInlineSave(contactForm, () => setIsEditingContact(false))} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingDeal && (
        <div className="edit-modal-overlay" onClick={() => setIsEditingDeal(false)}>
          <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
            <h3>Edit Deal Details</h3>
            <div className="form-group">
              <label>Estimated Value</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" value={dealForm.estimated_value} onChange={e => setDealForm({...dealForm, estimated_value: e.target.value})} className="inline-input" style={{ flex: 2 }} />
                <select value={dealForm.currency} onChange={e => setDealForm({...dealForm, currency: e.target.value})} className="inline-input" style={{ flex: 1 }}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="LKR">LKR</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Assigned Rep ID</label>
              <input type="text" placeholder="Rep ID" value={dealForm.assigned_to} onChange={e => setDealForm({...dealForm, assigned_to: e.target.value})} className="inline-input" />
            </div>
            <div className="inline-edit-actions">
              <button className="btn-cancel-inline" onClick={() => setIsEditingDeal(false)} disabled={isSaving}>Cancel</button>
              <button className="btn-save-inline" onClick={() => handleInlineSave({
                estimated_value: dealForm.estimated_value,
                currency: dealForm.currency,
                assigned_to: dealForm.assigned_to ? parseInt(dealForm.assigned_to) : null
              }, () => setIsEditingDeal(false))} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingNotes && (
        <div className="edit-modal-overlay" onClick={() => setIsEditingNotes(false)}>
          <div className="edit-modal-container notes-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ marginBottom: 0 }}>Edit Notes</h3>
              <button 
                type="button" 
                className="btn-cancel-inline" 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setIsNotesPreview(!isNotesPreview)}
              >
                {isNotesPreview ? 'Write' : 'Preview'}
              </button>
            </div>
            
            {isNotesPreview ? (
              <div className="inline-textarea preview-mode markdown-notes" style={{ overflowY: 'auto', background: 'var(--surface-light, #17181c)', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                {notesForm.notes ? <ReactMarkdown>{notesForm.notes}</ReactMarkdown> : <p className="empty-text">Nothing to preview.</p>}
              </div>
            ) : (
              <textarea 
                value={notesForm.notes} 
                onChange={e => setNotesForm({notes: e.target.value})} 
                className="inline-input inline-textarea" 
                placeholder="Enter markdown notes here..."
                rows={15}
              />
            )}
            
            <div className="inline-edit-actions">
              <button className="btn-cancel-inline" onClick={() => setIsEditingNotes(false)} disabled={isSaving}>Cancel</button>
              <button className="btn-save-inline" onClick={() => handleInlineSave(notesForm, () => setIsEditingNotes(false))} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
