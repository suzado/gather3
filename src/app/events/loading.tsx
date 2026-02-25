import { LogoSpinner } from "@/components/common/AnimatedLogo";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <LogoSpinner size={32} />
      </div>
      <LoadingSkeleton count={6} />
    </div>
  );
}
