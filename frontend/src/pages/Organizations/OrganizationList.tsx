import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { organizationService, type Organization } from "../../api/contacts";
import "../dataTable.css";

export default function OrganizationList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      try {
        const data = await organizationService.getOrganizations(search);
        setOrganizations(data.results);
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce
    const timeout = setTimeout(fetchOrgs, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-description">Manage companies and external entities.</p>
        </div>
        <Link to="/organizations/new" className="btn-primary">
          <span>+</span> New Organization
        </Link>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : organizations.length === 0 ? (
          <div className="empty-state">No organizations found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Website</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} onClick={() => navigate(`/organizations/${org.id}`)}>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>{org.name}</td>
                  <td>{org.industry || <span style={{ color: '#64748b' }}>—</span>}</td>
                  <td>
                    {org.website ? (
                      <a 
                        href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: '#818cf8', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {org.website}
                      </a>
                    ) : (
                      <span style={{ color: '#64748b' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
