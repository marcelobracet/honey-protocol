import { HoneyApp } from "@/components/honey-app";
import { getUserEmail } from "@/lib/auth";

export default async function Home() {
  const userEmail = await getUserEmail();
  return <HoneyApp userEmail={userEmail} />;
}
