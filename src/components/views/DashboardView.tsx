import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Repeat,
  DollarSign,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenBilling: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenBilling }) => {
  const { subscriptions, invoices, payments, plans, simulatedDate } = useApp();

  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');

  // Normalized MRR calculation
  const metrics = useMemo(() => {
    let activeSubs = subscriptions.filter((s) => s.status === 'active');

    if (filterPlan !== 'all') {
      activeSubs = activeSubs.filter((s) => s.planId === filterPlan);
    }
    if (filterCustomer !== 'all') {
      activeSubs = activeSubs.filter((s) => s.customerId === filterCustomer);
    }

    // Calculate MRR per subscription based on plan frequency
    let mrr = 0;
    activeSubs.forEach((sub) => {
      const plan = plans.find((p) => p.id === sub.planId);
      const freq = plan?.billingFrequency || 'monthly';
      const subTotal = sub.totalAmount;

      switch (freq) {
        case 'daily':
          mrr += subTotal * 30;
          break;
        case 'weekly':
          mrr += subTotal * 4.33;
          break;
        case 'monthly':
          mrr += subTotal;
          break;
        case 'yearly':
          mrr += subTotal / 12;
          break;
      }
    });

    const arr = mrr * 12;

    // Invoices metrics
    let filteredInvoices = invoices;
    if (filterCustomer !== 'all') {
      filteredInvoices = filteredInvoices.filter((i) => i.customerId === filterCustomer);
    }

    const totalInvoiced = filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalCollected = filteredInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
    const totalOutstanding = filteredInvoices.reduce((sum, i) => sum + (i.status !== 'cancelled' ? i.amountDue : 0), 0);

    const overdueInvoices = filteredInvoices.filter((i) => i.isOverdue);
    const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + i.amountDue, 0);

    // Aging analysis of unpaid invoices
    let agingCurrent = 0; // 0-30 days
    let aging30to60 = 0; // 31-60 days
    let aging60Plus = 0; // 61+ days

    const now = new Date(simulatedDate).getTime();
    filteredInvoices.forEach((inv) => {
      if (inv.amountDue > 0 && inv.status !== 'cancelled') {
        const dueTime = new Date(inv.dueDate).getTime();
        const diffDays = Math.floor((now - dueTime) / (1000 * 3600 * 24));
        if (diffDays <= 0) {
          agingCurrent += inv.amountDue;
        } else if (diffDays <= 30) {
          agingCurrent += inv.amountDue;
        } else if (diffDays <= 60) {
          aging30to60 += inv.amountDue;
        } else {
          aging60Plus += inv.amountDue;
        }
      }
    });

    return {
      activeSubsCount: activeSubs.length,
      totalSubsCount: subscriptions.length,
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      totalInvoiced: Math.round(totalInvoiced),
      totalCollected: Math.round(totalCollected),
      totalOutstanding: Math.round(totalOutstanding),
      overdueCount: overdueInvoices.length,
      totalOverdueAmount: Math.round(totalOverdueAmount),
      agingCurrent: Math.round(agingCurrent),
      aging30to60: Math.round(aging30to60),
      aging60Plus: Math.round(aging60Plus),
    };
  }, [subscriptions, invoices, plans, filterPlan, filterCustomer, simulatedDate]);

  // Unique customers for filter
  const customerList = useMemo(() => {
    const map = new Map<string, string>();
    subscriptions.forEach((s) => map.set(s.customerId, s.customerName));
    return Array.from(map.entries());
  }, [subscriptions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Top Banner & Quick Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Finance &amp; Executive Command Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time MRR, recurring receivables, cash flow and overdue collection telemetry as of{' '}
            <strong style={{ color: '#60A5FA' }}>{simulatedDate}</strong>.
          </p>
        </div>

        {/* Global Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-elevated)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Plan:</span>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-elevated)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Customer:</span>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Accounts</option>
              {customerList.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenBilling}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}
          >
            <Zap size={15} />
            <span>Simulate Billing Run</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem',
      }}>
        {/* MRR Card */}
        <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.15)',
            filter: 'blur(20px)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Monthly Recurring (MRR)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#60A5FA" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            ${metrics.mrr.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
            <ArrowUpRight size={14} />
            <span>ARR Run-rate: <strong>${metrics.arr.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Active Subscriptions
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Repeat size={16} color="#34D399" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            {metrics.activeSubsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            out of {metrics.totalSubsCount} total accounts on file
          </div>
        </div>

        {/* Total Collected Revenue Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Cash Collected
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#60A5FA" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            ${metrics.totalCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Matched to verified invoices
          </div>
        </div>

        {/* Outstanding Receivables Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Total Outstanding
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#FBBF24" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            ${metrics.totalOutstanding.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Across all pending and open terms
          </div>
        </div>

        {/* Overdue Alert Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            border: metrics.overdueCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : undefined,
            background: metrics.overdueCount > 0 ? 'rgba(35, 15, 20, 0.7)' : undefined,
            cursor: metrics.overdueCount > 0 ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (metrics.overdueCount > 0) onNavigate('overdue-chaser');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#F87171', letterSpacing: '0.05em' }}>
              Overdue Chasing Room
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#F87171" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F87171' }}>
            ${metrics.totalOverdueAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '0.35rem' }}>
            <strong>{metrics.overdueCount}</strong> overdue invoices require chasing &rarr;
          </div>
        </div>
      </div>

      {/* Two Column Layout: Accounts Receivable Aging & Subscriptions Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Receivables Aging Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Accounts Receivable Aging Schedule</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Analysis of outstanding receivables by due date buckets
              </p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="btn btn-secondary btn-sm"
            >
              <span>View All Invoices</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Current */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current (&lt; 30 Days)</span>
                <span style={{ fontWeight: 700, color: '#FFF' }}>${metrics.agingCurrent.toLocaleString()}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${metrics.totalOutstanding > 0 ? (metrics.agingCurrent / metrics.totalOutstanding) * 100 : 0}%`,
                  background: '#10B981',
                  borderRadius: '9999px',
                }} />
              </div>
            </div>

            {/* 31-60 Days */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>31 – 60 Days Overdue</span>
                <span style={{ fontWeight: 700, color: '#FBBF24' }}>${metrics.aging30to60.toLocaleString()}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${metrics.totalOutstanding > 0 ? (metrics.aging30to60 / metrics.totalOutstanding) * 100 : 0}%`,
                  background: '#F59E0B',
                  borderRadius: '9999px',
                }} />
              </div>
            </div>

            {/* 61+ Days */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>61+ Days Severe Overdue</span>
                <span style={{ fontWeight: 700, color: '#F87171' }}>${metrics.aging60Plus.toLocaleString()}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${metrics.totalOutstanding > 0 ? (metrics.aging60Plus / metrics.totalOutstanding) * 100 : 0}%`,
                  background: '#EF4444',
                  borderRadius: '9999px',
                }} />
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '0.875rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#FCA5A5' }}>
              Overdue accounts can be contacted with instant automated chase notices.
            </div>
            <button
              onClick={() => onNavigate('overdue-chaser')}
              className="btn btn-danger btn-sm"
            >
              <span>Open Chaser</span>
            </button>
          </div>
        </div>

        {/* Subscription Status Matrix */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Subscription Portfolio Status</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Lifecycle state breakdown across all registered contracts
              </p>
            </div>
            <button
              onClick={() => onNavigate('subscriptions')}
              className="btn btn-secondary btn-sm"
            >
              <span>Manage Subscriptions</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem' }}>
            <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Recurring
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {subscriptions.filter((s) => s.status === 'active').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Generating recurring revenue
              </div>
            </div>

            <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>
                Quotations Out
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {subscriptions.filter((s) => s.status === 'quotation').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Active sales rep proposals
              </div>
            </div>

            <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase' }}>
                Paused (On Hold)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {subscriptions.filter((s) => s.status === 'paused').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Billing temporarily paused
              </div>
            </div>

            <div style={{ padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 700, textTransform: 'uppercase' }}>
                Closed / Expired
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {subscriptions.filter((s) => s.status === 'closed').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Auto-closed or early cancelled
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table: Subscriptions due next */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Upcoming Subscription Renewals &amp; Billings</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Next recurring cycles sorted by due date
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subscription #</th>
                <th>Customer / Account</th>
                <th>Plan</th>
                <th>Next Billing Date</th>
                <th>Cycle Value</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.slice(0, 5).map((sub) => {
                const isDue = sub.status === 'active' && new Date(sub.nextBillingDate) <= new Date(simulatedDate);
                return (
                  <tr key={sub.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#60A5FA' }}>{sub.subscriptionNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.customerCompany}</div>
                    </td>
                    <td>{sub.planName}</td>
                    <td>
                      <span style={{
                        color: isDue ? '#F87171' : 'var(--text-main)',
                        fontWeight: isDue ? 700 : 500,
                      }}>
                        {sub.nextBillingDate} {isDue && '⚠️ (Due)'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ${sub.totalAmount.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${sub.status}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => onNavigate('subscriptions')}
                        className="btn btn-secondary btn-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
