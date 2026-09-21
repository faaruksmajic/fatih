import { getCvUrl } from "@/db/queries";
import { CvUploadForm } from "./CvUploadForm";

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const currentCvUrl = await getCvUrl();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">CV</h1>
      <CvUploadForm currentCvUrl={currentCvUrl} />
    </div>
  );
}
