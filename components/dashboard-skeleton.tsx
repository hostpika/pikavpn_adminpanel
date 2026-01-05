
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-8">
            <div>
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-6 w-96" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-[2rem]" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[400px] rounded-[2rem]" />
                <Skeleton className="h-[400px] rounded-[2rem]" />
                <Skeleton className="h-[400px] rounded-[2rem] lg:col-span-2" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[280px] rounded-[2rem]" />
                ))}
            </div>
        </div>
    )
}
