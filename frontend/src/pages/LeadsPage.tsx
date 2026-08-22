import React, { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import NewLeadModal from '../components/NewLeadModal';
import { leadsApi } from '../api/leads';
import './LeadsPage.css';

// Initial mock data matching the screenshot
const initialMockLeads = [
  {
    id: 1,
    company: 'Meridian Holdings',
    contact: 'Hashmath Fazli',
    value: '$124,000',
    status: 'New',
    rep: 'Ishara Fonseka',
    awaiting: false,
  },
  {
    id: 2,
    company: 'Vantage Systems',
    contact: 'Leo Chen',
    value: '$87,500',
    status: 'Contacted',
    rep: 'Nadeesha Perera',
    awaiting: false,
  },
  {
    id: 3,
    company: 'Orbit Retail Ltd',
    contact: 'Michelle Tran',
    value: '$210,000',
    status: 'Qualified',
    rep: 'Ishara Fonseka',
    awaiting: false,
  },
  {
    id: 4,
    company: 'Apex Dynamics',
    contact: 'Farhan Ali',
    value: '$45,000',
    status: 'Assessment',
    rep: 'Ruwani Peris',
    awaiting: true,
  },
  {
    id: 5,
    company: 'CloudBridge Inc.',
    contact: 'Ananya Roy',
    value: '$330,000',
    status: 'Assessment',
    rep: 'Nadeesha Perera',
    awaiting: true,
  },
  {
    id: 6,
    company: 'NexGen Pharma',
    contact: 'Ravidu Pasan',
    value: '$178,000',
    status: 'Contacted',
    rep: 'Ishara Fonseka',
    awaiting: false,
  },
  {
    id: 7,
    company: 'Solaris Energy',
    contact: 'Senula Silva',
    value: '$95,000',
    status: 'Closed',
    rep: 'Ruwani Peris',
    awaiting: false,
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const data = await leadsApi.getLeads();
        setLeads(data);
      } catch (error) {
        console.error('Failed to fetch leads', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  const handleLeadCreated = (newLead: any) => {
    setLeads([newLead, ...leads]);
  };

  const getStatusClass = (status: string) => {
    return `status-${status.toLowerCase()}`;
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div className="leads-header-title">
          <h1>Leads</h1>
          <p>{leads.length} total leads in pipeline</p>
        </div>
        <button className="btn-new-lead" onClick={() => setIsModalOpen(true)}>
          + New Lead
        </button>
      </div>

      <div className="leads-filters">
        <div className="search-input-wrapper">
          <input type="text" placeholder="Search by company or contact..." />
        </div>
        <select className="filter-select" defaultValue="">
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Assessment">Assessment</option>
          <option value="Closed">Closed</option>
        </select>
        <select className="filter-select" defaultValue="">
          <option value="">All Reps</option>
          <option value="Ishara Fonseka">Ishara Fonseka</option>
          <option value="Nadeesha Perera">Nadeesha Perera</option>
          <option value="Ruwani Peris">Ruwani Peris</option>
        </select>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Value</th>
              <th>Status</th>
              <th>Sales Rep</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading leads...</td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No leads found. Create one!</td>
              </tr>
            ) : leads.map((lead) => {
              // Map DB fields to UI fields
              const currencySymbol = lead.currency === 'EUR' ? '€' : '$';
              const formattedValue = `${currencySymbol}${parseInt(lead.estimated_value || '0').toLocaleString()}`;
              const repName = lead.assigned_to_name || 'Unassigned';

              return (
              <tr key={lead.id}>
                <td className="col-company">{lead.company_name}</td>
                <td className="col-contact">{lead.contact_name}</td>
                <td className="col-value">{formattedValue}</td>
                <td>
                  <span className={`badge-status ${getStatusClass(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  <div className="rep-badge">
                    <span className="rep-dot"></span>
                    {repName}
                  </div>
                </td>
                <td>
                  <div className="action-cell">
                    {/* Placeholder for awaiting text if needed */}
                    <button className="btn-icon" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLeadCreated={handleLeadCreated}
      />
    </div>
  );
}
