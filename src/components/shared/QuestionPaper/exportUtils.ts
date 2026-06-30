import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import apiClient from '../../../config/axios';
import { GeneratedQuestionPaper } from '../../../models/generatedQuestionPaper';
import { formatQuestionNumber } from './utils';

export interface SchoolInfo {
  name?: string;
  address?: string;
  logoUrl?: string;
}

const imageDataUrlCache = new Map<string, string>();

async function fetchImageAsDataUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  if (imageDataUrlCache.has(url)) return imageDataUrlCache.get(url)!;

  try {
    const res = await apiClient.get('/generated-question-papers/image-proxy', {
      params: { url },
    });
    const dataUrl = res.data?.data?.dataUrl;
    if (dataUrl) {
      imageDataUrlCache.set(url, dataUrl);
      return dataUrl;
    }
  } catch {
    /* skip broken images */
  }
  return '';
}

async function preparePaperForExport(
  paper: GeneratedQuestionPaper,
  school?: SchoolInfo
): Promise<{ paper: GeneratedQuestionPaper; school?: SchoolInfo }> {
  const urls = new Set<string>();
  if (school?.logoUrl) urls.add(school.logoUrl);
  for (const sec of paper.sections || []) {
    for (const q of sec.questions || []) {
      for (const u of q.imageUrls || []) {
        if (u) urls.add(u);
      }
    }
  }

  const mapping = new Map<string, string>();
  await Promise.all(
    Array.from(urls).map(async (url) => {
      const dataUrl = await fetchImageAsDataUrl(url);
      mapping.set(url, dataUrl);
    })
  );

  const preparedSchool = school?.logoUrl
    ? { ...school, logoUrl: mapping.get(school.logoUrl) || undefined }
    : school;

  const preparedPaper: GeneratedQuestionPaper = {
    ...paper,
    sections: (paper.sections || []).map((sec) => ({
      ...sec,
      questions: (sec.questions || []).map((q) => ({
        ...q,
        imageUrls: (q.imageUrls || [])
          .map((u) => mapping.get(u) || '')
          .filter(Boolean),
      })),
    })),
  };

  return { paper: preparedPaper, school: preparedSchool };
}

export async function exportElementAsPdf(element: HTMLElement, fileName: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${fileName}.pdf`);
}

function buildPaperHtml(paper: GeneratedQuestionPaper, school?: SchoolInfo): string {
  const renderQuestion = (q: GeneratedQuestionPaper['sections'][0]['questions'][0], num: string) => {
    let extra = '';
    if (q.questionType === 'mcq' && q.options) {
      extra = ['A', 'B', 'C', 'D', 'E']
        .filter((k) => q.options?.[k as keyof typeof q.options])
        .map((k) => `<div>(${k}) ${q.options?.[k as keyof typeof q.options]}</div>`)
        .join('');
    }
    const images = (q.imageUrls || [])
      .map((url) => `<img src="${url}" crossorigin="anonymous" style="max-height:180px;margin:8px 0;" />`)
      .join('');
    return `
      <div style="margin-bottom:16px;">
        <p><strong>${num}</strong> ${q.questionText || ''}</p>
        ${images}
        ${extra}
        <p style="text-align:right;font-size:11px;color:#666;">[${q.marks} mark(s)]</p>
      </div>`;
  };

  const sections = (paper.sections || [])
    .map(
      (sec, sIdx) => `
      <h3 style="text-align:center;text-transform:uppercase;">${sec.name}</h3>
      ${sec.instructions ? `<p style="text-align:center;font-style:italic;">${sec.instructions}</p>` : ''}
      ${(sec.questions || []).map((q, qIdx) => renderQuestion(q, formatQuestionNumber(sIdx, qIdx))).join('')}
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${paper.examName}</title></head>
<body style="font-family:Georgia,serif;padding:24px;color:#111;">
  <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:16px;">
    ${school?.logoUrl ? `<img src="${school.logoUrl}" crossorigin="anonymous" style="height:64px;margin-bottom:8px;" />` : ''}
    <h1 style="margin:4px 0;font-size:20px;">${school?.name || 'School Name'}</h1>
    ${school?.address ? `<p style="font-size:12px;color:#555;">${school.address}</p>` : ''}
    <h2 style="margin-top:12px;">${paper.examName}</h2>
    <p style="font-size:13px;">
      Subject: ${paper.subjectName}
      ${paper.className ? ` | Class: ${paper.className}` : ''}
      ${paper.sectionName ? ` - ${paper.sectionName}` : ''}
      ${paper.examDate ? ` | Date: ${paper.examDate}` : ''}
      | Duration: ${paper.duration} | Total Marks: ${paper.totalMarks}
    </p>
  </div>
  ${paper.instructions ? `<div style="background:#f5f5f5;padding:12px;margin-bottom:16px;"><strong>Instructions:</strong><br/>${paper.instructions}</div>` : ''}
  ${sections}
  <p style="margin-top:24px;font-size:11px;color:#888;text-align:center;">Generated by TeachoVE</p>
</body></html>`;
}

export async function exportPaperAsPdf(paper: GeneratedQuestionPaper, school?: SchoolInfo): Promise<void> {
  const { paper: safePaper, school: safeSchool } = await preparePaperForExport(paper, school);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Could not create print frame');
  }

  doc.open();
  doc.write(buildPaperHtml(safePaper, safeSchool));
  doc.close();

  await new Promise((resolve) => setTimeout(resolve, 400));

  const body = doc.body;
  if (!body) {
    document.body.removeChild(iframe);
    throw new Error('Could not render paper');
  }

  try {
    await exportElementAsPdf(body, paper.examName || 'question-paper');
  } finally {
    document.body.removeChild(iframe);
  }
}

export async function exportPaperAsWord(paper: GeneratedQuestionPaper, school?: SchoolInfo): Promise<void> {
  const { paper: safePaper, school: safeSchool } = await preparePaperForExport(paper, school);
  const html = buildPaperHtml(safePaper, safeSchool);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${paper.examName || 'question-paper'}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getCreatorLabel(paper: GeneratedQuestionPaper): string {
  const role =
    paper.createdByRole === 'school'
      ? 'School Admin'
      : paper.createdByRole === 'teacher'
        ? 'Teacher Admin'
        : 'Unknown';
  if (paper.createdByName) return `${role} · ${paper.createdByName}`;
  return role;
}
