/**
 * VCard 3.0 Generator for Mobile & Desktop Contacts
 * Generates standard RFC 2426 vCard format for Android, iOS, Windows, Mac
 */

export interface VCardData {
  firstName?: string;
  lastName?: string;
  fullName: string;
  company: string;
  title: string;
  phone: string;
  mobile?: string;
  email: string;
  url: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  note?: string;
}

export const generateVCardString = (data: VCardData): string => {
  const street = data.address?.street || '';
  const city = data.address?.city || '';
  const state = data.address?.state || '';
  const pincode = data.address?.pincode || '';
  const country = data.address?.country || 'India';

  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.fullName}`,
    `N:${data.lastName || ''};${data.firstName || data.fullName};;;`,
    `ORG:${data.company}`,
    `TITLE:${data.title}`,
    `TEL;TYPE=CELL,VOICE:${data.mobile || data.phone}`,
    data.phone !== (data.mobile || data.phone) ? `TEL;TYPE=WORK,VOICE:${data.phone}` : '',
    `EMAIL;TYPE=PREF,INTERNET:${data.email}`,
    `URL:${data.url}`,
    `ADR;TYPE=WORK:;;${street};${city};${state};${pincode};${country}`,
    `LABEL;TYPE=WORK:${street}\\n${city}, ${state} ${pincode}\\n${country}`,
    data.note ? `NOTE:${data.note}` : 'NOTE:Smart Digital Business Profile powered by Myth Connect CRM',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');

  return vCard;
};

export const downloadVCard = (data: VCardData, filename: string = 'contact.vcf'): void => {
  const vcardString = generateVCardString(data);
  const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8;' });
  
  // Use modern URL object
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.vcf') ? filename : `${filename}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
