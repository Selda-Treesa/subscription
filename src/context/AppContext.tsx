import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Product,
  Plan,
  QuotationTemplate,
  Subscription,
  SubscriptionStatus,
  TaxRule,
  DiscountRule,
  Invoice,
  InvoiceStatus,
  Payment,
  BillingRunLog,
  PaymentTerms,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_QUOTATION_TEMPLATES,
  INITIAL_TAX_RULES,
  INITIAL_DISCOUNT_RULES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_BILLING_LOGS,
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  users: User[];
  products: Product[];
  plans: Plan[];
  quotationTemplates: QuotationTemplate[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  taxRules: TaxRule[];
  discountRules: DiscountRule[];
  billingLogs: BillingRunLog[];
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;
  // Auth
  switchUser: (userId: string) => void;
  login: (email: string, password: string) => { success: boolean; message: string; user?: User };
  signup: (name: string, email: string, password: string, company: string) => { success: boolean; message: string; user?: User };
  requestPasswordReset: (email: string) => { success: boolean; resetLink?: string; message: string };
  resetPassword: (email: string, newPassword: string) => { success: boolean; message: string };
  addStaffMember: (name: string, email: string, password: string, company?: string) => { success: boolean; message: string };
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Plans
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  // Quotation Templates
  addQuotationTemplate: (tmpl: Omit<QuotationTemplate, 'id'>) => void;
  updateQuotationTemplate: (id: string, tmpl: Partial<QuotationTemplate>) => void;
  deleteQuotationTemplate: (id: string) => void;
  // Subscriptions & Quotes
  createSubscription: (subData: Partial<Subscription>) => Subscription;
  updateSubscriptionStatus: (id: string, newStatus: SubscriptionStatus, notes?: string) => { success: boolean; message: string };
  toggleSubscriptionAddon: (subscriptionId: string, addonProductId: string, enable: boolean) => void;
  renewSubscription: (id: string) => { success: boolean; message: string };
  // Billing Engine
  runBillingDay: (targetDate?: string) => { count: number; totalAmount: number; invoiceNumbers: string[]; message: string };
  // Invoices
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  cancelInvoice: (id: string) => void;
  sendInvoice: (id: string) => void;
  chaseOverdueInvoice: (id: string, reminderNote?: string) => { success: boolean; message: string };
  // Payments
  recordPayment: (payment: Omit<Payment, 'id' | 'paymentNumber'>) => Payment;
  // Taxes & Discounts
  addTaxRule: (tax: Omit<TaxRule, 'id'>) => void;
  updateTaxRule: (id: string, tax: Partial<TaxRule>) => void;
  deleteTaxRule: (id: string) => void;
  addDiscountRule: (discount: Omit<DiscountRule, 'id' | 'usedCount'>) => void;
  updateDiscountRule: (id: string, discount: Partial<DiscountRule>) => void;
  deleteDiscountRule: (id: string) => void;
  // Reset
  resetToMockData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'brightloop_current_user_v1',
  USERS: 'brightloop_users_v1',
  PRODUCTS: 'brightloop_products_v1',
  PLANS: 'brightloop_plans_v1',
  TEMPLATES: 'brightloop_templates_v1',
  SUBSCRIPTIONS: 'brightloop_subscriptions_v1',
  INVOICES: 'brightloop_invoices_v1',
  PAYMENTS: 'brightloop_payments_v1',
  TAXES: 'brightloop_taxes_v1',
  DISCOUNTS: 'brightloop_discounts_v1',
  BILLING_LOGS: 'brightloop_billing_logs_v1',
  SIM_DATE: 'brightloop_sim_date_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or fallback to initial mock data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) return JSON.parse(saved);
    return INITIAL_USERS[0]; // Admin by default
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [quotationTemplates, setQuotationTemplates] = useState<QuotationTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return saved ? JSON.parse(saved) : INITIAL_QUOTATION_TEMPLATES;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [taxRules, setTaxRules] = useState<TaxRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAXES);
    return saved ? JSON.parse(saved) : INITIAL_TAX_RULES;
  });

  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_DISCOUNT_RULES;
  });

  const [billingLogs, setBillingLogs] = useState<BillingRunLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLING_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_BILLING_LOGS;
  });

  const [simulatedDate, setSimulatedDate] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIM_DATE);
    return saved || '2026-11-01'; // Default billing test date
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(quotationTemplates));
  }, [quotationTemplates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAXES, JSON.stringify(taxRules));
  }, [taxRules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(discountRules));
  }, [discountRules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLING_LOGS, JSON.stringify(billingLogs));
  }, [billingLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIM_DATE, simulatedDate);
  }, [simulatedDate]);

  // Check and update overdue status dynamically whenever simulatedDate or invoices change
  useEffect(() => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.status === 'paid' || inv.status === 'cancelled') {
          return inv.isOverdue ? { ...inv, isOverdue: false } : inv;
        }
        const isPastDue = new Date(inv.dueDate) < new Date(simulatedDate) && inv.amountDue > 0;
        if (inv.isOverdue !== isPastDue) {
          return { ...inv, isOverdue: isPastDue };
        }
        return inv;
      })
    );
  }, [simulatedDate]);

  // Auth Helpers
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const validatePasswordComplexity = (password: string): { valid: boolean; reason?: string } => {
    if (password.length <= 8) {
      return { valid: false, reason: 'Password must be more than 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one special character (!@#$%^&*).' };
    }
    return { valid: true };
  };

  const signup = (name: string, email: string, password: string, company: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return { success: false, message: 'Each email can belong to only one account. This email is already registered.' };
    }

    const check = validatePasswordComplexity(password);
    if (!check.valid) {
      return { success: false, message: check.reason || 'Invalid password.' };
    }

    const newUser: User = {
      id: `user-cust-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role: 'customer',
      password,
      company: company.trim() || 'Independent Business',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: 'Account created successfully! Welcome to Brightloop.', user: newUser };
  };

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, message: 'No account found with this email address.' };
    }
    if (found.password && found.password !== password) {
      return { success: false, message: 'Incorrect password entered.' };
    }
    setCurrentUser(found);
    return { success: true, message: `Welcome back, ${found.name}!`, user: found };
  };

  const requestPasswordReset = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, message: 'No account registered under this email.' };
    }
    const token = Math.random().toString(36).substring(2, 10);
    const resetLink = `https://portal.brightloop.io/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;
    return {
      success: true,
      resetLink,
      message: `Password reset instructions and secure link dispatched to ${found.email}.`,
    };
  };

  const resetPassword = (email: string, newPassword: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const check = validatePasswordComplexity(newPassword);
    if (!check.valid) {
      return { success: false, message: check.reason || 'Invalid password.' };
    }

    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, message: 'User not found.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.email.toLowerCase() === normalizedEmail ? { ...u, password: newPassword } : u))
    );
    return { success: true, message: 'Password has been updated securely. You can now log in.' };
  };

  const addStaffMember = (name: string, email: string, password: string, company?: string) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Permission Denied: Only the Admin can add a new member of staff.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const check = validatePasswordComplexity(password);
    if (!check.valid) {
      return { success: false, message: check.reason || 'Password requirements not met.' };
    }

    const newStaff: User = {
      id: `user-staff-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role: 'staff',
      password,
      company: company?.trim() || 'Brightloop Internal Team',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newStaff]);
    return { success: true, message: `Staff member ${newStaff.name} has been added successfully.` };
  };

  // Product Operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...productData } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Plan Operations
  const addPlan = (planData: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setPlans((prev) => [...prev, newPlan]);
  };

  const updatePlan = (id: string, planData: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...planData } : p)));
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Quotation Templates
  const addQuotationTemplate = (tmpl: Omit<QuotationTemplate, 'id'>) => {
    const newTmpl: QuotationTemplate = {
      ...tmpl,
      id: `tmpl-${Date.now()}`,
    };
    setQuotationTemplates((prev) => [...prev, newTmpl]);
  };

  const updateQuotationTemplate = (id: string, tmpl: Partial<QuotationTemplate>) => {
    setQuotationTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...tmpl } : t)));
  };

  const deleteQuotationTemplate = (id: string) => {
    setQuotationTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper date adder for billing intervals
  const advanceBillingDate = (currentDateStr: string, frequency: Plan['billingFrequency']): string => {
    const date = new Date(currentDateStr);
    if (isNaN(date.getTime())) return currentDateStr;

    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  // Subscriptions & Quotes
  const createSubscription = (subData: Partial<Subscription>): Subscription => {
    const subNum = `SUB-${new Date().getFullYear()}-${String(subscriptions.length + 101).padStart(4, '0')}`;
    const lines = subData.lines || [];
    const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
    const taxTotal = lines.reduce((sum, line) => sum + (line.amount * line.taxRate) / 100, 0);
    const discountTotal = lines.reduce((sum, line) => sum + (line.unitPrice * line.quantity * line.discountRate) / 100, 0);
    const totalAmount = subtotal + taxTotal;

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      subscriptionNumber: subNum,
      customerId: subData.customerId || currentUser.id,
      customerName: subData.customerName || currentUser.name,
      customerEmail: subData.customerEmail || currentUser.email,
      customerCompany: subData.customerCompany || currentUser.company || 'Enterprise Client',
      planId: subData.planId || plans[0]?.id || '',
      planName: subData.planName || plans[0]?.name || '',
      startDate: subData.startDate || simulatedDate,
      expiryDate: subData.expiryDate || advanceBillingDate(simulatedDate, 'yearly'),
      nextBillingDate: subData.nextBillingDate || simulatedDate,
      lastBilledDate: null,
      paymentTerms: (subData.paymentTerms as PaymentTerms) || 'Net 30',
      status: subData.status || 'draft',
      quotationTemplateId: subData.quotationTemplateId,
      validUntil: subData.validUntil,
      lines,
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      appliedDiscountCode: subData.appliedDiscountCode,
      history: [
        {
          date: simulatedDate,
          action: `Created as ${subData.status || 'Draft'}`,
          actor: currentUser.name,
          notes: subData.status === 'quotation' ? 'Sales proposal prepared for client' : 'Initial record generated',
        },
      ],
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    return newSub;
  };

  const updateSubscriptionStatus = (id: string, newStatus: SubscriptionStatus, notes?: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return { success: false, message: 'Subscription not found' };

    const plan = plans.find((p) => p.id === sub.planId);

    // Plan policy validations:
    if (newStatus === 'paused' && plan && !plan.policy.allowPause) {
      return { success: false, message: `The '${plan.name}' plan policy does not allow pausing.` };
    }
    if (newStatus === 'closed' && plan && !plan.policy.allowEarlyClose && sub.status === 'active') {
      const isEnded = new Date(sub.expiryDate) <= new Date(simulatedDate);
      if (!isEnded) {
        return { success: false, message: `The '${plan.name}' plan does not allow early closure prior to contract expiry.` };
      }
    }

    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: newStatus,
          history: [
            ...s.history,
            {
              date: simulatedDate,
              action: `Status changed to ${newStatus.toUpperCase()}`,
              actor: currentUser.name,
              notes: notes || `Transitioned from ${s.status} to ${newStatus}`,
            },
          ],
        };
      })
    );

    return { success: true, message: `Subscription ${sub.subscriptionNumber} is now ${newStatus.toUpperCase()}.` };
  };

  const renewSubscription = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return { success: false, message: 'Subscription not found' };

    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.policy.allowRenew) {
      return { success: false, message: `The '${plan.name}' plan does not permit automatic renewal.` };
    }

    const freq = plan?.billingFrequency || 'monthly';
    const newExpiry = advanceBillingDate(sub.expiryDate, freq);

    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          expiryDate: newExpiry,
          status: 'active',
          history: [
            ...s.history,
            {
              date: simulatedDate,
              action: 'Renewed',
              actor: currentUser.name,
              notes: `Subscription renewed through ${newExpiry}`,
            },
          ],
        };
      })
    );

    return { success: true, message: `Subscription ${sub.subscriptionNumber} renewed through ${newExpiry}!` };
  };

  const toggleSubscriptionAddon = (subscriptionId: string, addonProductId: string, enable: boolean) => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    const addon = products.find((p) => p.id === addonProductId);
    if (!addon) return;

    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== subscriptionId) return s;

        let newLines = [...s.lines];
        if (enable) {
          const alreadyExists = newLines.some((l) => l.productId === addonProductId);
          if (!alreadyExists) {
            newLines.push({
              id: `line-${Date.now()}`,
              productId: addon.id,
              productName: addon.name,
              productType: addon.type,
              quantity: 1,
              unitPrice: addon.salesPrice,
              taxRate: 20,
              discountRate: 0,
              amount: addon.salesPrice,
            });
          }
        } else {
          newLines = newLines.filter((l) => l.productId !== addonProductId);
        }

        const subtotal = newLines.reduce((sum, line) => sum + line.amount, 0);
        const taxTotal = newLines.reduce((sum, line) => sum + (line.amount * line.taxRate) / 100, 0);
        const discountTotal = newLines.reduce((sum, line) => sum + (line.unitPrice * line.quantity * line.discountRate) / 100, 0);
        const totalAmount = subtotal + taxTotal;

        return {
          ...s,
          lines: newLines,
          subtotal: Math.round(subtotal * 100) / 100,
          taxTotal: Math.round(taxTotal * 100) / 100,
          discountTotal: Math.round(discountTotal * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          history: [
            ...s.history,
            {
              date: simulatedDate,
              action: enable ? `Add-on Enabled: ${addon.name}` : `Add-on Removed: ${addon.name}`,
              actor: currentUser.name,
            },
          ],
        };
      })
    );
  };

  // Automated Billing Day Engine
  const runBillingDay = (targetDate?: string) => {
    const runDate = targetDate || simulatedDate;
    const targetDateObj = new Date(runDate);

    // Eligible subscriptions: must be 'active' and nextBillingDate <= targetDate
    const dueSubscriptions = subscriptions.filter((sub) => {
      if (sub.status !== 'active') return false;
      const nextDate = new Date(sub.nextBillingDate);
      return nextDate <= targetDateObj;
    });

    const newInvoices: Invoice[] = [];
    const updatedSubs: Subscription[] = [];
    let totalBilled = 0;

    // Default tax rule
    const defaultTax = taxRules.find((t) => t.isDefault && t.active) || taxRules[0] || { rate: 20, name: 'VAT' };

    dueSubscriptions.forEach((sub) => {
      // Prompt requirement: "Nothing should be billed twice or skipped."
      // Check if an invoice was already generated for this subscription covering the current period
      const plan = plans.find((p) => p.id === sub.planId);
      const freq = plan?.billingFrequency || 'monthly';
      const periodStart = sub.nextBillingDate;
      const periodEnd = advanceBillingDate(periodStart, freq);

      const alreadyBilled = invoices.some(
        (inv) =>
          inv.subscriptionId === sub.id &&
          (inv.periodStart === periodStart || inv.issueDate === runDate) &&
          inv.status !== 'cancelled'
      );

      if (alreadyBilled) {
        return; // Skip to prevent double-billing!
      }

      // Check applicable discount rules
      let appliedDiscount: DiscountRule | undefined;
      const totalUnits = sub.lines.reduce((acc, l) => acc + l.quantity, 0);

      // Look for active discount rules
      for (const disc of discountRules) {
        if (!disc.active) continue;
        if (disc.usedCount >= disc.maxUses) continue;
        const start = new Date(disc.startDate);
        const end = new Date(disc.endDate);
        if (targetDateObj < start || targetDateObj > end) continue;

        if (totalUnits >= disc.minQuantity && sub.subtotal >= disc.minPurchaseAmount) {
          appliedDiscount = disc;
          break;
        }
      }

      // Build invoice lines
      const invLines = sub.lines.map((sline) => {
        let lineDiscRate = sline.discountRate;
        let lineDiscAmount = 0;

        if (appliedDiscount) {
          if (appliedDiscount.scope === 'subscription' || appliedDiscount.applicableProductIds.includes(sline.productId)) {
            if (appliedDiscount.type === 'percentage') {
              lineDiscRate = Math.max(lineDiscRate, appliedDiscount.value);
            }
          }
        }

        const baseTotal = sline.unitPrice * sline.quantity;
        lineDiscAmount = (baseTotal * lineDiscRate) / 100;
        const lineAfterDisc = baseTotal - lineDiscAmount;
        const taxRate = sline.taxRate || defaultTax.rate;
        const taxAmount = (lineAfterDisc * taxRate) / 100;

        return {
          id: `iline-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: sline.productId,
          productName: sline.productName,
          variantName: sline.variantName,
          quantity: sline.quantity,
          unitPrice: sline.unitPrice,
          taxRate,
          taxAmount: Math.round(taxAmount * 100) / 100,
          discountRate: lineDiscRate,
          discountAmount: Math.round(lineDiscAmount * 100) / 100,
          amount: Math.round(lineAfterDisc * 100) / 100,
        };
      });

      const subtotal = invLines.reduce((sum, l) => sum + l.amount, 0);
      const taxTotal = invLines.reduce((sum, l) => sum + l.taxAmount, 0);
      const discountTotal = invLines.reduce((sum, l) => sum + l.discountAmount, 0);
      const totalAmount = Math.round((subtotal + taxTotal) * 100) / 100;

      // Compute due date based on payment terms
      let daysToAdd = 30;
      if (sub.paymentTerms === 'Immediate') daysToAdd = 0;
      else if (sub.paymentTerms === 'Net 15') daysToAdd = 15;
      else if (sub.paymentTerms === 'Net 60') daysToAdd = 60;

      const dueDateObj = new Date(runDate);
      dueDateObj.setDate(dueDateObj.getDate() + daysToAdd);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      const invNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + newInvoices.length + 1).padStart(4, '0')}`;

      const newInv: Invoice = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        invoiceNumber: invNumber,
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerEmail: sub.customerEmail,
        customerCompany: sub.customerCompany,
        customerAddress: 'Primary Corporate Headquarters',
        issueDate: runDate,
        dueDate,
        paymentTerms: sub.paymentTerms,
        periodStart,
        periodEnd,
        lines: invLines,
        subtotal: Math.round(subtotal * 100) / 100,
        taxTotal: Math.round(taxTotal * 100) / 100,
        discountTotal: Math.round(discountTotal * 100) / 100,
        totalAmount,
        amountPaid: 0,
        amountDue: totalAmount,
        status: 'confirmed',
        isOverdue: false,
        chaseCount: 0,
        deliveryStatus: 'sent',
      };

      newInvoices.push(newInv);
      totalBilled += totalAmount;

      // Advance next billing date and update last billed date
      const nextBilling = advanceBillingDate(periodEnd, freq);
      updatedSubs.push({
        ...sub,
        lastBilledDate: runDate,
        nextBillingDate: nextBilling,
        history: [
          ...sub.history,
          {
            date: runDate,
            action: 'Automated Invoice Generated',
            actor: 'Brightloop Recurring Billing Engine',
            notes: `Generated ${invNumber} for ${freq} cycle (${periodStart} to ${periodEnd})`,
          },
        ],
      });

      // Increment discount usage if applied
      if (appliedDiscount) {
        setDiscountRules((prev) =>
          prev.map((d) => (d.id === appliedDiscount?.id ? { ...d, usedCount: d.usedCount + 1 } : d))
        );
      }
    });

    // Commit changes
    if (newInvoices.length > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);

      setSubscriptions((prev) =>
        prev.map((s) => {
          const updated = updatedSubs.find((u) => u.id === s.id);
          return updated || s;
        })
      );
    }

    const logEntry: BillingRunLog = {
      id: `run-${Date.now()}`,
      runDate: `${runDate} ${new Date().toLocaleTimeString()}`,
      simulatedTargetDate: runDate,
      processedCount: dueSubscriptions.length,
      invoicesGenerated: newInvoices.length,
      totalBilledAmount: Math.round(totalBilled * 100) / 100,
      status: 'completed',
      generatedInvoiceNumbers: newInvoices.map((i) => i.invoiceNumber),
      details:
        newInvoices.length > 0
          ? `Processed ${dueSubscriptions.length} due subscriptions. Created ${newInvoices.length} invoices totalling $${totalBilled.toLocaleString()}. Zero duplicate billings.`
          : `Checked ${dueSubscriptions.length} subscriptions. No invoices needed (already billed or none due).`,
    };

    setBillingLogs((prev) => [logEntry, ...prev]);

    return {
      count: newInvoices.length,
      totalAmount: totalBilled,
      invoiceNumbers: newInvoices.map((i) => i.invoiceNumber),
      message: logEntry.details,
    };
  };

  // Invoice Actions
  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status, isOverdue: status === 'paid' ? false : inv.isOverdue } : inv))
    );
  };

  const cancelInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'cancelled', isOverdue: false } : inv))
    );
  };

  const sendInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, deliveryStatus: 'sent' } : inv))
    );
  };

  const chaseOverdueInvoice = (id: string, reminderNote?: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return { success: false, message: 'Invoice not found' };

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              chaseCount: i.chaseCount + 1,
              lastChasedAt: simulatedDate,
              deliveryStatus: 'sent',
            }
          : i
      )
    );

    return {
      success: true,
      message: `Payment chase reminder #${inv.chaseCount + 1} sent to ${inv.customerEmail} (${inv.customerName}) for $${inv.amountDue.toFixed(2)}.`,
    };
  };

  // Payments Recording
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'paymentNumber'>): Payment => {
    const payNum = `PAY-${new Date().getFullYear()}-${String(payments.length + 101).padStart(4, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      paymentNumber: payNum,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update target invoice balance
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== paymentData.invoiceId) return inv;

        const newPaid = Math.min(inv.totalAmount, inv.amountPaid + paymentData.amount);
        const newDue = Math.max(0, inv.totalAmount - newPaid);
        const newStatus: InvoiceStatus = newDue <= 0 ? 'paid' : 'partially_paid';

        return {
          ...inv,
          amountPaid: Math.round(newPaid * 100) / 100,
          amountDue: Math.round(newDue * 100) / 100,
          status: newStatus,
          isOverdue: newDue <= 0 ? false : inv.isOverdue,
        };
      })
    );

    return newPayment;
  };

  // Tax Rules
  const addTaxRule = (tax: Omit<TaxRule, 'id'>) => {
    const newTax: TaxRule = { ...tax, id: `tax-${Date.now()}` };
    setTaxRules((prev) => [...prev, newTax]);
  };

  const updateTaxRule = (id: string, tax: Partial<TaxRule>) => {
    setTaxRules((prev) => prev.map((t) => (t.id === id ? { ...t, ...tax } : t)));
  };

  const deleteTaxRule = (id: string) => {
    setTaxRules((prev) => prev.filter((t) => t.id !== id));
  };

  // Discount Rules
  const addDiscountRule = (discount: Omit<DiscountRule, 'id' | 'usedCount'>) => {
    const newDisc: DiscountRule = {
      ...discount,
      id: `disc-${Date.now()}`,
      usedCount: 0,
    };
    setDiscountRules((prev) => [...prev, newDisc]);
  };

  const updateDiscountRule = (id: string, discount: Partial<DiscountRule>) => {
    setDiscountRules((prev) => prev.map((d) => (d.id === id ? { ...d, ...discount } : d)));
  };

  const deleteDiscountRule = (id: string) => {
    setDiscountRules((prev) => prev.filter((d) => d.id !== id));
  };

  // Reset to initial mock dataset
  const resetToMockData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setPlans(INITIAL_PLANS);
    setQuotationTemplates(INITIAL_QUOTATION_TEMPLATES);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setTaxRules(INITIAL_TAX_RULES);
    setDiscountRules(INITIAL_DISCOUNT_RULES);
    setBillingLogs(INITIAL_BILLING_LOGS);
    setSimulatedDate('2026-11-01');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        plans,
        quotationTemplates,
        subscriptions,
        invoices,
        payments,
        taxRules,
        discountRules,
        billingLogs,
        simulatedDate,
        setSimulatedDate,
        switchUser,
        login,
        signup,
        requestPasswordReset,
        resetPassword,
        addStaffMember,
        addProduct,
        updateProduct,
        deleteProduct,
        addPlan,
        updatePlan,
        deletePlan,
        addQuotationTemplate,
        updateQuotationTemplate,
        deleteQuotationTemplate,
        createSubscription,
        updateSubscriptionStatus,
        toggleSubscriptionAddon,
        renewSubscription,
        runBillingDay,
        updateInvoiceStatus,
        cancelInvoice,
        sendInvoice,
        chaseOverdueInvoice,
        recordPayment,
        addTaxRule,
        updateTaxRule,
        deleteTaxRule,
        addDiscountRule,
        updateDiscountRule,
        deleteDiscountRule,
        resetToMockData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
