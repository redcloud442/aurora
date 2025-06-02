// app/dashboard/page.tsx

import DashboardPage from "@/components/DashboardPage/DashboardPage";
import { cookies } from "next/headers";
import { Suspense } from "react";
import Loading from "../loading";

const handleFetchPackages = async () => {
  const res = await fetch(`${process.env.API_URL}/api/v1/package`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie: (await cookies()).toString(),
    },
    next: {
      revalidate: 60,
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
    next: {
      revalidate: 60,
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
    <Suspense fallback={<Loading />}>
      <DashboardPage packages={packages} banners={banners} />
    </Suspense>
  );
};

export default Page;
