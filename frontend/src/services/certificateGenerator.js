import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

// Master HTML template for the professional certificate (A4 Landscape, 297mm x 210mm)
const CERTIFICATE_HTML_TEMPLATE = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>TokCred Degree Certificate (Professional)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@page{size:297mm 210mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0;font-kerning:none;font-variant-ligatures:none}
html,body{width:297mm;height:210mm;overflow:hidden;background:#FFFEFC;-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--ink:#0B1F44;--blue:#0A5BD8;--gold:#B08D4A;--mut:#5E6A7D;--serif:Georgia,'Times New Roman',serif;--sans:Inter,'Helvetica Neue',Arial,sans-serif;--mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
.pg{position:relative;width:297mm;height:210mm;overflow:hidden;background:#FFFEFC;color:var(--ink);font-family:var(--serif)}
.frm{position:absolute;inset:0;width:297mm;height:210mm;pointer-events:none}
.ct{position:absolute;left:24mm;right:24mm;top:15.5mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.crest{width:15mm;height:15mm;border-radius:50%;background:var(--ink);color:#EAD49B;display:flex;align-items:center;justify-content:center;font:600 12pt/1 var(--serif);letter-spacing:.05em;box-shadow:0 0 0 1.1mm #FFFEFC,0 0 0 1.5mm var(--gold)}
.inst{margin-top:3.8mm;font:600 10.5pt/1.2 var(--sans);letter-spacing:.34em;text-transform:uppercase;color:var(--ink)}
.ttl{margin-top:4mm;font:500 28pt/1.25 var(--serif);letter-spacing:.025em;color:var(--ink)}
.orn{display:flex;align-items:center;justify-content:center;gap:2.5mm;margin:2.8mm auto 4.2mm;color:var(--gold);height:3mm}.orn i{display:block;width:28mm;height:.55pt;background:var(--gold)}.orn u{display:block;width:1.9mm;height:1.9mm;background:var(--gold);transform:rotate(45deg)}
.it{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400;font-size:11.8pt;line-height:1.45;letter-spacing:.012em;word-spacing:.06em;color:var(--mut);max-width:225mm}
.nm{margin-top:2.2mm;margin-bottom:4.5mm;font:600 36pt/1.2 var(--serif);letter-spacing:.01em;word-spacing:.06em;color:var(--ink)}
.identity-bar{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:3mm;padding:2.1mm 5.5mm 2.3mm;margin:0 auto 4.5mm;border:.5pt solid rgba(176,141,74,.48);border-radius:999px;background:rgba(248,244,234,.72);font:500 7.5pt/1.1 var(--mono);color:var(--ink);letter-spacing:.02em}
.identity-bar span{color:var(--mut);font-weight:400;margin-right:1mm}
.identity-bar b{color:var(--ink);font-weight:600}
.dg{margin-top:2.8mm;font:700 23pt/1.22 var(--serif);letter-spacing:.01em;word-spacing:.05em;color:var(--ink);max-width:225mm}
.pr{margin-top:1.8mm;font:500 13.5pt/1.3 var(--serif);color:var(--blue);letter-spacing:.015em;word-spacing:.05em}
.gr{margin-top:3.5mm;font:400 11.2pt/1.4 var(--serif);word-spacing:.04em;color:var(--mut)}.gr b{color:var(--ink);font-weight:600}
.ft{position:absolute;left:24mm;right:24mm;bottom:22mm;display:grid;grid-template-columns:1fr 30mm 1fr;align-items:end;gap:8mm}
.q{display:flex;align-items:center;gap:3.4mm}.qb{width:21mm;height:21mm;background:#fff;padding:1.4mm;border:.6pt solid rgba(11,31,68,.2)}.qb svg{width:100%;height:100%;display:block}
.qt{font:500 6.8pt/1.6 var(--sans);letter-spacing:.04em;color:var(--mut)}.qt b{display:block;font:600 7pt var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--ink);margin-bottom:.7mm}
.seal{width:29mm;height:29mm;display:block;margin:0 auto;filter:drop-shadow(0 .6mm .8mm rgba(80,55,20,.28))}
.sg{display:grid;grid-template-columns:1fr 1fr;gap:8mm;text-align:center}
.sig-mark{display:block;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:10pt;line-height:1.35;color:var(--ink);margin-bottom:2mm;min-height:4.2mm}
.sg i{display:block;height:.7pt;background:var(--ink);opacity:.6;margin-bottom:1.6mm}.sg b{display:block;font:600 7.2pt var(--sans);letter-spacing:.18em;text-transform:uppercase}.sg .sg-sub{display:block;margin-top:.5mm;font:400 6.4pt var(--sans);letter-spacing:.05em;color:var(--mut)}
.id{position:absolute;left:20mm;right:20mm;bottom:14.6mm;text-align:center;font:500 6.2pt/1.2 var(--mono);letter-spacing:.06em;color:var(--mut)}.id u{text-decoration:none;color:var(--ink);font-weight:600}
</style></head><body><div class="pg">
<svg class="frm" viewBox="0 0 297 210"><rect x="8" y="8" width="281" height="194" fill="none" stroke="#0B1F44" stroke-width=".55"/><path d="M15.5 11H281.5A4.5 4.5 0 0 0 286 15.5V194.5A4.5 4.5 0 0 0 281.5 199H15.5A4.5 4.5 0 0 0 11 194.5V15.5A4.5 4.5 0 0 0 15.5 11Z" fill="none" stroke="#B08D4A" stroke-width=".35"/><g fill="#B08D4A"><circle cx="11" cy="11" r=".9"/><circle cx="286" cy="11" r=".9"/><circle cx="11" cy="199" r=".9"/><circle cx="286" cy="199" r=".9"/></g></svg>
<div class="ct">
<div class="crest">{{monogram}}</div><div class="inst">{{institution}}</div>
<div class="ttl">Degree Certificate</div>
<div class="orn"><i></i><u></u><i></i></div>
<div class="it">This is to certify that</div>
<div class="nm">{{studentName}}</div>
<div class="identity-bar"><div><span>Enrollment / Reg. No.:</span><b>{{enrollmentNumber}}</b></div><div>&middot;</div><div><span>Credential ID:</span><b>{{credentialId}}</b></div><div>&middot;</div><div><span>Soulbound Holder:</span><b>{{holderWallet}}</b></div></div>
<div class="it">having fulfilled all the requirements prescribed by the university, is hereby awarded the degree of</div>
<div class="dg">{{degree}}</div>{{programBlock}}
<div class="gr">with a Cumulative Grade of <b>{{grade}}</b> &nbsp;&middot;&nbsp; Conferred in <b>{{issueYear}}</b></div>
</div>
<div class="ft"><div class="q"><div class="qb">{{qrSvg}}</div><div class="qt"><b>Scan to verify</b>Confirm authenticity<br>on TokCred</div></div>
<svg class="seal" viewBox="0 0 100 100"><defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAD49B"/><stop offset=".5" stop-color="#B8934F"/><stop offset="1" stop-color="#7E5F2B"/></linearGradient></defs><polygon points="99.00,50.00 95.36,53.57 98.40,57.67 94.24,60.62 96.60,65.14 92.04,67.41 93.66,72.25 88.80,73.77 89.64,78.80 84.60,79.55 84.65,84.65 79.55,84.60 78.80,89.64 73.77,88.80 72.25,93.66 67.41,92.04 65.14,96.60 60.62,94.24 57.67,98.40 53.57,95.36 50.00,99.00 46.43,95.36 42.33,98.40 39.38,94.24 34.86,96.60 32.59,92.04 27.75,93.66 26.23,88.80 21.20,89.64 20.45,84.60 15.35,84.65 15.40,79.55 10.36,78.80 11.20,73.77 6.34,72.25 7.96,67.41 3.40,65.14 5.76,60.62 1.60,57.67 4.64,53.57 1.00,50.00 4.64,46.43 1.60,42.33 5.76,39.38 3.40,34.86 7.96,32.59 6.34,27.75 11.20,26.23 10.36,21.20 15.40,20.45 15.35,15.35 20.45,15.40 21.20,10.36 26.23,11.20 27.75,6.34 32.59,7.96 34.86,3.40 39.38,5.76 42.33,1.60 46.43,4.64 50.00,1.00 53.57,4.64 57.67,1.60 60.62,5.76 65.14,3.40 67.41,7.96 72.25,6.34 73.77,11.20 78.80,10.36 79.55,15.40 84.65,15.35 84.60,20.45 89.64,21.20 88.80,26.23 93.66,27.75 92.04,32.59 96.60,34.86 94.24,39.38 98.40,42.33 95.36,46.43" fill="url(#gd)"/><circle cx="50" cy="50" r="39" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/><circle cx="50" cy="50" r="35" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/><circle cx="50" cy="50" r="27" fill="#0B1F44"/><g transform="translate(36 36) scale(1.17)" fill="none" stroke="#EAD49B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></g></svg>
<div class="sg"><div><span class="sig-mark">Office of Registrar</span><i></i><b>Registrar</b><span class="sg-sub">{{institution}}</span></div><div><span class="sig-mark">Academic Senate</span><i></i><b>Vice Chancellor</b><span class="sg-sub">{{institution}}</span></div></div></div>
<div class="id">Credential ID <u>{{credentialId}}</u> &nbsp;&middot;&nbsp; Reg. No. <u>{{enrollmentNumber}}</u> &nbsp;&middot;&nbsp; Token ID <u>#{{tokenId}}</u> &nbsp;&middot;&nbsp; Bound to Wallet <u>{{holderWallet}}</u></div>
</div></body></html>`;

export function escapeHtml(str) {
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

export function deriveMonogram(institution, fallback = 'TC') {
  if (!institution || !institution.trim()) return fallback;
  const words = institution.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return institution.slice(0, 2).toUpperCase() || fallback;
}

export async function generateQrSvgString(payload) {
  const rawSvg = await QRCode.toString(payload, {
    type: 'svg',
    margin: 0,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  return rawSvg.replace(/<svg[^>]*>/, (match) => {
    return match
      .replace(/\s*width="[^"]*"/gi, '')
      .replace(/\s*height="[^"]*"/gi, '');
  });
}

export async function buildCertificateHtml(credential, metadata) {
  if (metadata?.isEncrypted && !metadata?.studentName) {
    throw new Error('Unlock this encrypted credential with an authorized wallet before generating the certificate PDF.');
  }

  const tokenId = credential?.tokenId !== undefined ? String(credential.tokenId).trim() : 'N/A';
  const credentialId =
    metadata?.credentialId ||
    metadata?.id ||
    (tokenId !== 'N/A' ? `TC-TOKEN-${tokenId}` : 'N/A');

  const enrollmentNumber =
    metadata?.enrollmentNumber?.trim() ||
    metadata?.registrationNumber?.trim() ||
    'Not Recorded';

  const holderWalletRaw =
    metadata?.holderWallet ||
    credential?.holderWallet ||
    credential?.student ||
    '';

  const holderWallet = holderWalletRaw
    ? `${holderWalletRaw.slice(0, 8)}...${holderWalletRaw.slice(-6)}`
    : 'Not Bound';

  const institution = metadata?.institution?.trim() || 'Issuing Institution';
  const monogram = metadata?.monogram?.trim() || deriveMonogram(institution);
  const studentName = metadata?.studentName?.trim() || 'Candidate Name';
  const degree = metadata?.degree?.trim() || 'Academic Credential';
  const rawProgram = metadata?.branch?.trim() || metadata?.fieldOfStudy?.trim() || metadata?.program?.trim() || '';
  const showProgram = Boolean(
    rawProgram &&
    rawProgram.toLowerCase() !== degree.toLowerCase() &&
    !degree.toLowerCase().includes(rawProgram.toLowerCase())
  );
  const programBlock = showProgram ? `<div class="pr">in ${escapeHtml(rawProgram)}</div>` : '';
  const grade = metadata?.grade?.trim() || 'Honors';

  let issueYear = String(new Date().getFullYear());
  if (credential?.issueTimestamp) {
    try {
      const ts = Number(credential.issueTimestamp);
      const d = ts > 1e11 ? new Date(ts) : new Date(ts * 1000);
      if (!isNaN(d.getFullYear())) issueYear = String(d.getFullYear());
    } catch {
      // keep fallback
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.deoxys.in';
  const verificationUrl = tokenId !== 'N/A'
    ? `${origin}/public-verify?tokenId=${encodeURIComponent(tokenId)}`
    : `${origin}/public-verify`;

  const qrSvg = await generateQrSvgString(verificationUrl);

  const replacements = {
    '{{monogram}}': escapeHtml(monogram),
    '{{institution}}': escapeHtml(institution),
    '{{studentName}}': escapeHtml(studentName),
    '{{enrollmentNumber}}': escapeHtml(enrollmentNumber),
    '{{holderWallet}}': escapeHtml(holderWallet),
    '{{degree}}': escapeHtml(degree),
    '{{grade}}': escapeHtml(grade),
    '{{issueYear}}': escapeHtml(issueYear),
    '{{credentialId}}': escapeHtml(credentialId),
    '{{tokenId}}': escapeHtml(tokenId),
  };

  let html = CERTIFICATE_HTML_TEMPLATE;
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }

  html = html.split('{{programBlock}}').join(programBlock);
  html = html.split('{{qrSvg}}').join(qrSvg);
  return html;
}

/**
 * Generates and downloads the official TokCred Certificate PDF
 */
export async function downloadCertificatePdf(credential, metadata) {
  const htmlContent = await buildCertificateHtml(credential, metadata);
  const tokenId = credential?.tokenId !== undefined ? String(credential.tokenId).trim() : 'certificate';
  const safeId = (metadata?.credentialId || tokenId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `TokCred-Certificate-${safeId}.pdf`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '0';
  iframe.style.width = '1123px';
  iframe.style.height = '794px';
  iframe.style.border = 'none';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.zIndex = '-99999';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    if (iframe.contentWindow.document.fonts) {
      await iframe.contentWindow.document.fonts.ready;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    const targetElement = iframe.contentWindow.document.querySelector('.pg') || iframe.contentWindow.document.body;

    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFEFC',
      width: 1123,
      height: 794,
      windowWidth: 1123,
      windowHeight: 794,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
    pdf.save(filename);
  } finally {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}
