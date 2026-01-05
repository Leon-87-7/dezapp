import { FileText } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-stone-600" />
        <h1 className="text-2xl font-bold text-stone-900">Notes</h1>
      </div>
      <p className="text-stone-600">
        Notes system coming in Phase 4.
      </p>
    </div>
  );
}
