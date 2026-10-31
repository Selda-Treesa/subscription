import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  BellRing,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Check,
  Gauge,
} from 'lucide-react';

export const AutomationCenterView: React.FC = () => {
  const { subscriptions, invoices, plans, currentUser } = useApp();

  const active = subscriptions.filter((sub) => sub.status === 'active').length;
  const dueSoon = subscriptions.filter((sub) => {
    if (sub.status !== 'active') return false;
    const due = new Date(sub.nextBillingDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;

  const overdue = invoices.filter((invoice) => invoice.isOverdue).length;
  const avgDiscount = plans.length
    ? Math.round((plans.reduce((sum, plan) => sum + plan.basePrice, 0) / plans.length) * 100) / 100
    : 0;

  const flows = [
    {
      title: 'Smart renewal nudges',
      description: 'Notify customers before renewal and offer swaps using usage patterns.',
      enabled: true,
      value: `${active} active contracts`,
      accent: '#818CF8',
    },
    {
      title: 'Collections risk guardrail',
      description: 'Escalate unpaid balances when invoices age beyond the payment terms.',
      enabled: true,
      value: `${overdue} overdue accounts`,
      accent: '#F59E0B',
    },
    {
      title: 'Savings / upsell suggestions',
      description: 'Recommend product bundles and plan upgrades based on customer usage.',
      enabled: false,
      value: `Avg plan: $${avgDiscount.toLocaleString()}`,
      accent: '#34D399',
    },
  ];

  const tasks = [
    {
      label: 'Review auto-retry rules for invoices due in 7 days',
      status: 'Ready',
      tone: '#60A5FA',
    },
    {
      label: 'Launch cross-sell campaign for enterprise users',
      status: 'Queued',
      tone: '#34D399',
    },
    {
      label: 'Escalate VIP accounts with repeated failed payments',
      status: 'Action needed',
      tone: '#F59E0B',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(129, 140, 248, 0.2)', color: '#A5B4FC' }}>
              <Sparkles size={18} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Automation Center</h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Specialised workflows for renewals, billing protection and expansion opportunities.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem 1rem', minWidth: '230px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Operator
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem' }}>{currentUser.name}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Renewals due</span>
            <BellRing size={16} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{dueSoon}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>within next 7 days</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Retention score</span>
            <TrendingUp size={16} color="#34D399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>92%</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>healthy customer momentum</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Risk coverage</span>
            <ShieldCheck size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{overdue}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>accounts flagged for follow-up</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {flows.map((flow) => (
          <div key={flow.title} className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '12px', background: `${flow.accent}2f`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Gauge size={18} color={flow.accent} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: flow.enabled ? 'rgba(52, 211, 153, 0.12)' : 'rgba(148, 163, 184, 0.14)', border: `1px solid ${flow.enabled ? 'rgba(52, 211, 153, 0.4)' : 'rgba(148, 163, 184, 0.28)'}`, padding: '0.3rem 0.55rem', borderRadius: '999px', color: flow.enabled ? '#A7F3D0' : 'var(--text-muted)' }}>
                {flow.enabled ? <Check size={14} /> : null}
                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{flow.enabled ? 'Enabled' : 'Paused'}</span>
              </div>
            </div>

            <h3 style={{ margin: '1rem 0 0.4rem', fontSize: '1.05rem', fontWeight: 700 }}>{flow.title}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.82rem' }}>{flow.description}</p>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: '#FFF', fontWeight: 700, fontSize: '0.83rem' }}>{flow.value}</span>
              <button className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>Review</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Workflow queue</h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Priority actions for the next billing cycle.</p>
          </div>
          <button className="btn btn-primary btn-sm">Run playbook</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {tasks.map((task) => (
            <div key={task.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{task.label}</div>
              <span style={{ background: `${task.tone}22`, color: task.tone, borderRadius: '999px', padding: '0.3rem 0.65rem', fontWeight: 700, fontSize: '0.7rem' }}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
