export function Skeleton({ width, height = 14, radius = 5, className = "", style }) {
  const merged = {
    width: width ?? "100%",
    height,
    borderRadius: radius,
    ...style,
  };
  return <span className={`skeleton ${className}`.trim()} style={merged} aria-hidden="true" />;
}

export function SkeletonRow({ columns = 6 }) {
  return (
    <div className="skeleton-row" aria-hidden="true">
      {Array.from({ length: columns }).map((_, idx) => (
        <Skeleton key={idx} height={14} width={idx === 0 ? "60%" : "80%"} />
      ))}
    </div>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Skeleton width="40%" height={16} />
      <Skeleton width="80%" height={20} />
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} width={idx === lines - 1 ? "60%" : "100%"} height={12} />
      ))}
    </div>
  );
}

export default Skeleton;
