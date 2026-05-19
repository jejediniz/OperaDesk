import { SkeletonCard } from "@/components/ui";

export default function AppShellLoading({ variant = "app" }) {
  if (variant === "login") {
    return (
      <div className="center-page login-loading" aria-busy="true" aria-live="polite">
        <div className="login-loading__card">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="center-page app-shell-loading" aria-busy="true" aria-live="polite">
      <div className="app-shell-loading__grid">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  );
}
