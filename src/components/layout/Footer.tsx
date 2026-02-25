import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" variant="mark" className="text-white" />
            <span className="text-sm font-semibold gradient-text">Gather3</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              Built on{" "}
              <Link
                href="https://arkiv.network"
                target="_blank"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Arkiv
              </Link>
            </span>
            <span>
              <Link
                href="https://github.com"
                target="_blank"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Own your events. Own your data.
          </p>
        </div>
      </div>
    </footer>
  );
}
