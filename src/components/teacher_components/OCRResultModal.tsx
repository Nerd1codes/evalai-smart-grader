// src/components/teacher_components/OCRResultModal.tsx

import { Button } from "@/components/ui/button";
import { Clipboard, X } from "lucide-react";

interface OCRResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  filename: string;
  text?: string;
  pages?: number;
  onCopy: () => void;
}

export const OCRResultModal = ({
  isOpen,
  onClose,
  subject,
  filename,
  text,
  pages,
  onCopy,
}: OCRResultModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl border border-slate-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">OCR Result</h3>
            <p className="text-sm text-slate-600">
              <span className="font-medium">{subject}</span> • {filename}
              {typeof pages === "number" ? ` • ${pages} page(s)` : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCopy}>
              <Clipboard className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <div className="h-[60vh] overflow-auto bg-slate-50 border border-slate-200 rounded-xl p-4 leading-relaxed text-slate-900 whitespace-pre-wrap">
          {text || "No text available."}
        </div>
      </div>
    </div>
  );
};