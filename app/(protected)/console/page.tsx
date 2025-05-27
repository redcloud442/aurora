// app/dashboard/page.tsx

import DashboardPage from "@/components/DashboardPage/DashboardPage";
import { Skeleton } from "@/components/ui/skeleton";
import { cookies } from "next/headers";
import { Suspense } from "react";

const handleFetchPackages = async () => {
  const res = await fetch(`${process.env.API_URL}/api/v1/package`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie: (await cookies()).toString(),
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch packages");
  }
  const { data } = await res.json();

  return data;
};

const handleFetchBanners = async () => {
  const res = await fetch(`${process.env.API_URL}/api/v1/banner`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie: (await cookies()).toString(),
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch banners");
  }
  const data = await res.json();

  return data;
};

const Page = async () => {
  const [packages, banners] = await Promise.all([
    handleFetchPackages(),
    handleFetchBanners(),
  ]);
  return (
    <Suspense fallback={<Skeleton className="h-full w-full p-4" />}>
      <DashboardPage packages={packages} banners={banners} />
    </Suspense>
  );
};

export default Page;
