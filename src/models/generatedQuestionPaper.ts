export type QuestionType =
  | 'mcq'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_blank'
  | 'match_following'
  | 'one_word'
  | 'diagram';

export type PaperStatus = 'draft' | 'published' | 'archived';

export type PaperTemplate =
  | 'classic'
  | 'cbse'
  | 'state_board'
  | 'icse'
  | 'minimal'
  | 'modern'
  | 'custom';

export interface McqOptions {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

export interface MatchPairs {
  left: string[];
  right: string[];
}

export interface SubQuestion {
  id: string;
  questionText: string;
  marks: number;
  orderNo: number;
}

export interface QuestionItem {
  id: string;
  questionType: QuestionType;
  questionText: string;
  imageUrls: string[];
  options?: McqOptions | null;
  correctAnswer?: string | null;
  answerExplanation?: string;
  suggestedAnswer?: string;
  marks: number;
  negativeMarks?: number | null;
  matchPairs?: MatchPairs;
  subQuestions?: SubQuestion[];
  orderNo: number;
  collapsed?: boolean;
  /** AI-ready metadata for future generation */
  aiMetadata?: {
    bloomLevel?: string;
    chapter?: string;
    difficulty?: string;
    generatedBy?: string;
  } | null;
}

export interface PaperSection {
  id: string;
  name: string;
  instructions: string;
  orderNo: number;
  questions: QuestionItem[];
}

export interface GeneratedQuestionPaper {
  id?: string;
  paperId?: string;
  schoolId?: string;
  yearId?: string;
  createdBy?: string | null;
  createdByRole?: 'school' | 'teacher';
  createdByName?: string | null;
  examName: string;
  subjectId?: string | null;
  subjectName: string;
  classId?: string | null;
  className?: string | null;
  sectionId?: string | null;
  sectionName?: string | null;
  totalMarks: number;
  duration: string;
  examDate?: string | null;
  examTime?: string | null;
  instructions: string;
  passingMarks?: number | null;
  internalNotes?: string;
  academicYear?: string;
  medium?: string;
  template: PaperTemplate;
  status: PaperStatus;
  sections: PaperSection[];
  totalQuestions?: number;
  calculatedMarks?: number;
  remainingMarks?: number;
  marksExceeded?: boolean;
  version?: number;
  parentPaperId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface QuestionBankItem {
  id?: string;
  schoolId?: string;
  questionType: QuestionType;
  questionText: string;
  imageUrls: string[];
  options?: McqOptions | null;
  correctAnswer?: string | null;
  answerExplanation?: string;
  suggestedAnswer?: string;
  marks: number;
  negativeMarks?: number | null;
  matchPairs?: MatchPairs;
  subQuestions?: SubQuestion[];
  subjectId?: string | null;
  subjectName?: string;
  chapter?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdBy?: string | null;
  aiMetadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaperVersion {
  id: string;
  versionId: string;
  version: number;
  snapshot: GeneratedQuestionPaper;
  savedAt: string;
  savedBy?: string | null;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice (MCQ)',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blanks',
  match_following: 'Match the Following',
  one_word: 'One Word Answer',
  diagram: 'Diagram / Image Based',
};

export const PAPER_TEMPLATES: { value: PaperTemplate; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'cbse', label: 'CBSE' },
  { value: 'state_board', label: 'State Board' },
  { value: 'icse', label: 'ICSE' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'modern', label: 'Modern' },
  { value: 'custom', label: 'Custom School Template' },
];

export const MEDIUM_OPTIONS = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Urdu'];
