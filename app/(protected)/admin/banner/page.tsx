import BannerPage from "@/components/BannerPage/BannerPage";
import prisma from "@/utils/prisma";

const page = async () => {
  const banners = await prisma.company_promo_table.findMany();
  return <BannerPage banners={banners} />;
};

export default page;
