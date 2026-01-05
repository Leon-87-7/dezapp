import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-8 w-8 text-stone-600" />
        <h1 className="text-2xl font-bold text-stone-900">AI Search</h1>
      </div>
      <p className="text-stone-600">
        AI-powered search coming in Phase 5.
      </p>
    </div>
  );
}
