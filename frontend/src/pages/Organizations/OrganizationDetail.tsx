import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { organizationService, type Organization } from "../../api/contacts";
import "../dataForm.css";

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [formData, setFormData] = useState<Partial<Organization>>({
    name: "",
    industry: "",
    website: "",
    address: "",
    custom_fields: {},
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Custom fields state for dynamic UI
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    if (!isNew && id) {
      const fetchOrg = async () => {
        try {
          const org = await organizationService.getOrganization(Number(id));
          setFormData(org);
          
          // Map JSON object to array for the dynamic inputs
          const fieldsArray = Object.entries(org.custom_fields || {}).map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
          setCustomFields(fieldsArray);
        } catch (err) {
          console.error("Failed to fetch org", err);
          navigate("/organizations");
        } finally {
          setLoading(false);
        }
      };
      fetchOrg();
    }
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
    
    const payload = { ...formData, custom_fields: cfObject };

    try {
      if (isNew) {
        await organizationService.createOrganization(payload);
      } else {
        await organizationService.updateOrganization(Number(id), payload);
      }
      navigate("/organizations");
    } catch (err) {
      console.error("Failed to save org", err);
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
          <h1 className="page-title">{isNew ? "New Organization" : formData.name}</h1>
          <p className="page-description">
            {isNew ? "Create a new organization record." : "Update organization details."}
          </p>
        </div>
      </div>

      <form className="data-form-container" onSubmit={handleSubmit}>
        <div className="data-form-body">
          
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              required
              className="form-input"
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Industry</label>
              <input
                className="form-input"
                type="text"
                value={formData.industry || ""}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Software, Finance"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                className="form-input"
                type="url"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Company headquarters address..."
            />
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
                    placeholder="Field Name (e.g. Registration No)"
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
          <button type="button" className="btn-secondary" onClick={() => navigate("/organizations")}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Organization"}
          </button>
        </div>
      </form>
    </div>
  );
}
