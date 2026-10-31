import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plan, BillingFrequency } from '../../types';
import {
  CalendarDays,
  Plus,
  Repeat,
  Check,
  X,
  Edit2,
  Trash2,
  Clock,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';

export const PlansView: React.FC = () => {
  const { plans, addPlan, updatePlan, deletePlan, currentUser, simulatedDate } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFrequency, setFormFrequency] = useState<BillingFrequency>('monthly');
  const [formBasePrice, setFormBasePrice] = useState<number>(100);
  const [formMinQuantity, setFormMinQuantity] = useState<number>(1);
  const [formStartDate, setFormStartDate] = useState<string>(simulatedDate);
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formAutoClose, setFormAutoClose] = useState<boolean>(false);
  const [formAllowEarlyClose, setFormAllowEarlyClose] = useState<boolean>(true);
  const [formAllowPause, setFormAllowPause] = useState<boolean>(true);
  const [formAllowRenew, setFormAllowRenew] = useState<boolean>(true);

  const handleOpenNew = () => {
    setEditingPlan(null);
    setFormName('');
    setFormDesc('');
    setFormFrequency('monthly');
    setFormBasePrice(250);
    setFormMinQuantity(1);
    setFormStartDate(simulatedDate);
    setFormEndDate('');
    setFormAutoClose(false);
    setFormAllowEarlyClose(true);
    setFormAllowPause(true);
    setFormAllowRenew(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormDesc(plan.description);
    setFormFrequency(plan.billingFrequency);
    setFormBasePrice(plan.basePrice);
    setFormMinQuantity(plan.minQuantity);
    setFormStartDate(plan.startDate);
    setFormEndDate(plan.endDate || '');
    setFormAutoClose(plan.policy.autoCloseOnEnd);
    setFormAllowEarlyClose(plan.policy.allowEarlyClose);
    setFormAllowPause(plan.policy.allowPause);
    setFormAllowRenew(plan.policy.allowRenew);
    setIsModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();

    const policy = {
      autoCloseOnEnd: formAutoClose,
      allowEarlyClose: formAllowEarlyClose,
      allowPause: formAllowPause,
      allowRenew: formAllowRenew,
    };

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name: formName,
        description: formDesc,
        billingFrequency: formFrequency,
        basePrice: formBasePrice,
        minQuantity: formMinQuantity,
        startDate: formStartDate,
        endDate: formEndDate ? formEndDate : null,
        policy,
      });
    } else {
      addPlan({
        name: formName,
        description: formDesc,
        billingFrequency: formFrequency,
        basePrice: formBasePrice,
        minQuantity: formMinQuantity,
        startDate: formStartDate,
        endDate: formEndDate ? formEndDate : null,
        policy,
        status: 'active',
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Subscription Plans</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Configure billing cadences (daily, weekly, monthly, yearly), minimum seat counts, availability windows, and lifecycle policies (pause, renew, auto-close).
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button onClick={handleOpenNew} className="btn btn-primary">
            <Plus size={16} />
            <span>Launch New Plan</span>
          </button>
        )}
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-panel"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background:
                    plan.billingFrequency === 'yearly'
                      ? 'rgba(20, 184, 166, 0.2)'
                      : plan.billingFrequency === 'monthly'
                      ? 'rgba(59, 130, 246, 0.2)'
                      : plan.billingFrequency === 'weekly'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(245, 158, 11, 0.2)',
                  color:
                    plan.billingFrequency === 'yearly'
                      ? '#5EEAD4'
                      : plan.billingFrequency === 'monthly'
                      ? '#60A5FA'
                      : plan.billingFrequency === 'weekly'
                      ? '#34D399'
                      : '#FBBF24',
                  border: '1px solid var(--border-medium)',
                }}>
                  {plan.billingFrequency} Billing
                </span>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF' }}>
                    ${plan.basePrice}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    /{plan.billingFrequency === 'daily' ? 'day' : plan.billingFrequency === 'weekly' ? 'wk' : plan.billingFrequency === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '36px', lineHeight: 1.4 }}>
                {plan.description}
              </p>

              {/* Terms & Dates Box */}
              <div style={{
                background: 'var(--bg-elevated)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.78rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Min. Quantity:</span>{' '}
                  <strong style={{ color: '#FFF' }}>{plan.minQuantity} seat(s)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Available:</span>{' '}
                  <strong style={{ color: '#FFF' }}>{plan.startDate}</strong>
                </div>
                {plan.endDate && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Expires/Closes:</span>{' '}
                    <strong style={{ color: '#F87171' }}>{plan.endDate}</strong>
                  </div>
                )}
              </div>

              {/* Plan Policies Matrix (Admin-configured per prompt) */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                  Admin Lifecycle Policies:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: plan.policy.autoCloseOnEnd ? '#F87171' : 'var(--text-muted)' }}>
                    {plan.policy.autoCloseOnEnd ? <Check size={14} color="#F87171" /> : <X size={14} />} Auto-Close on End
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: plan.policy.allowEarlyClose ? '#34D399' : 'var(--text-muted)' }}>
                    {plan.policy.allowEarlyClose ? <Check size={14} color="#34D399" /> : <X size={14} />} Early Cancel Allowed
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: plan.policy.allowPause ? '#FBBF24' : 'var(--text-muted)' }}>
                    {plan.policy.allowPause ? <Check size={14} color="#FBBF24" /> : <X size={14} />} Pause Allowed
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: plan.policy.allowRenew ? '#34D399' : 'var(--text-muted)' }}>
                    {plan.policy.allowRenew ? <Check size={14} color="#34D399" /> : <X size={14} />} Renewal Allowed
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {currentUser.role === 'admin' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem' }}>
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit2 size={13} />
                  <span>Configure</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete plan ${plan.name}?`)) {
                      deletePlan(plan.id);
                    }
                  }}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PLAN CONFIGURATION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {editingPlan ? 'Configure Subscription Plan' : 'Launch New Subscription Plan'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Set pricing, billing frequency, minimum quantity, availability and lifecycle rules
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePlan} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Enterprise Monthly Growth"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Plan Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe target audience and key inclusions..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Billing Frequency</label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as BillingFrequency)}
                    className="form-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min. Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMinQuantity}
                    onChange={(e) => setFormMinQuantity(parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Available From (Start Date)</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Until (End Date - Optional)</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Policy Checkboxes (Crucial requirement from prompt) */}
              <div style={{
                background: 'var(--bg-elevated)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase' }}>
                  Plan Policy Rules (Decided Plan by Plan):
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#FFF', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formAutoClose}
                    onChange={(e) => setFormAutoClose(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Auto-close on end date: Subscription automatically moves to Closed when availability terminates.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#FFF', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formAllowEarlyClose}
                    onChange={(e) => setFormAllowEarlyClose(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Allow early closure / cancellation before term expires.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#FFF', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formAllowPause}
                    onChange={(e) => setFormAllowPause(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Allow pausing &amp; resuming subscription.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#FFF', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formAllowRenew}
                    onChange={(e) => setFormAllowRenew(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Allow renewal for next contract cycle.</span>
                </label>
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
                  className="btn btn-primary"
                >
                  {editingPlan ? 'Save Plan Settings' : 'Deploy Subscription Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
