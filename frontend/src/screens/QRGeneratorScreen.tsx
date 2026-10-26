import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { 
  QrCode, Download, Copy, ExternalLink, Sparkles, 
  Check, Globe, MessageSquare, Phone, Mail, FileText, IndianRupee,
  Contact, Trash2, Edit3
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { QrType } from '../types';

export const QRGeneratorScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { qrCodes, generateQrCode, deleteQrCode, renameQrCode, showSnackbar, digitalProfile } = useAppStore();

  const [qrType, setQrType] = useState<QrType>('digital_profile');
  const [title, setTitle] = useState('Smart Digital Profile QR');
  const [fgColor, setFgColor] = useState(BrandColors.darkNavy);
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waText, setWaText] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
  const [leadFormUrl, setLeadFormUrl] = useState('');

  useEffect(() => {
    if (digitalProfile) {
      if (digitalProfile.website) setWebsiteUrl(digitalProfile.website);
      if (digitalProfile.whatsapp || digitalProfile.phone) setWaPhone(digitalProfile.whatsapp || digitalProfile.phone);
      if (digitalProfile.upi_id) setUpiVpa(digitalProfile.upi_id);
      if (digitalProfile.upi_name) setUpiName(digitalProfile.upi_name);
    }
  }, [digitalProfile]);

  // Compute Payload
  const getPayload = (): string => {
    switch (qrType) {
      case 'digital_profile':
        return typeof window !== 'undefined' 
          ? `${window.location.origin}/qr/${digitalProfile.smart_qr_id}` 
          : `http://localhost:3000/qr/${digitalProfile.smart_qr_id}`;
      case 'whatsapp':
        return `https://wa.me/${waPhone.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;
      case 'upi':
        return `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(upiName)}&am=${upiAmount}&cu=INR`;
      case 'lead_form':
        return leadFormUrl;
      case 'website':
        return websiteUrl;
      default:
        return websiteUrl;
    }
  };

  const payload = getPayload();

  const handleCreateQr = () => {
    generateQrCode({
      title: title || `${qrType.toUpperCase()} Smart QR`,
      qr_type: qrType,
      payload_data: payload,
      target_url: payload.startsWith('http') ? payload : undefined,
      foreground_color: fgColor,
      background_color: '#FFFFFF'
    });

    showSnackbar('Smart trackable QR Code generated and saved!', 'success');
  };

  const handleDownloadPNG = () => {
    const canvas = document.getElementById('qr-canvas-download') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${title.toLowerCase().replace(/\s+/g, '_')}_qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showSnackbar('QR Code PNG downloaded!', 'success');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    showSnackbar('QR target payload copied to clipboard!', 'info');
  };

  const typesList: { key: QrType; label: string; icon: any }[] = [
    { key: 'digital_profile', label: 'Digital Profile', icon: Contact },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { key: 'upi', label: 'UPI Payment', icon: IndianRupee },
    { key: 'lead_form', label: 'Lead Form', icon: FileText },
    { key: 'website', label: 'Website URL', icon: Globe },
    { key: 'phone', label: 'Phone Call', icon: Phone },
    { key: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Dynamic Smart QR Generator</Text>
          <Text style={styles.pageSubtitle}>
            Generate branded trackable QR codes for WhatsApp conversations, UPI billing, and Meta booth forms
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={[styles.generatorLayout, isMobile && styles.generatorLayoutMobile]}>
          {/* Left Form: QR Configuration */}
          <View style={styles.configCard}>
            <Text style={styles.cardHeading}>1. SELECT QR PURPOSE</Text>
            
            <View style={styles.typesGrid}>
              {typesList.map(t => {
                const Icon = t.icon;
                const isSelected = qrType === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeBtn, isSelected && styles.typeBtnSelected]}
                    onPress={() => setQrType(t.key)}
                  >
                    <Icon size={16} color={isSelected ? BrandColors.blue : BrandColors.textSecondary} />
                    <Text style={[styles.typeBtnText, isSelected && styles.typeBtnTextSelected]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.cardHeading, { marginTop: 20 }]}>2. CONFIGURE DESTINATION</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>QR Campaign Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Sales WhatsApp Helpline"
              />
            </View>

            {qrType === 'whatsapp' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>WhatsApp Phone (with Country Code)</Text>
                  <TextInput
                    style={styles.input}
                    value={waPhone}
                    onChangeText={setWaPhone}
                    placeholder="919876543210"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Pre-filled Greeting Message</Text>
                  <TextInput
                    style={[styles.input, { minHeight: 60 }]}
                    value={waText}
                    onChangeText={setWaText}
                    multiline
                  />
                </View>
              </>
            )}

            {qrType === 'upi' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>UPI Virtual Payment Address (VPA)</Text>
                  <TextInput
                    style={styles.input}
                    value={upiVpa}
                    onChangeText={setUpiVpa}
                    placeholder="mythconnect@hdfcbank"
                  />
                </View>
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Payee Name</Text>
                    <TextInput
                      style={styles.input}
                      value={upiName}
                      onChangeText={setUpiName}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Amount (₹)</Text>
                    <TextInput
                      style={styles.input}
                      value={upiAmount}
                      onChangeText={setUpiAmount}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </>
            )}

            {qrType === 'lead_form' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Lead Capture Landing Page URL</Text>
                <TextInput
                  style={styles.input}
                  value={leadFormUrl}
                  onChangeText={setLeadFormUrl}
                />
              </View>
            )}

            {qrType === 'website' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Target Website URL</Text>
                <TextInput
                  style={styles.input}
                  value={websiteUrl}
                  onChangeText={setWebsiteUrl}
                />
              </View>
            )}

            {/* Brand Colors Selector */}
            <Text style={[styles.cardHeading, { marginTop: 16 }]}>3. BRAND COLOR THEME</Text>
            <View style={styles.colorRow}>
              {[
                { name: 'Dark Navy', color: BrandColors.darkNavy },
                { name: 'Brand Blue', color: BrandColors.blue },
                { name: 'WhatsApp Green', color: BrandColors.green },
                { name: 'Accent Orange', color: BrandColors.orange },
                { name: 'Pitch Black', color: '#000000' }
              ].map(c => (
                <TouchableOpacity
                  key={c.color}
                  style={[
                    styles.colorCircle, 
                    { backgroundColor: c.color },
                    fgColor === c.color && styles.colorCircleActive
                  ]}
                  onPress={() => setFgColor(c.color)}
                >
                  {fgColor === c.color && <Check size={14} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveQrBtn} onPress={handleCreateQr}>
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.saveQrBtnText}>Generate & Save Smart QR</Text>
            </TouchableOpacity>
          </View>

          {/* Right Card: Live QR Preview */}
          <View style={styles.previewCard}>
            <Text style={styles.previewHeading}>REALTIME QR PREVIEW</Text>
            
            <View style={styles.qrDisplayBox}>
              {/* SVG vector display */}
              <QRCodeSVG
                value={payload}
                size={220}
                fgColor={fgColor}
                bgColor="#FFFFFF"
                level="H"
                includeMargin
              />

              {/* Hidden Canvas used for high-res PNG download export */}
              <View style={{ display: 'none' }}>
                <QRCodeCanvas
                  id="qr-canvas-download"
                  value={payload}
                  size={512}
                  fgColor={fgColor}
                  bgColor="#FFFFFF"
                  level="H"
                  includeMargin
                />
              </View>

              <Text style={styles.previewQrTitle}>{title}</Text>
              <Text style={styles.previewPayload} numberOfLines={2}>{payload}</Text>
            </View>

            <View style={styles.previewActionRow}>
              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPNG}>
                <Download size={15} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download PNG</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.downloadBtn, { backgroundColor: '#0B1F3A' }]} 
                onPress={() => {
                  const svgEl = document.querySelector('.qr-svg-container svg');
                  if (svgEl) {
                    const svgData = new XMLSerializer().serializeToString(svgEl);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    const link = document.createElement('a');
                    link.href = svgUrl;
                    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_qr.svg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(svgUrl);
                    showSnackbar('QR Code SVG vector downloaded!', 'success');
                  } else {
                    showSnackbar('SVG exported directly', 'info');
                  }
                }}
              >
                <Download size={15} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download SVG</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                <Copy size={15} color={BrandColors.darkNavy} />
                <Text style={styles.copyBtnText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Generated QR Codes History */}
        <View style={styles.historyCard}>
          <Text style={styles.historyHeading}>SAVED DYNAMIC QR CODES ({qrCodes.length})</Text>
          <View style={styles.historyTable}>
            <View style={styles.historyThRow}>
              <Text style={[styles.hTh, { flex: 2 }]}>CAMPAIGN TITLE</Text>
              <Text style={[styles.hTh, { flex: 1 }]}>TYPE</Text>
              <Text style={[styles.hTh, { flex: 0.8, textAlign: 'center' }]}>SCANS</Text>
              <Text style={[styles.hTh, { flex: 0.8, textAlign: 'center' }]}>DOWNLOADS</Text>
              <Text style={[styles.hTh, { flex: 1.1, textAlign: 'right' }]}>CREATED</Text>
              <Text style={[styles.hTh, { flex: 1, textAlign: 'center' }]}>ACTIONS</Text>
            </View>

            {qrCodes.map(q => (
              <View key={q.id} style={styles.historyRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.hTitle}>{q.title}</Text>
                  <Text style={styles.hCode}>{q.qr_code_id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[styles.hBadge, q.qr_type === 'digital_profile' && { backgroundColor: BrandColors.greenLight }]}>
                    <Text style={[styles.hBadgeText, q.qr_type === 'digital_profile' && { color: BrandColors.green }]}>
                      {q.qr_type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.hCell, { flex: 0.8, textAlign: 'center', fontWeight: '700' }]}>{q.scan_count}</Text>
                <Text style={[styles.hCell, { flex: 0.8, textAlign: 'center', fontWeight: '700' }]}>{q.download_count}</Text>
                <Text style={[styles.hCell, { flex: 1.1, textAlign: 'right', color: BrandColors.textMuted }]}>
                  {new Date(q.created_at).toLocaleDateString()}
                </Text>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigator.clipboard.writeText(q.payload_data);
                      showSnackbar('QR URL copied to clipboard!', 'info');
                    }}
                    style={{ padding: 4 }}
                    title="Copy URL"
                  >
                    <Copy size={15} color={BrandColors.blue} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      deleteQrCode(q.id);
                      showSnackbar(`QR Code "${q.title}" deleted`, 'info');
                    }}
                    style={{ padding: 4 }}
                    title="Delete QR"
                  >
                    <Trash2 size={15} color={BrandColors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    gap: 12,
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
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
    paddingBottom: 80,
  },
  generatorLayout: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  generatorLayoutMobile: {
    flexDirection: 'column',
  },
  configCard: {
    flex: 1.4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 20,
  },
  previewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 20,
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: 6,
    backgroundColor: BrandColors.surfaceSubtle,
  },
  typeBtnSelected: {
    backgroundColor: BrandColors.blueLight,
    borderColor: BrandColors.blue,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  typeBtnTextSelected: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 12,
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    outlineStyle: 'none' as any,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleActive: {
    transform: [{ scale: 1.1 }],
    boxShadow: '0 0 0 2px #FFFFFF, 0 0 0 4px #1565E8' as any,
  },
  saveQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.blue,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveQrBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  previewHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 16,
  },
  qrDisplayBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFCFE',
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 12,
    width: '100%',
  },
  previewQrTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginTop: 14,
    textAlign: 'center',
  },
  previewPayload: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: "'Space Grotesk', monospace",
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 16,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.darkNavy,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  copyBtnText: {
    color: BrandColors.darkNavy,
    fontSize: 12.5,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 20,
  },
  historyHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginBottom: 14,
  },
  historyTable: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  historyThRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFE',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    padding: 10,
  },
  hTh: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.textMuted,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  hTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  hCode: {
    fontSize: 10.5,
    color: BrandColors.blue,
    fontFamily: "'Space Grotesk', monospace",
  },
  hBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.textSecondary,
  },
  hCell: {
    fontSize: 12,
    color: BrandColors.textPrimary,
  },
});
