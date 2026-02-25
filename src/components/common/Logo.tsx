import { cn } from "@/lib/utils";

const sizes = {
  sm: { mark: 20, text: "text-sm" },
  md: { mark: 28, text: "text-lg" },
  lg: { mark: 40, text: "text-2xl" },
} as const;

interface LogoProps {
  size?: keyof typeof sizes;
  variant?: "mark" | "full";
  className?: string;
}

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
    >
      <g transform="rotate(0, 32, 32)">
        <path
          d="M29 23 L27.5 9 A4.5 4.5 0 0 1 36.5 9 L35 23 A3 3 0 0 1 29 23Z"
          transform="rotate(15, 32, 16)"
        />
      </g>
      <g transform="rotate(120, 32, 32)">
        <path
          d="M29 23 L27.5 9 A4.5 4.5 0 0 1 36.5 9 L35 23 A3 3 0 0 1 29 23Z"
          transform="rotate(15, 32, 16)"
        />
      </g>
      <g transform="rotate(240, 32, 32)">
        <path
          d="M29 23 L27.5 9 A4.5 4.5 0 0 1 36.5 9 L35 23 A3 3 0 0 1 29 23Z"
          transform="rotate(15, 32, 16)"
        />
      </g>
    </svg>
  );
}

export function Logo({ size = "md", variant = "full", className }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={s.mark} />
      {variant === "full" && (
        <span className={cn("font-bold tracking-tight", s.text)}>
          <span>Gather</span>
          <span className="font-mono">3</span>
        </span>
      )}
    </div>
  );
}
