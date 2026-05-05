import CareersAdminPage from "@/components/careers/CareersAdminPage";
import { getCareersBundle } from "@/lib/content-store";

export default async function VacanciesPage() {
  const { vacancies, applications } = await getCareersBundle();
  return <CareersAdminPage initialVacancies={vacancies} initialApplications={applications} />;
}
