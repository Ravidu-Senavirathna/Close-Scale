import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contactService, type Contact, organizationService, type Organization } from "../../api/contacts";
import "../dataForm.css";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [formData, setFormData] = useState<Partial<Contact>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    organization: null,
    custom_fields: {},
  });
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Custom fields state for dynamic UI
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orgs for the dropdown
        const orgsData = await organizationService.getOrganizations();
        setOrganizations(orgsData.results);

        if (!isNew && id) {
          const contact = await contactService.getContact(Number(id));
          setFormData(contact);
          
          // Map JSON object to array for the dynamic inputs
          const fieldsArray = Object.entries(contact.custom_fields || {}).map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
          setCustomFields(fieldsArray);
        }
      } catch (err) {
        console.error("Failed to fetch contact data", err);
        navigate("/contacts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isNew, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Reconstruct custom_fields JSON object from array
    const cfObject: Record<string, any> = {};
    customFields.forEach((cf) => {
      if (cf.key.trim()) {
        cfObject[cf.key.trim()] = cf.value.trim();
      }
    });
    
    // If organization string is "null", convert to actual null
    const payload = { 
      ...formData, 
      custom_fields: cfObject,
      organization: formData.organization ? Number(formData.organization) : null
    };

    try {
      if (isNew) {
        await contactService.createContact(payload);
      } else {
        await contactService.updateContact(Number(id), payload);
      }
      navigate("/contacts");
    } catch (err) {
      console.error("Failed to save contact", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', val: string) => {
    const newFields = [...customFields];
    newFields[index][field] = val;
    setCustomFields(newFields);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">
            {isNew ? "New Contact" : `${formData.first_name} ${formData.last_name}`}
          </h1>
          <p className="page-description">
            {isNew ? "Create a new contact record." : "Update contact details."}
          </p>
        </div>
      </div>

      <form className="data-form-container" onSubmit={handleSubmit}>
        <div className="data-form-body">
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                required
                className="form-input"
                type="text"
                value={formData.first_name || ""}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                required
                className="form-input"
                type="text"
                value={formData.last_name || ""}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                required
                className="form-input"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                className="form-input"
                type="text"
                value={formData.job_title || ""}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g. CTO, Freelancer"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Organization</label>
              <select
                className="form-select"
                value={formData.organization || ""}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">None (Freelancer / Independent)</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Fields Section */}
          <div className="custom-fields-section">
            <div className="custom-fields-title">
              <span>Custom Data Fields</span>
              <button type="button" className="btn-small" onClick={addCustomField}>
                + Add Field
              </button>
            </div>
            
            {customFields.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No custom fields added.</p>
            ) : (
              customFields.map((cf, idx) => (
                <div key={idx} className="custom-field-row">
                  <input
                    className="form-input"
                    placeholder="Field Name (e.g. LinkedIn Profile)"
                    value={cf.key}
                    onChange={(e) => handleCustomFieldChange(idx, 'key', e.target.value)}
                  />
                  <input
                    className="form-input"
                    placeholder="Value"
                    value={cf.value}
                    onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn-small" 
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'transparent' }}
                    onClick={() => removeCustomField(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

        <div className="data-form-footer">
          <button type="button" className="btn-secondary" onClick={() => navigate("/contacts")}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}
