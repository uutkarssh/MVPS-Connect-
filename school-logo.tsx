import { cn } from "@/lib/utils";

export function SchoolLogo({ className, showAppName = true }: { className?: string; showAppName?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {showAppName && (
        <span className="text-2xl font-bold font-headline text-primary">
          MVPS Connect
        </span>
      )}
    </div>
  );
}
