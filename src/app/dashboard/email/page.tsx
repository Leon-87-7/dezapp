import { Mail } from "lucide-react";

export default function EmailPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-8 w-8 text-stone-600" />
        <h1 className="text-2xl font-bold text-stone-900">Email</h1>
      </div>
      <p className="text-stone-600">
        Email composer coming in Phase 3.
      </p>
    </div>
  );
}
