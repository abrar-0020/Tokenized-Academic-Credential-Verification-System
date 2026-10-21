import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import QRCode from 'qrcode';
import { CERTIFICATE_HTML_TEMPLATE } from './template';

export interface CertificateCredentialInput {
  tokenId: string;
  degree?: string;
  program?: string;
  institution?: string;
  monogram?: string;
  year?: string;
  studentName?: string;
  grade?: string;
  status?: string;
  credentialId?: string;
  metadataURI?: string;
  [key: string]: any;
}

/**
 * Escapes characters for safe HTML inclusion
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'N/A';
  const trimmed = String(str).trim();
  if (!trimmed) return 'N/A';
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Derives an institutional monogram (e.g., "PU" for "Presidency University")
 */
export function deriveMonogram(institution?: string, fallback = 'TC'): string {
  if (!institution || !institution.trim()) return fallback;
  const words = institution.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return institution.slice(0, 2).toUpperCase() || fallback;
}

/**
 * Generates responsive SVG string of verification QR code
 */
export async function generateQrSvgString(payload: string): Promise<string> {
  const rawSvg = await QRCode.toString(payload, {
    type: 'svg',
    margin: 0,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Strip fixed width/height attributes so the SVG fills its parent box cleanly
  const scalableSvg = rawSvg.replace(/<svg[^>]*>/, (match) => {
    return match
      .replace(/\s*width="[^"]*"/gi, '')
      .replace(/\s*height="[^"]*"/gi, '');
  });

  return scalableSvg;
}

/**
 * Builds the complete certificate HTML by substituting placeholders
 */
export async function buildCertificateHtml(credential: CertificateCredentialInput): Promise<string> {
  const tokenId = credential.tokenId ? String(credential.tokenId).trim() : 'N/A';
  const credentialId =
    credential.credentialId ||
    credential.id ||
    (tokenId !== 'N/A' ? `TC-TOKEN-${tokenId}` : 'N/A');

  const institution = credential.institution?.trim() || 'N/A';
  const monogram = credential.monogram?.trim() || deriveMonogram(institution !== 'N/A' ? institution : undefined);
  const studentName = credential.studentName?.trim() || 'N/A';
  const degree = credential.degree?.trim() || 'N/A';
  const program = credential.program?.trim() || degree;
  const grade = credential.grade?.trim() || 'N/A';
  const issueYear = credential.year?.trim() || 'N/A';

  // Standard public verification payload
  const verificationUrl = tokenId !== 'N/A'
    ? `https://www.deoxys.in/public-verify?tokenId=${encodeURIComponent(tokenId)}`
    : 'https://www.deoxys.in/public-verify';

  const qrSvg = await generateQrSvgString(verificationUrl);

  const replacements: Record<string, string> = {
    '{{monogram}}': escapeHtml(monogram),
    '{{institution}}': escapeHtml(institution),
    '{{studentName}}': escapeHtml(studentName),
    '{{degree}}': escapeHtml(degree),
    '{{program}}': escapeHtml(program),
    '{{grade}}': escapeHtml(grade),
    '{{issueYear}}': escapeHtml(issueYear),
    '{{credentialId}}': escapeHtml(credentialId),
    '{{tokenId}}': escapeHtml(tokenId),
  };

  let html = CERTIFICATE_HTML_TEMPLATE;

  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }

  // Insert QR SVG unescaped
  html = html.split('{{qrSvg}}').join(qrSvg);

  return html;
}

export interface SaveCertificateResult {
  success: boolean;
  uri?: string;
  filename: string;
  method?: 'saf' | 'sharing';
  cancelled?: boolean;
}

/**
 * Generates an A4 landscape certificate PDF and saves or shares it.
 */
export async function saveCertificatePdf(
  credential: CertificateCredentialInput
): Promise<SaveCertificateResult> {
  const html = await buildCertificateHtml(credential);

  // 1. Generate PDF with expo-print with base64 included in memory
  const printResult = await Print.printToFileAsync({
    html,
    width: 842,
    height: 595,
    base64: true,
  });

  const rawCredId =
    credential.credentialId ||
    credential.id ||
    credential.tokenId ||
    'certificate';
  const safeCredId = String(rawCredId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `TokCred-Certificate-${safeCredId}.pdf`;

  // 2. Save directly to app document directory (no folder picker prompt, reliable permissions)
  const targetDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  const fileUri = `${targetDir}${filename}`;

  if (printResult.base64) {
    await FileSystem.writeAsStringAsync(fileUri, printResult.base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  // 3. Open system share sheet (iOS "Save to Files", Android native share/save options)
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: filename,
  });

  return {
    success: true,
    uri: fileUri,
    filename,
    method: 'sharing',
  };
}
