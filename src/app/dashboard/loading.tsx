import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse mb-8" />
      <LoadingSkeleton count={4} />
    </div>
  );
}
