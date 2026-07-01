import { Loader2 } from "lucide-react";

export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF87]" />
        <p className="text-zinc-500 text-sm font-medium tracking-wide">
          Loading your report...
        </p>
      </div>
    </div>
  );
}
