import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";
import { ClientPage } from "./ClientPage";

export default async function Home() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/handler/sign-up"); 
  }
  const safeUser = {
    displayName: user.displayName ?? "",
  };
  console.log(user?.displayName);
  return <ClientPage user={safeUser} />;
}
