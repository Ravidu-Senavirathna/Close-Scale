import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, User, Phone, Mail, DollarSign, Calendar, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { leadsApi } from '../api/leads';
import type { LeadData } from '../api/leads';
import NewLeadModal from '../components/NewLeadModal';
import BadgeSelect from '../components/BadgeSelect';
import './LeadDetailsPage.css';

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            <button 
              className="btn-edit-lead" 
              onClick={() => setIsEditModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--surface-light)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              <Edit2 size={16} /> Edit Lead
            </button>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="card-section">
          <h2><Building2 size={18} /> Company Information</h2>
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
          <h2><User size={18} /> Contact Information</h2>
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
          <h2><DollarSign size={18} /> Deal Details</h2>
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
          <h2>Notes</h2>
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
      
      {isEditModalOpen && (
        <NewLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onLeadCreated={(updatedLead) => {
            setLead(updatedLead);
          }}
          leadToEdit={lead}
        />
      )}
    </div>
  );
}
