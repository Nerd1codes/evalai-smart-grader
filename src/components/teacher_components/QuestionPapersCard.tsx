// src/components/teacher_components/QuestionPapersCard.tsx

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  BookOpen,
  Trash2,
  Loader2,
  RefreshCcw,
  Eye,
} from "lucide-react";
import { UploadedPaper } from "../../types";

interface QuestionPapersCardProps {
  selectedSemester: string;
  selectedSection: string;
  papers: UploadedPaper[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (index: number) => void;
  onRetryOCR: (index: number) => void;
  onViewOCR: (paper: UploadedPaper) => void;
}

export const QuestionPapersCard = ({
  selectedSemester,
  selectedSection,
  papers,
  onUpload,
  onDelete,
  onRetryOCR,
  onViewOCR,
}: QuestionPapersCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mb-8 border-slate-200 shadow-lg bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Question Papers - {selectedSemester} / {selectedSection}
            </CardTitle>
            <CardDescription>Upload and OCR question papers</CardDescription>
          </div>
          <Button
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Question Paper
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {papers && papers.length > 0 ? (
          <div className="space-y-3">
            {papers.map((paper, index) => (
              <div
                key={`${paper.name}-${index}`}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{paper.subject}</p>
                    <p className="text-sm text-slate-600">{paper.name}</p>
                    {paper.pages ? (
                      <p className="text-xs text-slate-500">{paper.pages} page(s)</p>
                    ) : null}
                    {paper.ocrStatus === "processing" && (
                      <div className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Running OCR…
                      </div>
                    )}
                    {paper.ocrStatus === "error" && (
                      <p className="mt-1 text-xs text-red-600">
                        OCR failed: {paper.ocrError || "Unknown error"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-slate-900 hover:bg-slate-100"
                    onClick={() => {
                      if (paper.ocrStatus === "done") {
                        onViewOCR(paper);
                      } else {
                        window.alert("OCR not ready yet for this file.");
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View OCR
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetryOCR(index)}
                    className="hover:bg-slate-100"
                  >
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Retry OCR
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No question papers uploaded yet</p>
            <p className="text-sm">Click "Upload Question Paper" to add one</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={onUpload}
          className="hidden"
          accept=".pdf"
        />
      </CardContent>
    </Card>
  );
};