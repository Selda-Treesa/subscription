import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, requestPasswordReset, resetPassword } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset-flow'>('signup');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);

  if (!isOpen) return null;

  // Validation rules checker
  const isLenValid = password.length > 8;
  const isUpperValid = /[A-Z]/.test(password);
  const isLowerValid = /[a-z]/.test(password);
  const isSpecialValid = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = isLenValid && isUpperValid && isLowerValid && isSpecialValid;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const res = login(email, password);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
      }, 700);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!isPasswordValid) {
      setStatusMsg({ type: 'error', text: 'Please ensure your password meets all complexity requirements.' });
      return;
    }
    const res = signup(name, email, password, company);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
      }, 800);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const res = requestPasswordReset(email);
    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: res.message,
        link: res.resetLink,
      });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!isPasswordValid) {
      setStatusMsg({ type: 'error', text: 'New password does not satisfy complexity requirements.' });
      return;
    }
    const res = resetPassword(email, password);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setMode('login');
        setStatusMsg(null);
      }, 1000);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {mode === 'signup' && 'Create Your Brightloop Account'}
              {mode === 'login' && 'Sign In to Brightloop'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset-flow' && 'Enter New Secure Password'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {mode === 'signup' && 'Fast self-service access to your subscriptions and invoices'}
              {mode === 'login' && 'Access customer portal, sales desk, or admin settings'}
              {mode === 'forgot' && "We'll send a secure password reset link to your email"}
              {mode === 'reset-flow' && 'Update your password meeting our high security standard'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Notifications */}
          {statusMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: statusMsg.type === 'success' ? '#34D399' : '#F87171',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div style={{ flex: 1 }}>
                <div>{statusMsg.text}</div>
                {statusMsg.link && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset-flow');
                        setStatusMsg(null);
                      }}
                      className="btn btn-accent btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <ExternalLink size={13} />
                      <span>Click to Test Password Reset Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company / Organization</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Studios LLC"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Unique per account)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@acmestudios.com"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>

                {/* Password Criteria Live Checklist */}
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(14, 20, 36, 0.6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Brightloop Password Security Standards:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.75rem' }}>
                    <div style={{ color: isLenValid ? '#34D399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{isLenValid ? '✓' : '○'}</span> More than 8 characters
                    </div>
                    <div style={{ color: isUpperValid ? '#34D399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{isUpperValid ? '✓' : '○'}</span> Uppercase letter (A-Z)
                    </div>
                    <div style={{ color: isLowerValid ? '#34D399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{isLowerValid ? '✓' : '○'}</span> Lowercase letter (a-z)
                    </div>
                    <div style={{ color: isSpecialValid ? '#34D399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{isSpecialValid ? '✓' : '○'}</span> Special character (!@#$)
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', opacity: isPasswordValid ? 1 : 0.6 }}
              >
                <span>Create Customer Account</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStatusMsg(null);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontWeight: 600, cursor: 'pointer' }}
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@brightloop.io"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setStatusMsg(null);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setStatusMsg(null);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label className="form-label">Registered Account Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@acmetech.com"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}
              >
                <KeyRound size={16} />
                <span>Dispatch Reset Link to Email</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStatusMsg(null);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontWeight: 600, cursor: 'pointer' }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ENTER NEW PASSWORD FLOW */}
          {mode === 'reset-flow' && (
            <form onSubmit={handleCompleteReset}>
              <div className="form-group">
                <label className="form-label">Email to Reset</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="form-input"
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>

                {/* Password Criteria Live Checklist */}
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(14, 20, 36, 0.6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.75rem' }}>
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
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', opacity: isPasswordValid ? 1 : 0.6 }}
              >
                <span>Save New Password &amp; Log In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
