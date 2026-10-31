import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DiscountRule, TaxRule } from '../../types';
import {
  Percent,
  Plus,
  ShieldAlert,
  Tag,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DiscountsTaxesView: React.FC = () => {
  const {
    discountRules,
    taxRules,
    products,
    addDiscountRule,
    updateDiscountRule,
    deleteDiscountRule,
    addTaxRule,
    updateTaxRule,
    deleteTaxRule,
    currentUser,
    simulatedDate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'discounts' | 'taxes'>('discounts');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);

  // Discount Form State
  const [discName, setDiscName] = useState('');
  const [discCode, setDiscCode] = useState('');
  const [discType, setDiscType] = useState<'percentage' | 'fixed'>('percentage');
  const [discValue, setDiscValue] = useState<number>(10);
  const [discMinAmount, setDiscMinAmount] = useState<number>(200);
  const [discMinQty, setDiscMinQty] = useState<number>(5);
  const [discStart, setDiscStart] = useState<string>(simulatedDate);
  const [discEnd, setDiscEnd] = useState<string>('2026-12-31');
  const [discMaxUses, setDiscMaxUses] = useState<number>(50);
  const [discScope, setDiscScope] = useState<'subscription' | 'product'>('subscription');
  const [discApplicableProducts, setDiscApplicableProducts] = useState<string[]>([]);

  // Tax Form State
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState<number>(20);
  const [taxIsDefault, setTaxIsDefault] = useState(false);
  const [taxDesc, setTaxDesc] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleOpenNewDiscount = () => {
    setDiscName('');
    setDiscCode(`PROMO${Math.floor(10 + Math.random() * 90)}`);
    setDiscType('percentage');
    setDiscValue(15);
    setDiscMinAmount(250);
    setDiscMinQty(5);
    setDiscStart(simulatedDate);
    setDiscEnd('2026-12-31');
    setDiscMaxUses(50);
    setDiscScope('subscription');
    setDiscApplicableProducts([]);
    setIsDiscountModalOpen(true);
  };

  const handleOpenNewTax = () => {
    setTaxName('');
    setTaxRate(20);
    setTaxIsDefault(false);
    setTaxDesc('');
    setIsTaxModalOpen(true);
  };

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    addDiscountRule({
      name: discName,
      code: discCode.toUpperCase().trim(),
      type: discType,
      value: discValue,
      minPurchaseAmount: discMinAmount,
      minQuantity: discMinQty,
      startDate: discStart,
      endDate: discEnd,
      maxUses: discMaxUses,
      scope: discScope,
      applicableProductIds: discApplicableProducts,
      active: true,
    });
    setIsDiscountModalOpen(false);
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    addTaxRule({
      name: taxName,
      rate: taxRate,
      isDefault: taxIsDefault,
      active: true,
      description: taxDesc,
    });
    setIsTaxModalOpen(false);
  };

  const toggleProductInDiscount = (productId: string) => {
    setDiscApplicableProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Taxes &amp; Discount Rules Engine</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Admin controls for automated discount vouchers, volume seat triggers, usage ceilings, and tax rules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('discounts')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              background: activeTab === 'discounts' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'discounts' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            Discount Rules ({discountRules.length})
          </button>
          <button
            onClick={() => setActiveTab('taxes')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              background: activeTab === 'taxes' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'taxes' ? '#FFF' : 'var(--text-secondary)',
            }}
          >
            Tax Rates ({taxRules.length})
          </button>
        </div>
      </div>

      {/* Permission Check Notice if not admin */}
      {!isAdmin && (
        <div style={{
          padding: '0.875rem 1.25rem',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          color: '#FBBF24',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
        }}>
          <ShieldAlert size={20} />
          <span>
            <strong>Read-Only Mode:</strong> Only the System Administrator can create or configure discount and tax rules per Brightloop corporate governance.
          </span>
        </div>
      )}

      {/* DISCOUNT RULES TAB */}
      {activeTab === 'discounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Automated Discount Rules</h3>
            {isAdmin && (
              <button onClick={handleOpenNewDiscount} className="btn btn-primary btn-sm">
                <Plus size={14} />
                <span>Create Discount Rule</span>
              </button>
            )}
          </div>

          <div className="glass-panel">
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rule Code &amp; Name</th>
                    <th>Discount Value</th>
                    <th>Activation Conditions</th>
                    <th>Validity Period</th>
                    <th>Usage Limit &amp; Progress</th>
                    <th>Scope</th>
                    <th>Status</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {discountRules.map((disc) => {
                    const isExhausted = disc.usedCount >= disc.maxUses;
                    const isExpired = new Date(disc.endDate) < new Date(simulatedDate);
                    return (
                      <tr key={disc.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: '#60A5FA' }}>{disc.code}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{disc.name}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: '#34D399', fontSize: '0.95rem' }}>
                            {disc.type === 'percentage' ? `${disc.value}% off` : `$${disc.value} off`}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>
                            Min. {disc.minQuantity} seat(s)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Min. purchase ${disc.minPurchaseAmount}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>
                            {disc.startDate} &rarr; {disc.endDate}
                          </div>
                          {isExpired && (
                            <span style={{ fontSize: '0.65rem', color: '#EF4444', fontWeight: 700 }}>
                              EXPIRED
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {disc.usedCount} / {disc.maxUses} uses
                          </div>
                          <div style={{ height: '5px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden', marginTop: '0.25rem' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, (disc.usedCount / disc.maxUses) * 100)}%`,
                              background: isExhausted ? '#EF4444' : '#2563EB',
                            }} />
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: disc.scope === 'subscription' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(45, 212, 191, 0.15)',
                            color: disc.scope === 'subscription' ? '#93C5FD' : '#2DD4BF',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          }}>
                            {disc.scope}
                          </span>
                        </td>
                        <td>
                          <button
                            disabled={!isAdmin}
                            onClick={() => updateDiscountRule(disc.id, { active: !disc.active })}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: isAdmin ? 'pointer' : 'default',
                              color: disc.active ? '#34D399' : 'var(--text-muted)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {disc.active ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete discount rule ${disc.code}?`)) {
                                  deleteDiscountRule(disc.id);
                                }
                              }}
                              className="btn btn-danger btn-sm"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAX RULES TAB */}
      {activeTab === 'taxes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tax Calculations &amp; Fiscal Rates</h3>
            {isAdmin && (
              <button onClick={handleOpenNewTax} className="btn btn-primary btn-sm">
                <Plus size={14} />
                <span>Add Tax Rule</span>
              </button>
            )}
          </div>

          <div className="glass-panel">
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tax Rule Name</th>
                    <th>Rate (%)</th>
                    <th>Description</th>
                    <th>Default Application</th>
                    <th>Status</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {taxRules.map((tax) => (
                    <tr key={tax.id}>
                      <td style={{ fontWeight: 700 }}>{tax.name}</td>
                      <td>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {tax.rate}%
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {tax.description || 'Applies to eligible transactions'}
                      </td>
                      <td>
                        {tax.isDefault ? (
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontSize: '0.75rem', fontWeight: 700 }}>
                            Default Tax
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Regional / Optional</span>
                        )}
                      </td>
                      <td>
                        <button
                          disabled={!isAdmin}
                          onClick={() => updateTaxRule(tax.id, { active: !tax.active })}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: isAdmin ? 'pointer' : 'default',
                            color: tax.active ? '#34D399' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          {tax.active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete tax rule ${tax.name}?`)) {
                                deleteTaxRule(tax.id);
                              }
                            }}
                            className="btn btn-danger btn-sm"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE DISCOUNT RULE MODAL (Admin Only) */}
      {isDiscountModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDiscountModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create Promotional Discount Rule</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Auto-applied to recurring billing when minimum seat or purchase conditions are met
                </p>
              </div>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Discount Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    value={discCode}
                    onChange={(e) => setDiscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BULKSEATS15"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rule Display Name</label>
                  <input
                    type="text"
                    required
                    value={discName}
                    onChange={(e) => setDiscName(e.target.value)}
                    placeholder="e.g. Volume Seat Special"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Calculation Type</label>
                  <select
                    value={discType}
                    onChange={(e) => setDiscType(e.target.value as 'percentage' | 'fixed')}
                    className="form-select"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed Dollar Off ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value ({discType === 'percentage' ? '%' : '$'})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discValue}
                    onChange={(e) => setDiscValue(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Min. Seats / Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discMinQty}
                    onChange={(e) => setDiscMinQty(parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min. Order Total ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={discMinAmount}
                    onChange={(e) => setDiscMinAmount(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Uses Limit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discMaxUses}
                    onChange={(e) => setDiscMaxUses(parseInt(e.target.value) || 10)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    required
                    value={discStart}
                    onChange={(e) => setDiscStart(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date (Expiration)</label>
                  <input
                    type="date"
                    required
                    value={discEnd}
                    onChange={(e) => setDiscEnd(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Application Scope</label>
                <select
                  value={discScope}
                  onChange={(e) => setDiscScope(e.target.value as 'subscription' | 'product')}
                  className="form-select"
                >
                  <option value="subscription">Whole Subscription (All lines)</option>
                  <option value="product">Specific Products Only</option>
                </select>
              </div>

              {discScope === 'product' && (
                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Select Applicable Products:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {products.map((p) => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={discApplicableProducts.includes(p.id)}
                          onChange={() => toggleProductInDiscount(p.id)}
                        />
                        <span>{p.name} ({p.type})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Discount Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TAX RULE MODAL */}
      {isTaxModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTaxModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add Tax Rule</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Automate regional sales tax or VAT calculations across recurring invoices
                </p>
              </div>
              <button
                onClick={() => setIsTaxModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTax} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Tax Name</label>
                <input
                  type="text"
                  required
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder="e.g. California State Sales Tax"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Jurisdictions</label>
                <textarea
                  rows={2}
                  value={taxDesc}
                  onChange={(e) => setTaxDesc(e.target.value)}
                  placeholder="Applicable jurisdictions or exemption criteria..."
                  className="form-textarea"
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={taxIsDefault}
                  onChange={(e) => setTaxIsDefault(e.target.checked)}
                />
                <span>Set as Default System Tax for newly generated invoices</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsTaxModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
