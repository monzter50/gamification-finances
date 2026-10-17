import { Skeleton } from "@/components/ui";

/** Shown while a page's code chunk loads: a page-header + content outline. */
export const PageFallback = () => (
  <div className="space-y-stack" aria-busy="true" aria-label="Loading page">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);
