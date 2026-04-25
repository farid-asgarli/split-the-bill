import { Skeleton, SkeletonBillItem } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg">
      {/* Restaurant header skeleton */}
      <div className="flex items-center gap-4 px-4 py-5">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Bill items skeleton */}
      <div className="px-4">
        <Skeleton className="mt-3 mb-2 h-3 w-20" />
        <SkeletonBillItem />
        <SkeletonBillItem />

        <Skeleton className="mt-5 mb-2 h-3 w-16" />
        <SkeletonBillItem />
        <SkeletonBillItem />
        <SkeletonBillItem />

        <Skeleton className="mt-5 mb-2 h-3 w-20" />
        <SkeletonBillItem />
        <SkeletonBillItem />
      </div>

      {/* Bottom bar skeleton */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface-elevated px-4 pb-4 pt-3">
        <div className="mx-auto max-w-lg space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-2 flex justify-between">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
