import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Zap,
  Users,
  Search,
  RefreshCw,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  CreditCard,
  PlusCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewQuote: () => void;
  onOpenBillingModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewQuote,
  onOpenBillingModal,
  onOpenAuthModal,
}) => {
  const {
    currentUser,
    users,
    switchUser,
    simulatedDate,
    setSimulatedDate,
    subscriptions,
    resetToMockData,
  } = useApp();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Subscriptions currently due for billing on simulated date
  const dueCount = subscriptions.filter(
    (s) => s.status === 'active' && new Date(s.nextBillingDate) <= new Date(simulatedDate)
  ).length;

  const handleDateShift = (days: number) => {
    const d = new Date(simulatedDate);
    d.setDate(d.getDate() + days);
    setSimulatedDate(d.toISOString().split('T')[0]);
  };

  return (
    <header className="top-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.875rem 1.75rem',
      background: 'rgba(7, 10, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Left: Brand Identity & Active Persona Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
          }}>
            <Zap size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #FFFFFF, #CBD5E1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Brightloop
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60A5FA',
                borderRadius: '4px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Subscription OS
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Recurring Billing &amp; Lifecycle Engine
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Simulated Billing Date Machine & Fast Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(17, 23, 38, 0.8)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '0.35rem 0.75rem',
        }}>
          <Calendar size={16} color="#60A5FA" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Billing Clock:
          </span>
          <input
            type="date"
            value={simulatedDate}
            onChange={(e) => setSimulatedDate(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <button
            onClick={() => handleDateShift(1)}
            title="Advance 1 day"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            +1d
          </button>
          <button
            onClick={() => handleDateShift(30)}
            title="Advance 1 month"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            +1mo
          </button>
        </div>

        {/* Billing Day Trigger Button */}
        {currentUser.role !== 'customer' && (
          <button
            onClick={onOpenBillingModal}
            className="btn btn-primary"
            style={{ position: 'relative' }}
          >
            <Zap size={16} />
            <span>Run Billing Day</span>
            {dueCount > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                marginLeft: '0.25rem',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
              }}>
                {dueCount} due
              </span>
            )}
          </button>
        )}
      </div>

      {/* Right: Quick Role Switcher, Current User & Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all subscriptions, invoices, and products back to the fresh Brightloop mock dataset?')) {
              resetToMockData();
            }
          }}
          title="Reset to fresh demo data"
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.35rem' }}
        >
          <RefreshCw size={13} />
          <span>Reset Data</span>
        </button>

        {/* Role Persona Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(22, 31, 51, 0.8)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem 0.75rem',
              cursor: 'pointer',
              color: '#FFFFFF',
              transition: 'all 0.2s',
            }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#60A5FA', textTransform: 'uppercase', fontWeight: 700 }}>
                {currentUser.role}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showPersonaMenu && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: '280px',
              background: '#111726',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0,0,0,0.7)',
              padding: '0.75rem',
              zIndex: 100,
            }}>
              <div style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                paddingLeft: '0.5rem',
              }}>
                Switch Persona Simulator
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowPersonaMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      width: '100%',
                      padding: '0.5rem',
                      background: u.id === currentUser.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      border: u.id === currentUser.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                      borderRadius: 'var(--radius-md)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {u.company || u.role}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      background:
                        u.role === 'admin'
                          ? 'rgba(45, 212, 191, 0.2)'
                          : u.role === 'staff'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(16, 185, 129, 0.2)',
                      color:
                        u.role === 'admin'
                          ? '#2DD4BF'
                          : u.role === 'staff'
                          ? '#60A5FA'
                          : '#34D399',
                    }}>
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.6rem', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    setShowPersonaMenu(false);
                    onOpenAuthModal();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#60A5FA',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Sign Up New Customer / Log In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
