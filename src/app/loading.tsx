import { LogoSpinner } from "@/components/common/AnimatedLogo";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LogoSpinner size={48} />
    </div>
  );
}
