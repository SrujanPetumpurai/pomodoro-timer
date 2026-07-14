import { auth } from "@/auth";
import NavBarClient from "./NavbarClient";

export default async function NavBar() {
  const session = await auth();

  return <NavBarClient user={session?.user ?? null} />;
}