import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Repeat,
  FileText,
  Zap,
  CreditCard,
  AlertOctagon,
  Package,
  CalendarDays,
  FileCheck2,
  Percent,
  UserCheck,
  User,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'subscriptions'
  | 'invoices'
  | 'billing-run'
  | 'payments'
  | 'overdue-chaser'
  | 'products'
  | 'plans'
  | 'templates'
  | 'discounts-taxes'
  | 'staff-management'
  | 'customer-portal'
  | 'automation-center';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, invoices, subscriptions } = useApp();

  const overdueCount = invoices.filter((i) => i.isOverdue).length;
  const quoteCount = subscriptions.filter((s) => s.status === 'quotation').length;

  const isAdmin = currentUser.role === 'admin';
  const isStaff = currentUser.role === 'staff';
  const isCustomer = currentUser.role === 'customer';

  return (
    <aside
      className="sidebar"
      style={{
        width: '260px',
        minWidth: '260px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.875rem',
        minHeight: 'calc(100vh - 65px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Navigation Sections */}
        {isCustomer ? (
          <div>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              padding: '0 0.75rem 0.5rem',
            }}>
              Customer Self-Service
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button
                onClick={() => setActiveTab('customer-portal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: activeTab === 'customer-portal' ? 'var(--primary-gradient)' : 'transparent',
                  color: activeTab === 'customer-portal' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'customer-portal' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                }}
              >
                <User size={18} />
                <span>My Portal &amp; Billing</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Core Operations */}
            <div>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                padding: '0 0.75rem 0.5rem',
              }}>
                Overview &amp; Revenue
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'dashboard' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'dashboard' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'dashboard' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <LayoutDashboard size={17} />
                  <span>Finance Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('subscriptions')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'subscriptions' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'subscriptions' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'subscriptions' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Repeat size={17} />
                    <span>Subscriptions &amp; Quotes</span>
                  </div>
                  {quoteCount > 0 && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: activeTab === 'subscriptions' ? 'rgba(255,255,255,0.25)' : 'rgba(14, 165, 233, 0.2)',
                      color: activeTab === 'subscriptions' ? '#FFF' : '#38BDF8',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                    }}>
                      {quoteCount} qte
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('invoices')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'invoices' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'invoices' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'invoices' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <FileText size={17} />
                  <span>Invoices &amp; Billing</span>
                </button>

                <button
                  onClick={() => setActiveTab('billing-run')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'billing-run' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'billing-run' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'billing-run' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <Zap size={17} />
                  <span>Billing Day Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'payments' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'payments' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'payments' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <CreditCard size={17} />
                  <span>Payments Register</span>
                </button>

                <button
                  onClick={() => setActiveTab('overdue-chaser')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'overdue-chaser' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'overdue-chaser' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'overdue-chaser' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertOctagon size={17} />
                    <span>Overdue Chaser</span>
                  </div>
                  {overdueCount > 0 && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: '#EF4444',
                      color: '#FFFFFF',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                    }}>
                      {overdueCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Catalog & Configuration */}
            <div>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                padding: '0 0.75rem 0.5rem',
              }}>
                Catalog &amp; Packaging
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'products' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'products' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'products' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <Package size={17} />
                  <span>Products &amp; Variants</span>
                </button>

                <button
                  onClick={() => setActiveTab('plans')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'plans' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'plans' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'plans' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <CalendarDays size={17} />
                  <span>Subscription Plans</span>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'templates' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'templates' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'templates' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <FileCheck2 size={17} />
                  <span>Quotation Templates</span>
                </button>
              </div>
            </div>

            {/* Administration Rules */}
            <div>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                padding: '0 0.75rem 0.5rem',
              }}>
                Admin Controls {isAdmin ? '' : '(Restricted)'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  onClick={() => setActiveTab('discounts-taxes')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'discounts-taxes' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'discounts-taxes' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: activeTab === 'discounts-taxes' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  }}
                >
                  <Percent size={17} />
                  <span>Taxes &amp; Discounts</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('staff-management')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: activeTab === 'staff-management' ? 'var(--primary-gradient)' : 'transparent',
                      color: activeTab === 'staff-management' ? '#FFFFFF' : 'var(--text-secondary)',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: activeTab === 'staff-management' ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                    }}
                  >
                    <UserCheck size={17} />
                    <span>Staff Management</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer / System Status */}
      <div style={{
        padding: '0.875rem',
        background: 'rgba(14, 20, 36, 0.7)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        marginTop: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981',
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Engine Status: Operational
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Sub-2s response SLA active
        </div>
      </div>
    </aside>
  );
};
