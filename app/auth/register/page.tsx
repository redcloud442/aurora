import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ referralCode: string }>;
}) {
  const { referralCode } = await searchParams;

  return {
    title: "Aurora ito na and SIMULA",
    description:
      "Join Aurora now — your path to digital prosperity begins here!",
    openGraph: {
      url: `https://www.aurora.io/auth/register?referralCode=${referralCode}`,
      title: `Join Aurora Now! Invited by ${referralCode}`,
      description:
        "Unlock exclusive rewards and opportunities by joining Aurora today.",
      siteName: "aurora.io",
      images: [
        {
          url: "https://www.aurora.io/assets/icons/logo.ico",
          width: 1200,
          height: 630,
          alt: "Aurora Registration Banner",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Join Aurora Now! Invited by ${referralCode}`,
      description: "Be part of the Aurora revolution — register today.",
      images: ["https://www.aurora.io/assets/icons/logo.ico"], // Same or different from OG
    },
  };
}

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ referralCode: string }>;
}) => {
  const { referralCode } = await searchParams;

  if (!referralCode) {
    redirect("/auth/login");
  }

  const user = await prisma.user_table.findFirstOrThrow({
    where: {
      company_member_table: {
        some: {
          company_referral_link_table: {
            some: {
              company_referral_code: referralCode,
            },
          },
          AND: [
            {
              company_member_is_active: true,
            },
          ],
        },
      },
    },
    select: {
      user_username: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <RegisterPage
      referralLink={referralCode}
      userName={user?.user_username || ""}
    />
  );
};

export default Page;
