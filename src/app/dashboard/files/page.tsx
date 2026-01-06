import { FolderOpen } from "lucide-react";

export default function FilesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <FolderOpen className="h-8 w-8 text-stone-600" />
        <h1 className="text-2xl font-bold text-stone-900">Files</h1>
      </div>
      <p className="text-stone-600">
        File management coming in Phase 2.
      </p>
    </div>
  );
}
