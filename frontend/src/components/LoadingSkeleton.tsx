"use client";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  lines?: number;
}

export default function LoadingSkeleton({
  className = "",
  variant = "rectangular",
  lines = 1,
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-surface-tertiary";

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
              width: i === lines - 1 ? "80%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-border rounded-lg bg-surface">
      <LoadingSkeleton className="h-8 w-3/4 mb-4" />
      <LoadingSkeleton variant="text" lines={3} />
      <div className="mt-4 flex gap-2">
        <LoadingSkeleton className="h-10 w-24" />
        <LoadingSkeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
