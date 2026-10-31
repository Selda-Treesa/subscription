import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuotationTemplate, QuotationTemplateLine } from '../../types';
import {
  FileCheck2,
  Plus,
  Clock,
  Sparkles,
  Layers,
  Edit2,
  Trash2,
  ArrowRight,
  Repeat,
} from 'lucide-react';

interface QuotationTemplatesViewProps {
  onStartQuoteFromTemplate?: (templateId: string) => void;
}

export const QuotationTemplatesView: React.FC<QuotationTemplatesViewProps> = ({
  onStartQuoteFromTemplate,
}) => {
  const {
    quotationTemplates,
    plans,
    products,
    addQuotationTemplate,
    updateQuotationTemplate,
    deleteQuotationTemplate,
    currentUser,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuotationTemplate | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPlanId, setFormPlanId] = useState(plans[0]?.id || '');
  const [formValidityDays, setFormValidityDays] = useState(14);
  const [formDescription, setFormDescription] = useState('');
  const [formLines, setFormLines] = useState<QuotationTemplateLine[]>([
    {
      productId: products[0]?.id || '',
      variantId: products[0]?.variants[0]?.id,
      quantity: 1,
      discountPercent: 0,
    },
  ]);

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormPlanId(plans[0]?.id || '');
    setFormValidityDays(14);
    setFormDescription('');
    setFormLines([
      {
        productId: products[0]?.id || '',
        variantId: products[0]?.variants[0]?.id,
        quantity: 2,
        discountPercent: 0,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tmpl: QuotationTemplate) => {
    setEditingTemplate(tmpl);
    setFormName(tmpl.name);
    setFormPlanId(tmpl.defaultPlanId);
    setFormValidityDays(tmpl.validityDays);
    setFormDescription(tmpl.description);
    setFormLines(tmpl.lines || []);
    setIsModalOpen(true);
  };

  const handleAddLine = () => {
    const p = products[0];
    setFormLines((prev) => [
      ...prev,
      {
        productId: p?.id || '',
        variantId: p?.variants[0]?.id,
        quantity: 1,
        discountPercent: 0,
      },
    ]);
  };

  const handleUpdateLine = (index: number, updates: Partial<QuotationTemplateLine>) => {
    setFormLines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveLine = (index: number) => {
    setFormLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateQuotationTemplate(editingTemplate.id, {
        name: formName,
        defaultPlanId: formPlanId,
        validityDays: formValidityDays,
        description: formDescription,
        lines: formLines,
      });
    } else {
      addQuotationTemplate({
        name: formName,
        defaultPlanId: formPlanId,
        validityDays: formValidityDays,
        description: formDescription,
        lines: formLines,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Quotation Templates</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Pre-assembled commercial packages with default plans, product bundles, brand variants, and validity windows for instant sales proposals.
          </p>
        </div>

        {currentUser.role !== 'customer' && (
          <button onClick={handleOpenNew} className="btn btn-primary">
            <Plus size={16} />
            <span>New Quotation Template</span>
          </button>
        )}
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {quotationTemplates.map((tmpl) => {
          const plan = plans.find((p) => p.id === tmpl.defaultPlanId);
          return (
            <div key={tmpl.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818CF8', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Clock size={14} />
                    <span>Valid for {tmpl.validityDays} Days</span>
                  </div>
                  {plan && (
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', fontWeight: 600 }}>
                      {plan.name}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  {tmpl.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '38px', lineHeight: 1.4 }}>
                  {tmpl.description}
                </p>

                {/* Preconfigured Product Lines */}
                <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Bundled Products &amp; Variants ({tmpl.lines.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {tmpl.lines.map((l, idx) => {
                      const prod = products.find((p) => p.id === l.productId);
                      const variant = prod?.variants.find((v) => v.id === l.variantId);
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                          <span style={{ color: '#FFF' }}>
                            {l.quantity}x {prod?.name || 'Product'}{' '}
                            {variant && <span style={{ color: '#818CF8' }}>({variant.name})</span>}
                          </span>
                          <span style={{ color: l.discountPercent > 0 ? '#34D399' : 'var(--text-muted)' }}>
                            {l.discountPercent > 0 ? `${l.discountPercent}% off` : 'Standard'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleOpenEdit(tmpl)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete template ${tmpl.name}?`)) {
                        deleteQuotationTemplate(tmpl.id);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {onStartQuoteFromTemplate && (
                  <button
                    onClick={() => onStartQuoteFromTemplate(tmpl.id)}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Use Template &rarr;</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT TEMPLATE MODAL */}
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
                  {editingTemplate ? 'Edit Quotation Template' : 'New Quotation Template'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Set default plan, proposal validity duration and pre-filled product lines
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Template Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Standard SaaS Growth Bundle"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Default Plan</label>
                  <select
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value)}
                    className="form-select"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.billingFrequency})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quote Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formValidityDays}
                    onChange={(e) => setFormValidityDays(parseInt(e.target.value) || 14)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Notes on what this quote template includes..."
                  className="form-textarea"
                />
              </div>

              {/* Preconfigured Lines */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Predefined Product Lines</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    <span>Add Product</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formLines.map((line, idx) => {
                    const currentProd = products.find((p) => p.id === line.productId);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 2fr 1fr 1fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          background: 'var(--bg-elevated)',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <select
                          value={line.productId}
                          onChange={(e) => handleUpdateLine(idx, { productId: e.target.value, variantId: undefined })}
                          className="form-select"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        <select
                          value={line.variantId || ''}
                          onChange={(e) => handleUpdateLine(idx, { variantId: e.target.value || undefined })}
                          className="form-select"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        >
                          <option value="">Standard Edition</option>
                          {currentProd?.variants.map((v) => (
                            <option key={v.id} value={v.id}>{v.name} (+${v.priceModifier})</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleUpdateLine(idx, { quantity: parseInt(e.target.value) || 1 })}
                          className="form-input"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                          title="Quantity"
                        />

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.discountPercent}
                          onChange={(e) => handleUpdateLine(idx, { discountPercent: parseFloat(e.target.value) || 0 })}
                          className="form-input"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                          placeholder="Disc %"
                          title="Discount %"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
