import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subscription, Invoice } from '../../types';
import {
  User,
  Repeat,
  FileText,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Printer,
  DollarSign,
  Lock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const CustomerPortalView: React.FC = () => {
  const {
    currentUser,
    subscriptions,
    invoices,
    products,
    plans,
    updateSubscriptionStatus,
    toggleSubscriptionAddon,
    renewSubscription,
    recordPayment,
    resetPassword,
    simulatedDate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'security'>('subscriptions');
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Bank Transfer' | 'Stripe'>('Credit Card');
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Security tab state
  const [newPassword, setNewPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter subscriptions and invoices belonging to currentUser
  const mySubscriptions = subscriptions.filter((s) => s.customerId === currentUser.id);
  const myInvoices = invoices.filter((i) => i.customerId === currentUser.id);

  // Add-ons list
  const availableAddons = products.filter((p) => p.isAddon);

  // Password validation checks
  const isLenValid = newPassword.length > 8;
  const isUpperValid = /[A-Z]/.test(newPassword);
  const isLowerValid = /[a-z]/.test(newPassword);
  const isSpecialValid = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const isPasswordValid = isLenValid && isUpperValid && isLowerValid && isSpecialValid;

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    recordPayment({
      invoiceId: payingInvoice.id,
      invoiceNumber: payingInvoice.invoiceNumber,
      customerId: currentUser.id,
      customerName: currentUser.name,
      amount: payingInvoice.amountDue,
      paymentDate: simulatedDate,
      paymentMethod,
      reference: `PORTAL-PAY-${Date.now().toString().slice(-6)}`,
      notes: `Instant self-service checkout via Customer Portal (${paymentMethod})`,
      recordedBy: `${currentUser.name} (Customer)`,
    });

    setPaySuccessMsg(`Invoice ${payingInvoice.invoiceNumber} paid in full! Receipt generated.`);
    setPayingInvoice(null);
    setTimeout(() => setPaySuccessMsg(null), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    if (!isPasswordValid) {
      setSecurityMsg({ type: 'error', text: 'Password must satisfy all Brightloop complexity rules.' });
      return;
    }
    const res = resetPassword(currentUser.email, newPassword);
    if (res.success) {
      setSecurityMsg({ type: 'success', text: 'Your password was successfully updated.' });
      setNewPassword('');
    } else {
      setSecurityMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Customer Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(22, 31, 51, 0.85) 0%, rgba(14, 20, 36, 0.95) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #818CF8' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentUser.name}</h1>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontWeight: 700 }}>
                Verified Customer
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {currentUser.company} &bull; {currentUser.email}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(11, 15, 25, 0.8)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('subscriptions')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'subscriptions' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'subscriptions' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            My Subscriptions ({mySubscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'invoices' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'invoices' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            Invoices &amp; Receipts ({myInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'security' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'security' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            Account &amp; Security
          </button>
        </div>
      </div>

      {/* Payment Success Alert */}
      {paySuccessMsg && (
        <div style={{
          padding: '1rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          color: '#34D399',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
        }}>
          <CheckCircle2 size={20} />
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {/* MY SUBSCRIPTIONS TAB */}
      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {mySubscriptions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No Active Subscriptions Found</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Contact Brightloop sales to activate your enterprise package or request a quote.
              </p>
            </div>
          ) : (
            mySubscriptions.map((sub) => {
              const plan = plans.find((p) => p.id === sub.planId);
              return (
                <div key={sub.id} className="glass-panel" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#818CF8' }}>
                          {sub.subscriptionNumber}
                        </span>
                        <span className={`badge badge-${sub.status}`}>
                          {sub.status}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
                        {sub.planName}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Billing Period: {sub.startDate} through {sub.expiryDate} &bull; Next automatic billing:{' '}
                        <strong style={{ color: '#FFF' }}>{sub.nextBillingDate}</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cycle Cost</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF' }}>
                        ${sub.totalAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Includes taxes &amp; active discounts
                      </div>
                    </div>
                  </div>

                  {/* Contract Lines */}
                  <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Active Software Licenses &amp; Services:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {sub.lines.map((line) => (
                        <div key={line.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ fontWeight: 600, color: '#FFF' }}>
                              {line.quantity}x {line.productName}
                            </span>
                            {line.variantName && (
                              <span style={{ marginLeft: '0.5rem', color: '#818CF8', fontSize: '0.75rem' }}>
                                ({line.variantName})
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 700 }}>
                            ${line.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Self-Service Add-on Switchboard */}
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Sparkles size={18} color="#818CF8" />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                        Self-Service Add-on Switchboard (Instant Activation)
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Switch additional enterprise services and connectors on or off in real-time. Charges will automatically reflect on your next billing statement.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.875rem' }}>
                      {availableAddons.map((addon) => {
                        const isEnabled = sub.lines.some((l) => l.productId === addon.id);
                        return (
                          <div
                            key={addon.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.875rem',
                              background: 'var(--bg-card-solid)',
                              borderRadius: 'var(--radius-md)',
                              border: isEnabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{addon.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ${addon.salesPrice}/mo
                              </div>
                            </div>

                            <button
                              onClick={() => toggleSubscriptionAddon(sub.id, addon.id, !isEnabled)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                background: isEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                color: isEnabled ? '#34D399' : 'var(--text-muted)',
                              }}
                            >
                              {isEnabled ? '● Active' : '○ Disabled'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Plan Policy Controls (Pause, Renew, Close per plan rules) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '1rem',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Managed via plan policy: {plan?.name}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* PAUSE / RESUME */}
                      {sub.status === 'active' && plan?.policy.allowPause && (
                        <button
                          onClick={() => updateSubscriptionStatus(sub.id, 'paused', 'Customer self-service pause')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Pause size={14} />
                          <span>Pause Subscription</span>
                        </button>
                      )}

                      {sub.status === 'paused' && (
                        <button
                          onClick={() => updateSubscriptionStatus(sub.id, 'active', 'Customer self-service resume')}
                          className="btn btn-success btn-sm"
                        >
                          <Play size={14} />
                          <span>Resume Subscription</span>
                        </button>
                      )}

                      {/* RENEW */}
                      {sub.status === 'active' && plan?.policy.allowRenew && (
                        <button
                          onClick={() => renewSubscription(sub.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <RotateCcw size={14} />
                          <span>Renew for Next Cycle</span>
                        </button>
                      )}

                      {/* EARLY CLOSE */}
                      {sub.status === 'active' && plan?.policy.allowEarlyClose && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you wish to cancel this subscription early?')) {
                              updateSubscriptionStatus(sub.id, 'closed', 'Customer requested early cancellation');
                            }
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={14} />
                          <span>Cancel Subscription</span>
                        </button>
                      )}

                      {/* If policy disallows early close */}
                      {sub.status === 'active' && plan && !plan.policy.allowEarlyClose && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <ShieldCheck size={14} color="#818CF8" /> Annual Contract (Early cancellation not permitted)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MY INVOICES & PAYMENTS TAB */}
      {activeTab === 'invoices' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Invoices &amp; Payment Receipts
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Review past statements, settle open balances, and print official VAT receipts.
          </p>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Billing Period</th>
                  <th>Total Amount</th>
                  <th>Amount Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No invoices currently issued to your account.
                    </td>
                  </tr>
                ) : (
                  myInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, color: '#818CF8' }}>{inv.invoiceNumber}</td>
                      <td>{inv.issueDate}</td>
                      <td>
                        <span style={{ color: inv.isOverdue ? '#F87171' : 'var(--text-main)', fontWeight: inv.isOverdue ? 700 : 500 }}>
                          {inv.dueDate} {inv.isOverdue && '⚠️ Overdue'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{inv.periodStart} &rarr; {inv.periodEnd}</td>
                      <td style={{ fontWeight: 700 }}>${inv.totalAmount.toLocaleString()}</td>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          color: inv.amountDue > 0 ? (inv.isOverdue ? '#F87171' : '#FBBF24') : '#34D399',
                        }}>
                          ${inv.amountDue.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${inv.status}`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {inv.amountDue > 0 && inv.status !== 'cancelled' && (
                            <button
                              onClick={() => setPayingInvoice(inv)}
                              className="btn btn-primary btn-sm"
                            >
                              <DollarSign size={13} />
                              <span>Pay Now</span>
                            </button>
                          )}
                          <button
                            onClick={() => window.print()}
                            className="btn btn-secondary btn-sm"
                            title="Print invoice receipt"
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECURITY & PASSWORD TAB */}
      {activeTab === 'security' && (
        <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '580px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Account Security &amp; Credentials
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Change your password. Brightloop enforces high security standards across all customer portals.
          </p>

          {securityMsg && (
            <div style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              background: securityMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${securityMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: securityMsg.type === 'success' ? '#34D399' : '#F87171',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}>
              {securityMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              {/* Password Checklist */}
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
                  {isLenValid ? '✓' : '○'} More than 8 characters
                </div>
                <div style={{ color: isUpperValid ? '#34D399' : 'var(--text-muted)' }}>
                  {isUpperValid ? '✓' : '○'} Uppercase letter (A-Z)
                </div>
                <div style={{ color: isLowerValid ? '#34D399' : 'var(--text-muted)' }}>
                  {isLowerValid ? '✓' : '○'} Lowercase letter (a-z)
                </div>
                <div style={{ color: isSpecialValid ? '#34D399' : 'var(--text-muted)' }}>
                  {isSpecialValid ? '✓' : '○'} Special character (!@#$)
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isPasswordValid}
              className="btn btn-primary"
              style={{ opacity: isPasswordValid ? 1 : 0.6 }}
            >
              Update Security Password
            </button>
          </form>
        </div>
      )}

      {/* PAY NOW CHECKOUT MODAL */}
      {payingInvoice && (
        <div className="modal-backdrop" onClick={() => setPayingInvoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pay Invoice</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {payingInvoice.invoiceNumber} &bull; Total Due: ${payingInvoice.amountDue.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePayNow} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'var(--bg-elevated)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount to Charge</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34D399' }}>
                    ${payingInvoice.amountDue.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Due: {payingInvoice.dueDate}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="form-select"
                >
                  <option value="Credit Card">Instant Credit Card (Visa / Mastercard)</option>
                  <option value="Stripe">Stripe Checkout Gateway</option>
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder / Remitter Name</label>
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Card Number (Mock Sandbox)</label>
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expires</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Pay ${payingInvoice.amountDue.toLocaleString()} Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
