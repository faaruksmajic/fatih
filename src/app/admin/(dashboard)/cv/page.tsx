import { PageHead } from "../../PageHead";
import { getCvUrl } from "@/db/queries";
import { CvUploadForm } from "./CvUploadForm";

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const currentCvUrl = await getCvUrl();

  return (
    <>
      <PageHead title="CV" sub="The PDF behind the “Download CV” button on the site." />
      <CvUploadForm currentCvUrl={currentCvUrl} />
    </>
  );
}
