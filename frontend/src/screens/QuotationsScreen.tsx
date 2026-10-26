import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { 
  FileText, Plus, Search, Download, Share2, 
  ArrowRight, Check, X, Printer, IndianRupee, Trash2, Eye
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Quotation, QuotationItem } from '../types';

export const QuotationsScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    quotations, 
    customers,
    addQuotation, 
    convertQuoteToInvoice, 
    setActiveScreen, 
    showSnackbar 
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);

  // New Quotation Form
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([
    { description: 'MythConnect CRM Enterprise Suite', quantity: 1, unit_price: 75000, discount_percent: 0, tax_rate: 18, total: 88500 }
  ]);

  const subtotal = items.reduce((acc, it) => acc + (it.quantity * it.unit_price), 0);
  const discountTotal = items.reduce((acc, it) => acc + ((it.quantity * it.unit_price * it.discount_percent) / 100), 0);
  const taxableAmount = subtotal - discountTotal;
  const gstTax = Math.round(taxableAmount * 0.18);
  const grandTotal = taxableAmount + gstTax;

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: 'Service Line Item', quantity: 1, unit_price: 15000, discount_percent: 0, tax_rate: 18, total: 17700 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSaveQuotation = () => {
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);

    const created = addQuotation({
      customer_id: 1,
      customer_name: customerName,
      customer_company: customerCompany,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      customer_gstin: customerGstin,
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: validUntilDate.toISOString().split('T')[0],
      subtotal,
      discount_amount: discountTotal,
      tax_amount: gstTax,
      grand_total: grandTotal,
      status: 'sent',
      notes: 'Payment terms: 50% advance, 50% upon deployment. 12 months SLA support included.',
      terms_and_conditions: 'Standard Indian GST applicable. Quotation valid for 30 calendar days.',
      items
    });

    setCreateModalOpen(false);
    showSnackbar(`Quotation #${created.quotation_number} generated!`, 'success');
  };

  const handleConvertToInvoice = (quoteId: number) => {
    const invoice = convertQuoteToInvoice(quoteId);
    showSnackbar(`Quotation converted to Invoice #${invoice.invoice_number}!`, 'success');
    setPreviewQuote(null);
    setActiveScreen('invoices');
  };

  const filteredQuotes = quotations.filter(q => 
    q.quotation_number.toLowerCase().includes(search.toLowerCase()) || 
    q.customer_company.toLowerCase().includes(search.toLowerCase()) ||
    q.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Page Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Quotations & Proposals</Text>
          <Text style={styles.pageSubtitle}>
            Commercial proposals, formal GST estimates, and contract conversion
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.newQuoteBtn} 
            onPress={() => setCreateModalOpen(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.newQuoteBtnText}>Create Quotation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quotation Table */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.5 }]}>QUOTE #</Text>
            <Text style={[styles.th, { flex: 2 }]}>CLIENT & COMPANY</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>DATE & VALIDITY</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>AMOUNT (INCL. GST)</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
            <Text style={[styles.th, { width: 140, textAlign: 'center' }]}>ACTIONS</Text>
          </View>

          {filteredQuotes.map(q => (
            <View key={q.id} style={styles.tableRow}>
              <View style={[styles.td, { flex: 1.5 }]}>
                <Text style={styles.quoteNo}>{q.quotation_number}</Text>
                <Text style={styles.itemsCount}>{q.items.length} line items</Text>
              </View>

              <View style={[styles.td, { flex: 2 }]}>
                <Text style={styles.clientName}>{q.customer_name}</Text>
                <Text style={styles.clientCompany}>{q.customer_company}</Text>
              </View>

              <View style={[styles.td, { flex: 1.2 }]}>
                <Text style={styles.quoteDate}>Date: {q.quotation_date}</Text>
                <Text style={styles.validUntil}>Valid: {q.valid_until}</Text>
              </View>

              <View style={[styles.td, { flex: 1.2, alignItems: 'flex-end' }]}>
                <Text style={styles.quoteAmount}>₹{q.grand_total.toLocaleString('en-IN')}</Text>
                <Text style={styles.taxSubtext}>Includes ₹{q.tax_amount.toLocaleString('en-IN')} GST</Text>
              </View>

              <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: q.status === 'accepted' ? BrandColors.greenLight : BrandColors.orangeLight }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: q.status === 'accepted' ? BrandColors.green : BrandColors.orange }
                  ]}>
                    {q.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.td, { width: 140, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => setPreviewQuote(q)}
                  title="Preview PDF Quote"
                >
                  <Eye size={16} color={BrandColors.blue} />
                </TouchableOpacity>

                {q.status !== 'accepted' && (
                  <TouchableOpacity 
                    style={styles.convertBtn}
                    onPress={() => handleConvertToInvoice(q.id)}
                    title="Convert to Formal Invoice"
                  >
                    <Text style={styles.convertBtnText}>Invoice</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Quotation Modal */}
      <Modal visible={isCreateModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Draft Formal Quotation</Text>
              <TouchableOpacity onPress={() => setCreateModalOpen(false)}>
                <X size={20} color={BrandColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Client Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={customerName}
                    onChangeText={setCustomerName}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Company Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={customerCompany}
                    onChangeText={setCustomerCompany}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.formInput}
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Client GSTIN</Text>
                  <TextInput
                    style={styles.formInput}
                    value={customerGstin}
                    onChangeText={setCustomerGstin}
                  />
                </View>
              </View>

              {/* Line Items Builder */}
              <View style={styles.lineItemsSection}>
                <View style={styles.lineItemsHeader}>
                  <Text style={styles.sectionTitle}>LINE ITEMS & PRICING</Text>
                  <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem}>
                    <Plus size={14} color={BrandColors.blue} />
                    <Text style={styles.addItemBtnText}>Add Item</Text>
                  </TouchableOpacity>
                </View>

                {items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.itemDescLabel}>Description</Text>
                      <TextInput
                        style={styles.itemDescInput}
                        value={item.description}
                        onChangeText={(txt) => {
                          const updated = [...items];
                          updated[idx].description = txt;
                          setItems(updated);
                        }}
                      />
                    </View>
                    <View style={{ width: 60 }}>
                      <Text style={styles.itemDescLabel}>Qty</Text>
                      <TextInput
                        style={styles.itemSmallInput}
                        value={String(item.quantity)}
                        onChangeText={(txt) => {
                          const updated = [...items];
                          updated[idx].quantity = Number(txt) || 1;
                          setItems(updated);
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ width: 90 }}>
                      <Text style={styles.itemDescLabel}>Rate (₹)</Text>
                      <TextInput
                        style={styles.itemSmallInput}
                        value={String(item.unit_price)}
                        onChangeText={(txt) => {
                          const updated = [...items];
                          updated[idx].unit_price = Number(txt) || 0;
                          setItems(updated);
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteItemBtn}
                      onPress={() => handleRemoveItem(idx)}
                    >
                      <Trash2 size={16} color={BrandColors.red} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Calculation Summary */}
                <View style={styles.calcBox}>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Subtotal</Text>
                    <Text style={styles.calcVal}>₹{subtotal.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Discount</Text>
                    <Text style={[styles.calcVal, { color: BrandColors.green }]}>- ₹{discountTotal.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>GST (18% Indian Tax)</Text>
                    <Text style={styles.calcVal}>₹{gstTax.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={[styles.calcRow, styles.calcRowTotal]}>
                    <Text style={styles.calcLabelTotal}>Grand Total</Text>
                    <Text style={styles.calcValTotal}>₹{grandTotal.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveQuotation}>
                <Text style={styles.confirmBtnText}>Save & Send Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Formal PDF Quotation Preview Modal */}
      {previewQuote && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pdfDialog}>
              <View style={styles.pdfHeader}>
                <Text style={styles.pdfHeaderTitle}>Formal Quotation Preview</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity 
                    style={styles.printBtn}
                    onPress={() => window.print()}
                  >
                    <Printer size={16} color={BrandColors.darkNavy} />
                    <Text style={styles.printBtnText}>Print / Save PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPreviewQuote(null)}>
                    <X size={20} color={BrandColors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Printable Quotation Document Paper */}
              <ScrollView style={styles.pdfPaper}>
                {/* Formal Letterhead */}
                <View style={styles.letterhead}>
                  <View>
                    <Text style={styles.corpBrandName}>Myth Connect.ai</Text>
                    <Text style={styles.corpTagline}>CONNECT | CONVERT | AUTOMATE | SALES</Text>
                    <Text style={styles.corpAddress}>Level 5, Myth Towers, Outer Ring Road, Bellandur, Bengaluru, KA 560103</Text>
                    <Text style={styles.corpGstin}>GSTIN: 29AABCM9981K1ZP • contact@mythconnect.ai</Text>
                  </View>
                  <View style={styles.quoteNumberBlock}>
                    <Text style={styles.quoteDocType}>COMMERCIAL QUOTATION</Text>
                    <Text style={styles.quoteDocNum}>{previewQuote.quotation_number}</Text>
                    <Text style={styles.quoteDocDate}>Date: {previewQuote.quotation_date}</Text>
                    <Text style={styles.quoteDocDate}>Valid Until: {previewQuote.valid_until}</Text>
                  </View>
                </View>

                {/* Bill To */}
                <View style={styles.billToBox}>
                  <Text style={styles.billToTitle}>PREPARED FOR:</Text>
                  <Text style={styles.billToName}>{previewQuote.customer_name}</Text>
                  <Text style={styles.billToCompany}>{previewQuote.customer_company}</Text>
                  <Text style={styles.billToInfo}>{previewQuote.customer_address}</Text>
                  <Text style={styles.billToInfo}>Phone: {previewQuote.customer_phone} | Email: {previewQuote.customer_email}</Text>
                  {previewQuote.customer_gstin && (
                    <Text style={styles.billToInfo}>GSTIN: {previewQuote.customer_gstin}</Text>
                  )}
                </View>

                {/* Items Table */}
                <View style={styles.pdfTable}>
                  <View style={styles.pdfTableHead}>
                    <Text style={[styles.pdfTh, { flex: 2.5 }]}>DESCRIPTION</Text>
                    <Text style={[styles.pdfTh, { width: 50, textAlign: 'center' }]}>QTY</Text>
                    <Text style={[styles.pdfTh, { width: 90, textAlign: 'right' }]}>RATE (₹)</Text>
                    <Text style={[styles.pdfTh, { width: 70, textAlign: 'center' }]}>TAX</Text>
                    <Text style={[styles.pdfTh, { width: 100, textAlign: 'right' }]}>TOTAL (₹)</Text>
                  </View>

                  {previewQuote.items.map((item, i) => (
                    <View key={i} style={styles.pdfTableRow}>
                      <Text style={[styles.pdfTd, { flex: 2.5 }]}>{item.description}</Text>
                      <Text style={[styles.pdfTd, { width: 50, textAlign: 'center' }]}>{item.quantity}</Text>
                      <Text style={[styles.pdfTd, { width: 90, textAlign: 'right' }]}>₹{item.unit_price.toLocaleString('en-IN')}</Text>
                      <Text style={[styles.pdfTd, { width: 70, textAlign: 'center' }]}>18% GST</Text>
                      <Text style={[styles.pdfTd, { width: 100, textAlign: 'right', fontWeight: '700' }]}>
                        ₹{item.total.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Totals */}
                <View style={styles.pdfSummary}>
                  <View style={styles.pdfTerms}>
                    <Text style={styles.termsTitle}>Terms & Conditions:</Text>
                    <Text style={styles.termsText}>1. 50% advance on formal approval, 50% on deployment completion.</Text>
                    <Text style={styles.termsText}>2. Includes 12 months SLA support and cloud Meta webhook hosting.</Text>
                    <Text style={styles.termsText}>3. All bank transfers to Myth Connect.ai Technologies Pvt Ltd.</Text>
                  </View>

                  <View style={styles.pdfTotalsBox}>
                    <View style={styles.pdfTotalRow}>
                      <Text style={styles.pdfTotalLabel}>Subtotal:</Text>
                      <Text style={styles.pdfTotalVal}>₹{previewQuote.subtotal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.pdfTotalRow}>
                      <Text style={styles.pdfTotalLabel}>GST (18%):</Text>
                      <Text style={styles.pdfTotalVal}>₹{previewQuote.tax_amount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={[styles.pdfTotalRow, styles.pdfGrandRow]}>
                      <Text style={styles.pdfGrandLabel}>Grand Total:</Text>
                      <Text style={styles.pdfGrandVal}>₹{previewQuote.grand_total.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.bg,
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 14,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  pageSubtitle: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  newQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  newQuoteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
    paddingBottom: 80,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFE',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  td: {
    justifyContent: 'center',
  },
  quoteNo: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  itemsCount: {
    fontSize: 11,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  clientName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  clientCompany: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  quoteDate: {
    fontSize: 12,
    color: BrandColors.textPrimary,
  },
  validUntil: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  quoteAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  taxSubtext: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convertBtn: {
    backgroundColor: BrandColors.blueLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
  },
  convertBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 58, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formCol: {
    flex: 1,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  lineItemsSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    paddingTop: 14,
  },
  lineItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    marginBottom: 10,
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 8,
    borderRadius: 6,
  },
  itemDescLabel: {
    fontSize: 10,
    color: BrandColors.textMuted,
    marginBottom: 4,
  },
  itemDescInput: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 6,
    padding: 6,
    backgroundColor: '#FFFFFF',
    fontSize: 12,
    outlineStyle: 'none' as any,
  },
  itemSmallInput: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 6,
    padding: 6,
    backgroundColor: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    outlineStyle: 'none' as any,
  },
  deleteItemBtn: {
    padding: 8,
  },
  calcBox: {
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  calcVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  calcRowTotal: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    paddingTop: 8,
  },
  calcLabelTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  calcValTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    backgroundColor: '#FAFCFE',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  confirmBtn: {
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pdfDialog: {
    width: '100%',
    maxWidth: 780,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFCFE',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  pdfHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.darkNavy,
  },
  pdfPaper: {
    padding: 32,
    backgroundColor: '#FFFFFF',
    maxHeight: 600,
  },
  letterhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: BrandColors.blue,
    paddingBottom: 20,
    marginBottom: 20,
  },
  corpBrandName: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  corpTagline: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.blue,
    letterSpacing: 0.8,
    marginVertical: 4,
  },
  corpAddress: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    maxWidth: 360,
    lineHeight: 16,
  },
  corpGstin: {
    fontSize: 11,
    color: BrandColors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  quoteNumberBlock: {
    alignItems: 'flex-end',
  },
  quoteDocType: {
    fontSize: 13,
    fontWeight: '800',
    color: BrandColors.blue,
  },
  quoteDocNum: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    marginTop: 2,
  },
  quoteDocDate: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  billToBox: {
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  billToTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
  },
  billToName: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.textPrimary,
    marginTop: 4,
  },
  billToCompany: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  billToInfo: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  pdfTable: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pdfTableHead: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFE',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    padding: 10,
  },
  pdfTh: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.textMuted,
  },
  pdfTableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  pdfTd: {
    fontSize: 12,
    color: BrandColors.textPrimary,
  },
  pdfSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pdfTerms: {
    flex: 1.5,
    paddingRight: 20,
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textPrimary,
    marginBottom: 6,
  },
  termsText: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    lineHeight: 16,
  },
  pdfTotalsBox: {
    flex: 1,
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 14,
    borderRadius: 8,
    gap: 6,
  },
  pdfTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pdfTotalLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  pdfTotalVal: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  pdfGrandRow: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  pdfGrandLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  pdfGrandVal: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.blue,
  },
});
