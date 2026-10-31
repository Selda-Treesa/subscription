import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Plus,
  Shield,
  Mail,
  Lock,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const StaffManagementView: React.FC = () => {
  const { users, currentUser, addStaffMember } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDept, setFormDept] = useState('Brightloop Sales');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Password criteria validator
  const isLenValid = formPassword.length > 8;
  const isUpperValid = /[A-Z]/.test(formPassword);
  const isLowerValid = /[a-z]/.test(formPassword);
  const isSpecialValid = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formPassword);
  const isPasswordValid = isLenValid && isUpperValid && isLowerValid && isSpecialValid;

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const res = addStaffMember(formName, formEmail, formPassword, formDept);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setTimeout(() => {
        setIsModalOpen(false);
        setStatusMsg(null);
      }, 1000);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  if (!isAdmin) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#F87171" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '480px', margin: '0.5rem auto 0' }}>
          Only the System Administrator has authority to add or invite internal team staff members.
        </p>
      </div>
    );
  }

  const staffMembers = users.filter((u) => u.role === 'staff' || u.role === 'admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Internal Staff Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Admin-only control room: manage internal staff access, sales representatives, and operations coordinators.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff List Table */}
      <div className="glass-panel">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Email Address</th>
                <th>Role / Access Level</th>
                <th>Department / Unit</th>
                <th>Added Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{member.name}</div>
                        {member.id === currentUser.id && (
                          <span style={{ fontSize: '0.65rem', color: '#60A5FA' }}>(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: member.role === 'admin' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: member.role === 'admin' ? '#2DD4BF' : '#60A5FA',
                    }}>
                      {member.role}
                    </span>
                  </td>
                  <td>{member.company || 'Internal Staff'}</td>
                  <td>{member.createdAt}</td>
                  <td>
                    <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>
                      ● Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add Internal Staff Member</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Only the System Admin can grant internal staff credentials
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddStaff} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {statusMsg && (
                <div style={{
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: statusMsg.type === 'success' ? '#34D399' : '#F87171',
                  fontSize: '0.85rem',
                }}>
                  {statusMsg.text}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Marcus Brody"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Work Email (Unique)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="marcus.brody@brightloop.io"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department / Title</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="Brightloop Sales Lead, Finance Coordinator, etc."
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>

                {/* Password Criteria Checklist */}
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.35rem',
                }}>
                  <div style={{ color: isLenValid ? '#34D399' : 'var(--text-muted)' }}>
                    {isLenValid ? '✓' : '○'} &gt; 8 characters
                  </div>
                  <div style={{ color: isUpperValid ? '#34D399' : 'var(--text-muted)' }}>
                    {isUpperValid ? '✓' : '○'} Uppercase (A-Z)
                  </div>
                  <div style={{ color: isLowerValid ? '#34D399' : 'var(--text-muted)' }}>
                    {isLowerValid ? '✓' : '○'} Lowercase (a-z)
                  </div>
                  <div style={{ color: isSpecialValid ? '#34D399' : 'var(--text-muted)' }}>
                    {isSpecialValid ? '✓' : '○'} Special char (!@#$)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isPasswordValid}
                  className="btn btn-primary"
                  style={{ opacity: isPasswordValid ? 1 : 0.6 }}
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
