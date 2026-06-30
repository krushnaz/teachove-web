import {
  GeneratedQuestionPaper,
  PaperSection,
  QuestionItem,
  QuestionType,
} from '../../../models/generatedQuestionPaper';

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyQuestion(type: QuestionType, orderNo: number): QuestionItem {
  const base: QuestionItem = {
    id: uid(),
    questionType: type,
    questionText: '',
    imageUrls: [],
    marks: 1,
    orderNo,
    collapsed: false,
  };

  switch (type) {
    case 'mcq':
      return {
        ...base,
        options: { A: '', B: '', C: '', D: '', E: '' },
        correctAnswer: null,
        negativeMarks: null,
      };
    case 'true_false':
      return { ...base, correctAnswer: 'true' };
    case 'fill_blank':
    case 'one_word':
      return { ...base, correctAnswer: '' };
    case 'match_following':
      return {
        ...base,
        matchPairs: { left: ['', ''], right: ['', ''] },
      };
    case 'short_answer':
    case 'long_answer':
      return { ...base, suggestedAnswer: '' };
    default:
      return base;
  }
}

export function createEmptySection(orderNo: number): PaperSection {
  return {
    id: uid(),
    name: `Section ${String.fromCharCode(64 + orderNo)}`,
    instructions: '',
    orderNo,
    questions: [],
  };
}

export function createEmptyPaper(): GeneratedQuestionPaper {
  return {
    examName: '',
    subjectName: '',
    totalMarks: 100,
    duration: '3:00',
    instructions: '',
    template: 'classic',
    status: 'draft',
    sections: [createEmptySection(1)],
    passingMarks: null,
    internalNotes: '',
    academicYear: '',
    medium: 'English',
  };
}

export function computeMarksStats(paper: GeneratedQuestionPaper) {
  let totalQuestions = 0;
  let calculatedMarks = 0;
  const sectionStats = (paper.sections || []).map((sec) => {
    const qCount = sec.questions?.length || 0;
    const secMarks = (sec.questions || []).reduce((s, q) => s + (Number(q.marks) || 0), 0);
    totalQuestions += qCount;
    calculatedMarks += secMarks;
    return { sectionId: sec.id, name: sec.name, questionCount: qCount, marks: secMarks };
  });
  const totalMarks = Number(paper.totalMarks) || 0;
  return {
    totalQuestions,
    calculatedMarks,
    sectionStats,
    remainingMarks: totalMarks - calculatedMarks,
    marksExceeded: calculatedMarks > totalMarks,
  };
}

export function formatQuestionNumber(sectionIndex: number, qIndex: number): string {
  return `${qIndex + 1}.`;
}

export function formatSubQuestionNumber(index: number): string {
  return `(${String.fromCharCode(97 + index)})`;
}

export function reorder<T extends { orderNo: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, orderNo: i + 1 }));
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export const MATH_SYMBOLS = [
  '±', '×', '÷', '≠', '≤', '≥', '≈', '∞', '√', '∑', '∫', 'π', 'θ', 'α', 'β', 'γ', 'Δ', '°', '²', '³', '½', '¼', '→', '←', '↔',
];
