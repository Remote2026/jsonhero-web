import { useCallback, useEffect, useState } from "react";
import { Form, useTransition } from "remix";
import { DragAndDropForm } from "./DragAndDropForm";
import { useTranslation, Trans } from "react-i18next";

type NewDocumentPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NewDocumentPanel({ isOpen, onClose }: NewDocumentPanelProps) {
  const { t } = useTranslation();
  const transition = useTransition();
  const isSubmitting = transition.state !== "idle";
  const [inputValue, setInputValue] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close panel when form submission starts (navigation to /j/$id follows)
  useEffect(() => {
    if (isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Reset input when panel opens
  useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.currentTarget.form?.requestSubmit();
      }
    },
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="relative w-[480px] h-full bg-white dark:bg-slate-900 shadow-xl
                   border-l border-slate-200 dark:border-slate-700
                   animate-slide-in-right overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t("newDocument.title")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("newDocument.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Textarea - unified input for JSON or URL */}
          <Form method="post" action="/actions/createFromUrl">
            <div>
              <label
                htmlFor="new-doc-input"
                className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider"
              >
                {t("newDocument.inputLabel")}
              </label>
              <textarea
                id="new-doc-input"
                name="jsonUrl"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={t("newDocument.placeholder")}
                rows={6}
                className="w-full min-h-[140px] p-3 text-sm font-mono
                           bg-white dark:bg-slate-800
                           border border-slate-300 dark:border-slate-600
                           rounded-lg resize-y
                           text-slate-800 dark:text-slate-200
                           placeholder-slate-400 dark:placeholder-slate-500
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition outline-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting}
              className="w-full mt-4 py-2.5 px-4 bg-lime-500 text-slate-900
                         font-bold text-sm rounded-lg uppercase
                         hover:bg-lime-600 transition
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("newDocument.opening") : t("newDocument.openJson")}
            </button>
          </Form>

          {/* Drag & Drop */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
              <span className="text-xs text-slate-400">{t("newDocument.or")}</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            </div>
            <DragAndDropForm />
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            <Trans i18nKey="newDocument.keyboardHint">
              Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded font-mono text-xs">Ctrl+Enter</kbd> to submit
            </Trans>
          </p>
        </div>
      </div>
    </div>
  );
}
