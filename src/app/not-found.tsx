import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 mb-6">
        <Search className="h-8 w-8 text-violet-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline">Go Home</Button>
        </Link>
        <Link href="/events">
          <Button className="bg-gradient-to-r from-violet-600 to-blue-600">
            Browse Events
          </Button>
        </Link>
      </div>
    </div>
  );
}
