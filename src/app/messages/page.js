import ContactAdminPage from "@/components/contact/ContactAdminPage";
import { getContactBundle } from "@/lib/content-store";

export default async function MessagesPage() {
  const { contactDetails, messages } = await getContactBundle();
  return <ContactAdminPage initialContactDetails={contactDetails} initialMessages={messages} />;
}
