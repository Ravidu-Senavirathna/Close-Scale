import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Building2, User, Phone, Mail, DollarSign, Calendar, Edit2, Trash2, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { leadsApi } from '../api/leads';
import { getSalesReps } from '../api/usersApi';
import type { LeadData } from '../api/leads';

import BadgeSelect from '../components/BadgeSelect';
import './LeadDetailsPage.css';

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Inline edit states
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingDeal, setIsEditingDeal] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isNotesPreview, setIsNotesPreview] = useState(false);
  const [salesReps, setSalesReps] = useState<{id: number, full_name: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes'>('overview');

  
  // Form states for inline editing
  const [companyForm, setCompanyForm] = useState({ company_name: '', industry: '', lead_source: '' });
  const [contactForm, setContactForm] = useState({ contact_name: '', job_title: '', email_address: '', phone_number: '' });
  const [dealForm, setDealForm] = useState({ estimated_value: '', currency: 'USD', assigned_to: '' });
  const [notesForm, setNotesForm] = useState({ notes: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
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

  const handleAddNote = async () => {
    if (!id || !notesForm.notes.trim()) return;
    try {
      setIsSaving(true);
      const newNote = await leadsApi.addNote(id, notesForm.notes);
      
      setLead(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lead_notes: [newNote, ...(prev.lead_notes || [])]
        };
      });
      setNotesForm({ notes: '' });
      setIsAddNoteModalOpen(false);
    } catch (err) {
      console.error('Failed to add note', err);
      alert('Failed to add note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await leadsApi.deleteNote(id, noteId);
      setLead(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lead_notes: (prev.lead_notes || []).filter(note => note.id !== noteId)
        };
      });
    } catch (err: any) {
      console.error('Failed to delete note', err);
      if (err.response?.status === 403) {
        alert('You can only delete your own notes.');
      } else {
        alert('Failed to delete note.');
      }
    }
  };

  const handleEditNoteSave = async (noteId: number) => {
    if (!id || !editingNoteContent.trim()) return;
    try {
      setIsSaving(true);
      const updatedNote = await leadsApi.updateNote(id, noteId, editingNoteContent);
      setLead(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lead_notes: (prev.lead_notes || []).map(note => note.id === noteId ? updatedNote : note)
        };
      });
      setEditingNoteId(null);
      setEditingNoteContent('');
    } catch (err: any) {
      console.error('Failed to update note', err);
      if (err.response?.status === 403) {
        alert('You can only edit your own notes.');
      } else {
        alert('Failed to update note.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isEditingDeal && salesReps.length === 0) {
      getSalesReps().then(setSalesReps).catch(console.error);
    }
  }, [isEditingDeal, salesReps.length]);

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

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="details-grid">
          <div className="card-section">
            <h2>
              <span>CONTACT INFO</span>
              <button className="btn-edit-section" onClick={() => { startEditCompany(); startEditContact(); }} title="Edit Contact Information">
                <Edit2 size={14} className="edit-icon" />
              </button>
            </h2>
            <div className="info-list">
              <div className="info-item">
                <span className="label">Contact</span>
                <span className="value">{lead.contact_name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">
                  <a href={`mailto:${lead.email_address}`}>{lead.email_address}</a>
                </span>
              </div>
              <div className="info-item">
                <span className="label">Phone</span>
                <span className="value">
                  {lead.phone_number ? <a href={`tel:${lead.phone_number}`}>{lead.phone_number}</a> : '—'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Industry</span>
                <span className="value">{lead.industry || '—'}</span>
              </div>
              <div className="info-item">
                <span className="label">Source</span>
                <span className="value">{lead.lead_source || '—'}</span>
              </div>
            </div>
          </div>

          <div className="card-section">
            <h2>
              <span>DEAL DETAILS</span>
              <button className="btn-edit-section" onClick={startEditDeal} title="Edit Deal Details">
                <Edit2 size={14} className="edit-icon" />
              </button>
            </h2>
            <div className="info-list">
              <div className="info-item horizontal">
                <span className="label">Est. Value</span>
                <span className="value highlight-value">{formattedValue}</span>
              </div>
              <div className="info-item horizontal">
                <span className="label">Assigned To</span>
                <span className="value">
                  {lead.assigned_to_name || 'Unassigned'}
                </span>
              </div>
              <div className="info-item horizontal">
                <span className="label">Created</span>
                <span className="value">
                  {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="info-item horizontal">
                <span className="label">Last Activity</span>
                <span className="value">
                  {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
            
            <div className="deal-notes-snippet">
              <span className="label">Notes</span>
              <p className="snippet-text">
                {lead.notes ? (lead.notes.length > 50 ? `${lead.notes.substring(0, 50)}...` : lead.notes) : 'No notes added yet.'}
              </p>
            </div>
          </div>

          <div className="card-section full-width">
            <h2>PIPELINE PROGRESS</h2>
            <div className="pipeline-progress">
              {['New', 'Contacted', 'Qualified', 'Assessment', 'Closed'].map((step, idx) => {
                const steps = ['New', 'Contacted', 'Qualified', 'Assessment', 'Closed'];
                const currentIndex = steps.indexOf(lead.status) >= 0 ? steps.indexOf(lead.status) : 0;
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                
                return (
                  <div key={step} className={`pipeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-circle">{idx + 1}</div>
                    <div className="step-label">{step}</div>
                    {idx < steps.length - 1 && <div className="step-line"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="activity-tab-content">
          <div className="activity-actions">
            <button className="btn-action-green">+ Log Interaction</button>
            <button className="btn-action-blue">+ Schedule Follow-up</button>
          </div>
          <div className="empty-state">
            <p className="empty-text">No activity logged yet.</p>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="notes-tab-content">
          <div className="activity-actions" style={{ marginBottom: '1.5rem' }}>
            <button className="btn-action-green" onClick={() => setIsAddNoteModalOpen(true)}>+ Add Note</button>
          </div>
          
          <div className="notes-list">
            {(lead.lead_notes && lead.lead_notes.length > 0) ? (
              lead.lead_notes.map((note) => (
                <div key={note.id} className="note-item" style={{ position: 'relative' }}>
                  {editingNoteId !== note.id && (
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-edit-note" 
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingNoteContent(note.content);
                        }}
                        title="Edit Note"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.7 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className="btn-delete-note" 
                        onClick={() => handleDeleteNote(note.id)}
                        title="Delete Note"
                        style={{ background: 'transparent', border: 'none', color: 'var(--error, #ef4444)', cursor: 'pointer', opacity: 0.7 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {editingNoteId === note.id ? (
                    <div className="notes-input-container" style={{ marginTop: '0', padding: '0', border: 'none', background: 'transparent' }}>
                      <textarea 
                        className="inline-textarea notes-main-textarea" 
                        value={editingNoteContent}
                        onChange={e => setEditingNoteContent(e.target.value)}
                        style={{ minHeight: '100px' }}
                      />
                      <div className="notes-action-row" style={{ marginTop: '1rem' }}>
                        <button 
                          className="btn-cancel-inline" 
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingNoteContent('');
                          }} 
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn-save-inline" 
                          onClick={() => handleEditNoteSave(note.id)} 
                          disabled={isSaving || !editingNoteContent.trim()}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="markdown-notes">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                      <div className="notes-timestamp">
                        Added by <strong style={{ color: 'var(--text-primary)' }}>{note.author_name}</strong> on {new Date(note.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              lead.notes ? (
                <div className="note-item">
                  <div className="markdown-notes">
                    <ReactMarkdown>{lead.notes}</ReactMarkdown>
                  </div>
                  <div className="notes-timestamp">Legacy note</div>
                </div>
              ) : (
                <div className="empty-state" style={{ marginTop: '3rem' }}>
                  <p className="empty-text">No notes yet.</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

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
              <select 
                value={dealForm.assigned_to || ''} 
                onChange={e => setDealForm({...dealForm, assigned_to: e.target.value})} 
                className="inline-input"
                disabled={currentUser?.role === 'SALES_REP'}
              >
                <option value="">-- Unassigned --</option>
                {salesReps.map(rep => (
                  <option key={rep.id} value={rep.id}>
                    {rep.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="inline-edit-actions">
              <button className="btn-cancel-inline" onClick={() => setIsEditingDeal(false)} disabled={isSaving}>Cancel</button>
              <button className="btn-save-inline" onClick={() => handleInlineSave({
                estimated_value: dealForm.estimated_value,
                currency: dealForm.currency,
                assigned_to: dealForm.assigned_to ? parseInt(dealForm.assigned_to.toString()) : null
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

      {/* Add Note Modal */}
      {isAddNoteModalOpen && (
        <div className="edit-modal-overlay" onClick={() => setIsAddNoteModalOpen(false)}>
          <div className="edit-modal-container notes-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Add Note</h3>
              <div style={{ display: 'flex', gap: '1.5rem', marginRight: '0.5rem' }}>
                <button 
                  className={`tab-btn ${!isNotesPreview ? 'active' : ''}`}
                  onClick={() => setIsNotesPreview(false)}
                  style={{ padding: '0.25rem 0', fontSize: '0.9rem' }}
                >Write</button>
                <button 
                  className={`tab-btn ${isNotesPreview ? 'active' : ''}`}
                  onClick={() => setIsNotesPreview(true)}
                  style={{ padding: '0.25rem 0', fontSize: '0.9rem' }}
                >Preview</button>
              </div>
            </div>
            
            <div className="form-group" style={{ flexGrow: 1 }}>
              {isNotesPreview ? (
                <div className="markdown-notes" style={{ padding: '1.5rem', background: '#17181c', borderRadius: '8px', minHeight: '450px', border: '1px solid var(--border-light)', overflowY: 'auto' }}>
                  {notesForm.notes.trim() ? <ReactMarkdown>{notesForm.notes}</ReactMarkdown> : <p className="empty-text">Nothing to preview...</p>}
                </div>
              ) : (
                <textarea 
                  className="inline-input inline-textarea" 
                  placeholder="Type your markdown note here..."
                  value={notesForm.notes}
                  onChange={e => setNotesForm({notes: e.target.value})}
                />
              )}
            </div>

            <div className="inline-edit-actions" style={{ marginTop: '1rem' }}>
              <button 
                className="btn-cancel-inline" 
                onClick={() => {
                  setIsAddNoteModalOpen(false);
                  setIsNotesPreview(false);
                }} 
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="btn-save-inline" 
                onClick={() => {
                  handleAddNote();
                  setIsNotesPreview(false);
                }} 
                disabled={isSaving || !notesForm.notes.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
