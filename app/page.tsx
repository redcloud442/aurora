import { redirect } from "next/navigation";

export default function Home() {
  redirect("/access/login");
}
