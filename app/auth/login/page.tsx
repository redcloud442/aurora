import LoginPage from "@/components/loginPage/loginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aurora Login",
  openGraph: {
    url: "https://www.auroraphil.com/auth/login",
    title: "Aurora",
    description: "Log in to your Aurora account and manage your journey.",
    siteName: "Aurora",
    images: [
      {
        url: "https://www.auroraphil.com/assets/icons/logo.ico",
        width: 1200,
        height: 630,
        alt: "Aurora Login Page",
      },
    ],
    type: "website",
  },
};
const Page = async () => {
  return <LoginPage />;
};
export default Page;
