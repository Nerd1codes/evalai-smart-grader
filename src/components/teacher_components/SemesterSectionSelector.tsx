// src/components/teacher_components/SemesterSectionSelector.tsx

import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { Semesters } from "../../types";

interface SemesterSectionSelectorProps {
  semesters: Semesters;
  selectedSemester: string | null;
  selectedSection: string | null;
  isSemesterDropdownOpen: boolean;
  isSectionDropdownOpen: boolean;
  onSemesterSelect: (semester: string) => void;
  onSectionSelect: (section: string) => void;
  onToggleSemesterDropdown: () => void;
  onToggleSectionDropdown: () => void;
  onAddSemester: () => void;
  onAddSection: () => void;
}

export const SemesterSectionSelector = ({
  semesters,
  selectedSemester,
  selectedSection,
  isSemesterDropdownOpen,
  isSectionDropdownOpen,
  onSemesterSelect,
  onSectionSelect,
  onToggleSemesterDropdown,
  onToggleSectionDropdown,
  onAddSemester,
  onAddSection,
}: SemesterSectionSelectorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">Select Semester and Section</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={onAddSemester}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>
          {selectedSemester && (
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={onAddSection}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Semester Dropdown */}
        <div className="relative">
          <button
            onClick={onToggleSemesterDropdown}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium"
          >
            {selectedSemester || "Select Semester"}
            <ChevronDown className="h-4 w-4" />
          </button>

          {isSemesterDropdownOpen && (
            <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {Object.keys(semesters).map((sem) => (
                <button
                  key={sem}
                  onClick={() => onSemesterSelect(sem)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedSemester === sem
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "text-slate-900"
                  }`}
                >
                  {sem}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section Dropdown */}
        {selectedSemester && (
          <div className="relative">
            <button
              onClick={onToggleSectionDropdown}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-900 font-medium"
            >
              {selectedSection || "Select Section"}
              <ChevronDown className="h-4 w-4" />
            </button>

            {isSectionDropdownOpen && (
              <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {Object.keys(semesters[selectedSemester].sections).map((section) => (
                  <button
                    key={section}
                    onClick={() => onSectionSelect(section)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedSection === section
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "text-slate-900"
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};