import { Skeleton } from "@/components/ui/skeleton";
import UserAdminProfile from "@/components/UserAdminProfile/UserAdminProfile";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "User Profile Records",
  description: "List of User Records",
  openGraph: {
    url: "/admin/users",
  },
};

const handleFetchUserProfile = async (userId: string) => {
  const userProfile = await fetch(
    `${process.env.API_URL}/api/v1/user/${userId}`,
    {
      method: "GET",
      headers: {
        cookie: (await cookies()).toString(),
      },
    }
  );

  if (!userProfile.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return userProfile.json();
};

const Page = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;

  const { profile, userProfile, teamMemberProfile } =
    await handleFetchUserProfile(userId);

  const combinedData = {
    ...userProfile,
    ...profile,
    ...teamMemberProfile,
  };

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full max-w-3xl" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      }
    >
      <UserAdminProfile profile={profile} userProfile={combinedData} />
    </Suspense>
  );
};

export default Page;
