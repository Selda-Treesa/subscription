import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductType, ProductVariant } from '../../types';
import {
  Package,
  Plus,
  Search,
  Tag,
  DollarSign,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<ProductType>('software');
  const [formSalesPrice, setFormSalesPrice] = useState<number>(100);
  const [formCostPrice, setFormCostPrice] = useState<number>(30);
  const [formNotes, setFormNotes] = useState('');
  const [formIsAddon, setFormIsAddon] = useState(false);
  const [formCategory, setFormCategory] = useState('Core Software');
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([
    {
      id: 'var-default',
      name: 'Standard Edition',
      attributeName: 'Brand',
      priceModifier: 0,
    },
    {
      id: 'var-odoo-demo',
      name: 'Odoo Brand Connector',
      attributeName: 'Brand',
      priceModifier: 560, // Prompt requirement: "where choosing the Odoo brand adds 560 to the price"
    },
  ]);

  const handleOpenNew = () => {
    setIsEditing(false);
    setFormName('');
    setFormType('software');
    setFormSalesPrice(250);
    setFormCostPrice(40);
    setFormNotes('');
    setFormIsAddon(false);
    setFormCategory('Core Software');
    setFormVariants([
      { id: 'v1', name: 'Standard Edition', attributeName: 'Brand', priceModifier: 0 },
      { id: 'v2', name: 'Odoo Brand Integration', attributeName: 'Brand', priceModifier: 560 },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setIsEditing(true);
    setSelectedProduct(p);
    setFormName(p.name);
    setFormType(p.type);
    setFormSalesPrice(p.salesPrice);
    setFormCostPrice(p.costPrice);
    setFormNotes(p.notes);
    setFormIsAddon(!!p.isAddon);
    setFormCategory(p.category || 'General');
    setFormVariants(p.variants || []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    setFormVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        name: 'New Brand Variant',
        attributeName: 'Brand',
        priceModifier: 100,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setFormVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && selectedProduct) {
      updateProduct(selectedProduct.id, {
        name: formName,
        type: formType,
        salesPrice: formSalesPrice,
        costPrice: formCostPrice,
        notes: formNotes,
        isAddon: formIsAddon,
        category: formCategory,
        variants: formVariants,
      });
    } else {
      addProduct({
        name: formName,
        type: formType,
        salesPrice: formSalesPrice,
        costPrice: formCostPrice,
        notes: formNotes,
        isAddon: formIsAddon,
        category: formCategory,
        status: 'active',
        variants: formVariants,
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Product Catalog &amp; Variants</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Configure software products, add-ons, services, and brand/edition variant price modifiers (e.g. Odoo brand +$560).
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button onClick={handleOpenNew} className="btn btn-primary">
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, type (software/add-on/service), or description..."
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
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filteredProducts.map((prod) => {
          const margin = prod.salesPrice > 0 ? Math.round(((prod.salesPrice - prod.costPrice) / prod.salesPrice) * 100) : 0;
          return (
            <div key={prod.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: prod.isAddon ? 'rgba(45, 212, 191, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: prod.isAddon ? '#2DD4BF' : '#60A5FA',
                      letterSpacing: '0.04em',
                    }}>
                      {prod.type} {prod.isAddon ? '• Customer Add-on' : ''}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.5rem' }}>
                      {prod.name}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '38px', lineHeight: 1.4 }}>
                  {prod.notes}
                </p>

                {/* Price & Margin Block */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base Price</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>${prod.salesPrice}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unit Cost</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>${prod.costPrice}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margin</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34D399' }}>{margin}%</div>
                  </div>
                </div>

                {/* Variants List */}
                {prod.variants && prod.variants.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Available Brand / Tier Variants ({prod.variants.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {prod.variants.map((v) => (
                        <div
                          key={v.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0.6rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                          }}
                        >
                          <span>{v.name} ({v.attributeName})</span>
                          <span style={{ fontWeight: 700, color: v.priceModifier > 0 ? '#60A5FA' : 'var(--text-muted)' }}>
                            {v.priceModifier > 0 ? `+$${v.priceModifier}` : 'Standard (+$0)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons (Admin only edit/delete) */}
              {currentUser.role === 'admin' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem' }}>
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit2 size={13} />
                    <span>Edit Product</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete product ${prod.name}?`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
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
                  {isEditing ? 'Edit Product & Brand Variants' : 'Add New Product & Variants'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Define pricing, product category, and brand price modifiers
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Brightloop Enterprise Connector"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ProductType)}
                    className="form-select"
                  >
                    <option value="software">Software License</option>
                    <option value="add-on">Add-on Feature</option>
                    <option value="service">Professional Service / SLA</option>
                    <option value="consumable">Consumable API / Usage</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Core Software, Add-ons, etc."
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Sales Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formSalesPrice}
                    onChange={(e) => setFormSalesPrice(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cost Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Notes &amp; Description</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes, specification, terms..."
                  className="form-textarea"
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
              }}>
                <input
                  type="checkbox"
                  id="isAddonCheck"
                  checked={formIsAddon}
                  onChange={(e) => setFormIsAddon(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isAddonCheck" style={{ fontSize: '0.85rem', color: '#FFF', cursor: 'pointer', fontWeight: 600 }}>
                  Enable as Customer Self-Service Add-on (allows customer to toggle on/off directly from portal)
                </label>
              </div>

              {/* Brand Variants Builder */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Product Variants (e.g. Brand: Odoo +560)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    <span>Add Variant</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formVariants.map((v, idx) => (
                    <div
                      key={v.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr auto',
                        gap: '0.5rem',
                        alignItems: 'center',
                        background: 'var(--bg-elevated)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(idx, { name: e.target.value })}
                        placeholder="Variant Name (e.g. Odoo Brand)"
                        className="form-input"
                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        value={v.attributeName}
                        onChange={(e) => handleUpdateVariant(idx, { attributeName: e.target.value })}
                        placeholder="Attribute (e.g. Brand)"
                        className="form-input"
                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+$</span>
                        <input
                          type="number"
                          value={v.priceModifier}
                          onChange={(e) => handleUpdateVariant(idx, { priceModifier: parseFloat(e.target.value) || 0 })}
                          placeholder="Modifier"
                          className="form-input"
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
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
                  {isEditing ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
