import { redirect } from "react-router";
import { clearSessionCookie } from "~/lib/auth.server";

export async function action() {
  return redirect("/admin/login", { headers: { "Set-Cookie": clearSessionCookie() } });
}

export function loader() {
  return redirect("/admin");
}
