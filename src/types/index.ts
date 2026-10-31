export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  company?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export type ProductType = 'software' | 'service' | 'add-on' | 'consumable';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Standard Edition", "Odoo Brand Integration"
  attributeName: string; // e.g. "Brand", "Edition", "Hosting"
  priceModifier: number; // e.g. +560 for Odoo brand
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes: string;
  variants: ProductVariant[];
  isAddon?: boolean;
  status: 'active' | 'archived';
  category?: string;
}

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PlanPolicy {
  autoCloseOnEnd: boolean; // closes automatically when end date is reached
  allowEarlyClose: boolean; // can be cancelled/closed before end date
  allowPause: boolean; // can be paused and resumed
  allowRenew: boolean; // can be renewed
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  billingFrequency: BillingFrequency;
  basePrice: number;
  minQuantity: number;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD or null for indefinite
  policy: PlanPolicy;
  status: 'active' | 'archived';
}

export interface QuotationTemplateLine {
  productId: string;
  variantId?: string;
  quantity: number;
  discountPercent: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  defaultPlanId: string;
  validityDays: number;
  description: string;
  lines: QuotationTemplateLine[];
}

export type PaymentTerms = 'Immediate' | 'Net 15' | 'Net 30' | 'Net 60';

export type SubscriptionStatus = 'draft' | 'quotation' | 'confirmed' | 'active' | 'paused' | 'closed';

export interface SubscriptionLine {
  id: string;
  productId: string;
  productName: string;
  productType: ProductType;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number; // base salesPrice + variant priceModifier
  taxRate: number; // %
  discountRate: number; // %
  amount: number; // (quantity * unitPrice * (1 - discountRate/100))
}

export interface SubscriptionAudit {
  date: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string; // e.g. SUB-2026-0001
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  nextBillingDate: string;
  lastBilledDate: string | null;
  paymentTerms: PaymentTerms;
  status: SubscriptionStatus;
  lines: SubscriptionLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  appliedDiscountId?: string;
  appliedDiscountCode?: string;
  quotationTemplateId?: string;
  validUntil?: string; // for quotations
  history: SubscriptionAudit[];
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number; // % (e.g. 18 for 18%)
  isDefault: boolean;
  active: boolean;
  description?: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 50 for $50
  minPurchaseAmount: number;
  minQuantity: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  usedCount: number;
  scope: 'subscription' | 'product';
  applicableProductIds: string[];
  active: boolean;
}

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'partially_paid' | 'cancelled';

export interface InvoiceLine {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0001
  subscriptionId: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerAddress?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  periodStart: string;
  periodEnd: string;
  lines: InvoiceLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  isOverdue: boolean;
  chaseCount: number;
  lastChasedAt?: string;
  deliveryStatus: 'not_sent' | 'sent' | 'viewed';
}

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Stripe' | 'PayPal' | 'Cash / Check';

export interface Payment {
  id: string;
  paymentNumber: string; // e.g. PAY-2026-0001
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string;
  notes: string;
  recordedBy: string;
}

export interface BillingRunLog {
  id: string;
  runDate: string;
  simulatedTargetDate: string;
  processedCount: number;
  invoicesGenerated: number;
  totalBilledAmount: number;
  status: 'completed' | 'failed' | 'partial';
  generatedInvoiceNumbers: string[];
  details: string;
}
