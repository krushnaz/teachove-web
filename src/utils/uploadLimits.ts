export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_PDF_SIZE_MB = 50;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePdfFile(file: File): string | null {
  if (file.type && file.type !== 'application/pdf') {
    return 'Only PDF files are allowed.';
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'Only PDF files are allowed.';
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return `File is too large (${formatFileSize(file.size)}). Maximum size is ${MAX_PDF_SIZE_MB}MB.`;
  }
  return null;
}
