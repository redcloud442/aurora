import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { registerUserCodeSchema } from "@/utils/schema";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ AURORAREFER: string }>;
}) {
  const { AURORAREFER } = await searchParams;

  return {
    title: "Aurora ito na and SIMULA",
    openGraph: {
      url: `https://www.auroraphil.com/auth/register?AURORAREFER=${AURORAREFER}`,
      title: `Aurora ito na and SIMULA`,
      siteName: "https://www.auroraphil.com",
      images: [
        {
          url: "https://www.auroraphil.com/assets/icons/logo.ico",
          width: 1200,
          height: 630,
          alt: "Aurora Registration Banner",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Aurora ito na and SIMULA`,

      images: ["https://www.auroraphil.com/assets/icons/logo.ico"],
    },
  };
}

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ AURORAREFER: string }>;
}) => {
  const { AURORAREFER } = await searchParams;

  if (!AURORAREFER) {
    redirect("/auth/login");
  }

  const result = await registerUserCodeSchema.safeParseAsync({
    code: AURORAREFER,
  });

  if (!result.success) {
    redirect("/auth/login");
  }

  const { code } = result.data;

  const user = await prisma.user_table.findFirstOrThrow({
    where: {
      company_member_table: {
        some: {
          company_referral_link_table: {
            some: {
              company_referral_code: code,
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
    <RegisterPage referralLink={code} userName={user?.user_username || ""} />
  );
};

export default Page;
