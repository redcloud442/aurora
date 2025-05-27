"use client";

import { createClientSide } from "@/utils/supabase/client";
import { company_promo_table } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import BannerDelete from "./BannerDelete";
import BannerEdit from "./BannerEdit";
import { BannerForm } from "./BannerForm";

type BannerPageProps = {
  banners: company_promo_table[];
};

const BannerPage = ({ banners: initialBanners }: BannerPageProps) => {
  const supabaseClient = createClientSide();

  const [banners, setBanners] = useState<company_promo_table[]>(initialBanners);
  const [editingBanner, setEditingBanner] =
    useState<company_promo_table | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (
    data: Partial<{ company_promo_image: File | string }>
  ) => {
    if (typeof data.company_promo_image === "string") {
      return;
    }

    const file = data.company_promo_image as File;

    const filePath = `uploads/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("PACKAGE_IMAGES")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error("File upload failed.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/PACKAGE_IMAGES/${filePath}`;

    if (editingBanner) {
      const res = await fetch(
        `/api/v1/banner/${editingBanner.company_promo_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            company_promo_image: publicUrl,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const updated = await res.json();
      setBanners((prev) =>
        prev.map((b) =>
          b.company_promo_id === updated.company_promo_id ? updated : b
        )
      );
    } else {
      const res = await fetch("/api/v1/banner", {
        method: "POST",
        body: JSON.stringify({
          company_promo_image: publicUrl,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const created = await res.json();
      setBanners((prev) => [...prev, created]);
    }
    setEditingBanner(null);
  };

  const handleDeleteBanner = async (banner: company_promo_table) => {
    const res = await fetch(`/api/v1/banner/${banner.company_promo_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const deleted = await res.json();
    setBanners((prev) =>
      prev.filter((b) => b.company_promo_id !== deleted.company_promo_id)
    );
  };

  const handleSelectBanner = (banner: company_promo_table) => {
    setEditingBanner(banner);
    setIsOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Banner Management</h1>

      <BannerForm initialData={undefined} onSubmit={handleSubmit} />

      <hr />

      <h2 className="text-xl font-semibold">Banner List</h2>
      <ul className="space-y-4 flex gap-4">
        {banners.map((banner) => (
          <li key={banner.company_promo_id} className="space-y-4 relative">
            <Image
              src={banner.company_promo_image}
              alt={banner.company_promo_id}
              width={500}
              height={500}
            />
            <BannerEdit
              banner={banner}
              onSubmit={handleSubmit}
              isOpen={isOpen}
              editingBanner={editingBanner}
              handleSelectBanner={handleSelectBanner}
              setIsOpen={setIsOpen}
            />
            <BannerDelete banner={banner} onSubmit={handleDeleteBanner} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BannerPage;
