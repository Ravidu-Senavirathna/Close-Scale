import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewLeadModal from '../components/NewLeadModal';
import BadgeSelect from '../components/BadgeSelect';
import { leadsApi } from '../api/leads';
import './LeadsPage.css';


export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Optimistic update
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      await leadsApi.updateLead(id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status.');
      // Ideally we would revert on failure, but for now just reload or let user know
    }
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
              let currencySymbol = '$';
              if (lead.currency === 'EUR') currencySymbol = '€';
              if (lead.currency === 'LKR') currencySymbol = 'LKR ';
              
              const formattedValue = `${currencySymbol}${parseInt(lead.estimated_value || '0').toLocaleString()}`;
              const repName = lead.assigned_to_name || 'Unassigned';

              return (
              <tr 
                key={lead.id} 
                onClick={() => navigate(`/leads/${lead.id}`)}
                style={{ cursor: 'pointer' }}
                className="lead-row"
              >
                <td className="col-company">{lead.company_name}</td>
                <td className="col-contact">{lead.contact_name}</td>
                <td className="col-value">{formattedValue}</td>
                <td>
                  <BadgeSelect
                    value={lead.status}
                    onChange={(newStatus) => handleStatusChange(lead.id, newStatus)}
                    badgeClass={`badge-status ${getStatusClass(lead.status)}`}
                    options={[
                      { value: 'New', label: 'New' },
                      { value: 'Contacted', label: 'Contacted' },
                      { value: 'Qualified', label: 'Qualified' },
                      { value: 'Assessment', label: 'Assessment' },
                      { value: 'Closed', label: 'Closed' }
                    ]}
                  />
                </td>
                <td>
                  <div className="rep-badge">
                    <span className="rep-dot"></span>
                    {repName}
                  </div>
                </td>
                <td>
                  <div className="action-cell">
                    <ArrowRight size={16} className="text-secondary" />
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
