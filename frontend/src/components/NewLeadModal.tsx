import React, { useState } from 'react';
import { X } from 'lucide-react';
import { leadsApi } from '../api/leads';
import './NewLeadModal.css';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: any) => void;
  leadToEdit?: any;
}

export default function NewLeadModal({ isOpen, onClose, onLeadCreated, leadToEdit }: NewLeadModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  
  // Form state
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [value, setValue] = useState('125000');
  const [currency, setCurrency] = useState('USD');
  const [repId, setRepId] = useState('unassigned');
  const [notes, setNotes] = useState('');
  const [industry, setIndustry] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (leadToEdit) {
        setCompany(leadToEdit.company_name || '');
        setContact(leadToEdit.contact_name || '');
        setValue(leadToEdit.estimated_value || '125000');
        setCurrency(leadToEdit.currency || 'USD');
        setRepId(leadToEdit.assigned_to ? String(leadToEdit.assigned_to) : 'unassigned');
        setPriority(leadToEdit.priority || 'Medium');
        setNotes(leadToEdit.notes || '');
        setIndustry(leadToEdit.industry || '');
        setLeadSource(leadToEdit.lead_source || '');
        setJobTitle(leadToEdit.job_title || '');
        setEmailAddress(leadToEdit.email_address || '');
        setPhoneNumber(leadToEdit.phone_number || '');
      } else {
        setCompany('');
        setContact('');
        setValue('125000');
        setCurrency('USD');
        setRepId('unassigned');
        setPriority('Medium');
        setNotes('');
        setIndustry('');
        setLeadSource('');
        setJobTitle('');
        setEmailAddress('');
        setPhoneNumber('');
      }
    }
  }, [isOpen, leadToEdit]);

  if (!isOpen) return null;

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    if (!company || !contact || !emailAddress || !value) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const newLeadPayload = {
        company_name: company,
        industry: industry || undefined,
        lead_source: leadSource || undefined,
        contact_name: contact,
        job_title: jobTitle || undefined,
        email_address: emailAddress,
        phone_number: phoneNumber || undefined,
        estimated_value: value,
        currency: currency,
        assigned_to: repId !== 'unassigned' ? parseInt(repId) : null,
        priority: priority,
        notes: notes || undefined,
        status: leadToEdit ? leadToEdit.status : 'New',
      };

      let result;
      if (leadToEdit && leadToEdit.id) {
        result = await leadsApi.updateLead(leadToEdit.id, newLeadPayload);
      } else {
        result = await leadsApi.createLead(newLeadPayload);
      }
      onLeadCreated(result);
      onClose();
    } catch (error) {
      console.error('Failed to save lead', error);
      alert('Failed to save lead. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0, justifyContent: 'flex-end' }}>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-stepper">
          <div className={`stepper-item ${step === 1 ? 'active' : 'inactive'}`}>
            Company & Contact
          </div>
          <div className={`stepper-item ${step === 2 ? 'active' : 'inactive'}`}>
            Deal Details
          </div>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <>
              <div className="form-section">
                <h3 className="section-title title-company">Company</h3>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Company Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Meridian Holdings" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Industry</label>
                    <select 
                      className="form-control"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Energy">Energy</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lead Source</label>
                    <select 
                      className="form-control"
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Outreach">Cold Outreach</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Event">Event</option>
                      <option value="Partner">Partner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title title-contact">Primary Contact</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Hashmath Fazli" 
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Job Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. CTO" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="contact@company.com" 
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="+1 (555) 000-0000" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-section">
                <h3 className="section-title title-deal">Deal Value</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Estimated Value *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select 
                      className="form-control"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="LKR">LKR</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title title-assignment">Assignment & Priority</h3>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Assign To Sales Rep</label>
                  <select 
                    className="form-control"
                    value={repId}
                    onChange={(e) => setRepId(e.target.value)}
                  >
                    <option value="unassigned">Unassigned</option>
                    <option value="1">Ishara Fonseka</option>
                    <option value="2">Nadeesha Perera</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <div className="priority-toggle">
                    <button 
                      className={`priority-btn ${priority === 'Low' ? 'active-medium' : ''}`}
                      onClick={() => setPriority('Low')}
                    >Low</button>
                    <button 
                      className={`priority-btn ${priority === 'Medium' ? 'active-medium' : ''}`}
                      onClick={() => setPriority('Medium')}
                    >Medium</button>
                    <button 
                      className={`priority-btn ${priority === 'High' ? 'active-medium' : ''}`}
                      onClick={() => setPriority('High')}
                    >High</button>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title title-notes">Notes</h3>
                <div className="form-group">
                  <textarea 
                    className="form-control" 
                    placeholder="Add any relevant context about this lead — pain points, timeline, decision makers..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {step === 1 ? (
            <>
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleNext}>Next</button>
            </>
          ) : (
            <>
              <button className="btn-cancel" onClick={handleBack} disabled={isSubmitting}>← Back</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (leadToEdit ? 'Save Changes' : 'Create Lead')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
