import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { contactService, type Contact } from "../../api/contacts";
import "../dataTable.css";

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const data = await contactService.getContacts(search);
        setContacts(data.results);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce
    const timeout = setTimeout(fetchContacts, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-description">Manage your network of individuals.</p>
        </div>
        <Link to="/contacts/new" className="btn-primary">
          <span>+</span> New Contact
        </Link>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="empty-state">No contacts found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Organization</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} onClick={() => navigate(`/contacts/${contact.id}`)}>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td>{contact.email}</td>
                  <td>{contact.job_title || <span style={{ color: '#64748b' }}>—</span>}</td>
                  <td>
                    {contact.organization_name ? (
                      <span style={{ 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        color: '#818cf8',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        {contact.organization_name}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.8rem' }}>Freelancer</span>
                    )}
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
