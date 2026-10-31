import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionLine,
  PaymentTerms,
} from '../../types';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Play,
  Pause,
  XCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  DollarSign,
  Tag,
  Building,
} from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    plans,
    products,
    quotationTemplates,
    users,
    taxRules,
    currentUser,
    createSubscription,
    updateSubscriptionStatus,
    renewSubscription,
    simulatedDate,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for New Quote / Subscription
  const [useTemplate, setUseTemplate] = useState<string>('');
  const [formCustomerId, setFormCustomerId] = useState<string>(users.find((u) => u.role === 'customer')?.id || '');
  const [formPlanId, setFormPlanId] = useState<string>(plans[0]?.id || '');
  const [formPaymentTerms, setFormPaymentTerms] = useState<PaymentTerms>('Net 30');
  const [formStartDate, setFormStartDate] = useState<string>(simulatedDate);
  const [formValidityDays, setFormValidityDays] = useState<number>(14);
  const [formStatus, setFormStatus] = useState<SubscriptionStatus>('quotation');
  const [formLines, setFormLines] = useState<SubscriptionLine[]>([
    {
      id: 'line-init',
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      productType: products[0]?.type || 'software',
      variantId: products[0]?.variants[0]?.id,
      variantName: products[0]?.variants[0]?.name,
      quantity: 1,
      unitPrice: (products[0]?.salesPrice || 100) + (products[0]?.variants[0]?.priceModifier || 0),
      taxRate: 20,
      discountRate: 0,
      amount: (products[0]?.salesPrice || 100) + (products[0]?.variants[0]?.priceModifier || 0),
    },
  ]);

  // Handle template selection to auto-populate lines and plan
  const handleTemplateChange = (templateId: string) => {
    setUseTemplate(templateId);
    if (!templateId) return;

    const tmpl = quotationTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;

    setFormPlanId(tmpl.defaultPlanId);
    setFormValidityDays(tmpl.validityDays);

    const generatedLines: SubscriptionLine[] = tmpl.lines.map((tLine, idx) => {
      const prod = products.find((p) => p.id === tLine.productId);
      const variant = prod?.variants.find((v) => v.id === tLine.variantId);
      const unitPrice = (prod?.salesPrice || 0) + (variant?.priceModifier || 0);
      const discount = tLine.discountPercent || 0;
      const amount = tLine.quantity * unitPrice * (1 - discount / 100);

      return {
        id: `tmpl-line-${idx}-${Date.now()}`,
        productId: prod?.id || '',
        productName: prod?.name || 'Product',
        productType: prod?.type || 'software',
        variantId: variant?.id,
        variantName: variant?.name,
        quantity: tLine.quantity,
        unitPrice,
        taxRate: 20,
        discountRate: discount,
        amount: Math.round(amount * 100) / 100,
      };
    });

    setFormLines(generatedLines);
  };

  const handleAddLine = () => {
    const prod = products[0];
    const unitPrice = (prod?.salesPrice || 100) + (prod?.variants[0]?.priceModifier || 0);
    setFormLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        productId: prod?.id || '',
        productName: prod?.name || '',
        productType: prod?.type || 'software',
        variantId: prod?.variants[0]?.id,
        variantName: prod?.variants[0]?.name,
        quantity: 1,
        unitPrice,
        taxRate: 20,
        discountRate: 0,
        amount: unitPrice,
      },
    ]);
  };

  const handleUpdateLine = (index: number, updates: Partial<SubscriptionLine>) => {
    setFormLines((prev) => {
      const copy = [...prev];
      const cur = copy[index];

      let newProdId = updates.productId !== undefined ? updates.productId : cur.productId;
      let newVariantId = updates.variantId !== undefined ? updates.variantId : cur.variantId;
      let newQty = updates.quantity !== undefined ? updates.quantity : cur.quantity;
      let newDisc = updates.discountRate !== undefined ? updates.discountRate : cur.discountRate;

      const prod = products.find((p) => p.id === newProdId);
      const variant = prod?.variants.find((v) => v.id === newVariantId);
      const unitPrice = (prod?.salesPrice || 0) + (variant?.priceModifier || 0);
      const amount = Math.round(newQty * unitPrice * (1 - newDisc / 100) * 100) / 100;

      copy[index] = {
        ...cur,
        ...updates,
        productId: newProdId,
        productName: prod?.name || cur.productName,
        productType: prod?.type || cur.productType,
        variantId: variant?.id,
        variantName: variant?.name,
        unitPrice,
        quantity: newQty,
        discountRate: newDisc,
        amount,
      };
      return copy;
    });
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) return;
    setFormLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveQuoteOrSub = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = users.find((u) => u.id === formCustomerId);
    const plan = plans.find((p) => p.id === formPlanId);

    // Compute expiry date based on plan or 1 year default
    const startDateObj = new Date(formStartDate);
    const expiryDateObj = new Date(formStartDate);
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);

    // If quotation, compute validUntil
    const validUntilObj = new Date(formStartDate);
    validUntilObj.setDate(validUntilObj.getDate() + formValidityDays);

    const created = createSubscription({
      customerId: customer?.id || 'cust-generic',
      customerName: customer?.name || 'Customer Account',
      customerEmail: customer?.email || 'customer@example.com',
      customerCompany: customer?.company || 'Business Co.',
      planId: plan?.id || plans[0]?.id,
      planName: plan?.name || plans[0]?.name,
      startDate: formStartDate,
      expiryDate: expiryDateObj.toISOString().split('T')[0],
      nextBillingDate: formStartDate,
      paymentTerms: formPaymentTerms,
      status: formStatus,
      quotationTemplateId: useTemplate || undefined,
      validUntil: formStatus === 'quotation' ? validUntilObj.toISOString().split('T')[0] : undefined,
      lines: formLines,
    });

    setIsModalOpen(false);
    setSelectedSub(created);
  };

  // Filtered subscriptions
  const filteredSubs = subscriptions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.subscriptionNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerCompany.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title & Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Subscriptions &amp; Quotations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Full lifecycle management: prepare sales quotes, confirm agreements, run recurring terms, and manage renewals.
          </p>
        </div>

        <button
          onClick={() => {
            setUseTemplate('');
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>New Quote / Subscription</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quote #, customer, company, or plan..."
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              width: '100%',
              outline: 'none',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          {['all', 'draft', 'quotation', 'confirmed', 'active', 'paused', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: statusFilter === st ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                color: statusFilter === st ? '#60A5FA' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Subscriptions List Table */}
      <div className="glass-panel">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subscription #</th>
                <th>Customer &amp; Company</th>
                <th>Plan &amp; Terms</th>
                <th>Term Window</th>
                <th>Next Billing</th>
                <th>Cycle Value</th>
                <th>Lifecycle Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No subscriptions or quotations match your criteria.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const plan = plans.find((p) => p.id === sub.planId);
                  return (
                    <tr
                      key={sub.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedSub(sub)}
                    >
                      <td>
                        <span style={{ fontWeight: 700, color: '#60A5FA' }}>
                          {sub.subscriptionNumber}
                        </span>
                        {sub.quotationTemplateId && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Template-based</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.customerCompany}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{sub.planName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Terms: {sub.paymentTerms}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{sub.startDate} &rarr; {sub.expiryDate}</div>
                        {sub.validUntil && sub.status === 'quotation' && (
                          <div style={{ fontSize: '0.7rem', color: '#FBBF24' }}>Valid through: {sub.validUntil}</div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                          {sub.nextBillingDate}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          ${sub.totalAmount.toLocaleString()}
                        </span>
                        {sub.discountTotal > 0 && (
                          <div style={{ fontSize: '0.65rem', color: '#34D399' }}>-${sub.discountTotal} disc</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${sub.status}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {/* DRAFT -> SEND QUOTATION */}
                          {sub.status === 'draft' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'quotation')}
                              className="btn btn-accent btn-sm"
                              title="Turn draft into formal customer quotation"
                            >
                              Send Quote
                            </button>
                          )}

                          {/* QUOTATION -> CONFIRM */}
                          {sub.status === 'quotation' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'confirmed', 'Customer confirmed quotation')}
                              className="btn btn-success btn-sm"
                              title="Confirm quote into agreement"
                            >
                              Confirm Quote
                            </button>
                          )}

                          {/* CONFIRMED -> ACTIVATE */}
                          {sub.status === 'confirmed' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'active', 'Subscription activated by team')}
                              className="btn btn-primary btn-sm"
                              title="Activate subscription and commence billing cycle"
                            >
                              Activate
                            </button>
                          )}

                          {/* ACTIVE -> PAUSE (checks plan policy) */}
                          {sub.status === 'active' && plan?.policy.allowPause && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'paused', 'Paused by operations')}
                              className="btn btn-secondary btn-sm"
                              title="Pause recurring billing"
                            >
                              <Pause size={13} />
                              <span>Pause</span>
                            </button>
                          )}

                          {/* PAUSED -> RESUME */}
                          {sub.status === 'paused' && (
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'active', 'Resumed from pause')}
                              className="btn btn-success btn-sm"
                              title="Resume subscription"
                            >
                              <Play size={13} />
                              <span>Resume</span>
                            </button>
                          )}

                          {/* RENEW */}
                          {sub.status === 'active' && plan?.policy.allowRenew && (
                            <button
                              onClick={() => renewSubscription(sub.id)}
                              className="btn btn-secondary btn-sm"
                              title="Extend subscription validity"
                            >
                              <RotateCcw size={13} />
                              <span>Renew</span>
                            </button>
                          )}

                          {/* EARLY CLOSE / CANCEL */}
                          {sub.status === 'active' && plan?.policy.allowEarlyClose && (
                            <button
                              onClick={() => {
                                if (window.confirm('Close this subscription early?')) {
                                  updateSubscriptionStatus(sub.id, 'closed', 'Closed early per client request');
                                }
                              }}
                              className="btn btn-danger btn-sm"
                              title="Close subscription early"
                            >
                              Close
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="btn btn-secondary btn-sm"
                          >
                            Details &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Details Drawer / Modal */}
      {selectedSub && (
        <div className="modal-backdrop" onClick={() => setSelectedSub(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {selectedSub.subscriptionNumber}
                  </h3>
                  <span className={`badge badge-${selectedSub.status}`}>
                    {selectedSub.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Customer: <strong>{selectedSub.customerName}</strong> ({selectedSub.customerCompany})
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan &amp; Terms</div>
                  <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{selectedSub.planName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Terms: {selectedSub.paymentTerms}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Billing</div>
                  <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{selectedSub.nextBillingDate}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expires: {selectedSub.expiryDate}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recurring Amount</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#60A5FA', marginTop: '0.25rem' }}>
                    ${selectedSub.totalAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Taxes: ${selectedSub.taxTotal}</div>
                </div>
              </div>

              {/* Product Lines Breakdown */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Contract Product Lines</h4>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Variant / Edition</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th style={{ textAlign: 'right' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSub.lines.map((line) => (
                        <tr key={line.id}>
                          <td style={{ fontWeight: 600 }}>{line.productName}</td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: line.variantName ? '#60A5FA' : 'var(--text-muted)' }}>
                              {line.variantName || 'Standard'}
                            </span>
                          </td>
                          <td>{line.quantity}</td>
                          <td>${line.unitPrice.toLocaleString()}</td>
                          <td>{line.discountRate > 0 ? `${line.discountRate}%` : '-'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            ${line.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit History Log */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lifecycle Audit History</h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                }}>
                  {selectedSub.history.map((hist, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderLeft: '2px solid #2563EB',
                        borderRadius: '0 6px 6px 0',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        <span>{hist.date} &bull; {hist.actor}</span>
                        <span style={{ fontWeight: 700, color: '#93C5FD' }}>{hist.action}</span>
                      </div>
                      {hist.notes && <div style={{ marginTop: '0.25rem', color: 'var(--text-main)' }}>{hist.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW QUOTE / SUBSCRIPTION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create Quote or Subscription</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Start from a predefined quotation template or configure customized line items
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveQuoteOrSub} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Template Quick Loader */}
              <div style={{
                padding: '0.875rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}>
                <label className="form-label" style={{ color: '#60A5FA' }}>
                  🚀 Start from Quotation Template (Optional)
                </label>
                <select
                  value={useTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Build Custom Quote From Scratch --</option>
                  {quotationTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Valid {t.validityDays} days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer & Plan Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Customer Account</label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.company || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subscription Plan</label>
                  <select
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.billingFrequency.toUpperCase()} &bull; Base ${p.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date, Payment Terms, Initial Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Terms</label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value as PaymentTerms)}
                    className="form-select"
                  >
                    <option value="Immediate">Immediate Payment</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial State</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as SubscriptionStatus)}
                    className="form-select"
                  >
                    <option value="quotation">Formal Quotation</option>
                    <option value="confirmed">Confirmed Agreement</option>
                    <option value="active">Active Subscription</option>
                    <option value="draft">Internal Draft</option>
                  </select>
                </div>
              </div>

              {/* Product Lines Configuration */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Contract Product Lines</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    <span>Add Line Item</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {formLines.map((line, idx) => {
                    const currentProd = products.find((p) => p.id === line.productId);
                    return (
                      <div
                        key={line.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          background: 'var(--bg-elevated)',
                          padding: '0.6rem',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        {/* Product Selector */}
                        <select
                          value={line.productId}
                          onChange={(e) => handleUpdateLine(idx, { productId: e.target.value, variantId: undefined })}
                          className="form-select"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.salesPrice})
                            </option>
                          ))}
                        </select>

                        {/* Variant Selector (Supports Odoo brand variant!) */}
                        <select
                          value={line.variantId || ''}
                          onChange={(e) => handleUpdateLine(idx, { variantId: e.target.value || undefined })}
                          className="form-select"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        >
                          <option value="">Standard Edition (+$0)</option>
                          {currentProd?.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} (+${v.priceModifier})
                            </option>
                          ))}
                        </select>

                        {/* Qty */}
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleUpdateLine(idx, { quantity: parseInt(e.target.value) || 1 })}
                          className="form-input"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                          title="Quantity"
                        />

                        {/* Discount % */}
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.discountRate}
                          onChange={(e) => handleUpdateLine(idx, { discountRate: parseFloat(e.target.value) || 0 })}
                          className="form-input"
                          placeholder="Disc %"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                          title="Discount %"
                        />

                        {/* Line Total */}
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'right' }}>
                          ${line.amount.toLocaleString()}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.2rem' }}
                          title="Remove Line"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Calculation */}
              <div style={{
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total Lines: {formLines.length} &bull; Tax: Standard 20%
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Cycle Amount</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
                    ${(formLines.reduce((acc, l) => acc + l.amount, 0) * 1.2).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  Create {formStatus === 'quotation' ? 'Quotation' : 'Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
