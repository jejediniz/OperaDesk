import { notFound } from "next/navigation";
import DevUiGallery from "./DevUiGallery";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "UI kit (dev)",
  robots: { index: false, follow: false }
};

export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-od-bg py-10 text-od-text">
      <DevUiGallery />
    </div>
  );
}
