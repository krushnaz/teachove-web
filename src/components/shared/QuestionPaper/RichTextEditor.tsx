import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { MATH_SYMBOLS } from './utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  minHeight?: string;
  readOnly?: boolean;
}

const ToolbarButton: React.FC<{
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ active, onClick, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`px-2 py-1 text-xs rounded border transition-colors flex-shrink-0 touch-manipulation ${
      active
        ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  onImageUpload,
  minHeight = '80px',
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Subscript,
      Superscript,
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  const insertSymbol = useCallback(
    (symbol: string) => {
      editor?.chain().focus().insertContent(symbol).run();
    },
    [editor]
  );

  const handleImage = useCallback(async () => {
    if (!editor || !onImageUpload) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        /* handled by caller */
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {!readOnly && (
        <div className="flex flex-nowrap gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 overflow-x-auto scrollbar-thin">
          <ToolbarButton
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('subscript')}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            title="Subscript"
          >
            X<sub>₂</sub>
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('superscript')}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            title="Superscript"
          >
            X<sup>²</sup>
          </ToolbarButton>
          {onImageUpload && (
            <ToolbarButton onClick={handleImage} title="Insert image">
              🖼 Image
            </ToolbarButton>
          )}
          <select
            className="text-xs px-1 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex-shrink-0"
            onChange={(e) => {
              if (e.target.value) insertSymbol(e.target.value);
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Σ Symbols
            </option>
            {MATH_SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-3 focus:outline-none [&_.ProseMirror]:min-h-[var(--min-h)] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
        style={{ '--min-h': minHeight } as React.CSSProperties}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
