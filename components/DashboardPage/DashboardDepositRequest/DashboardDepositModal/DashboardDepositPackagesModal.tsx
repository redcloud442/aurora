"use client";

import AvailPackagePage from "@/components/AvailPackagePage/AvailPackagePage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PackageCard from "@/components/ui/packageCard";
import { package_table } from "@prisma/client";
import { useState } from "react";

type Props = {
  packages: package_table[];
};

const DashboardDepositModalPackages = ({ packages }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );

  const handlePackageSelect = (pkg: package_table) => {
    setSelectedPackage(pkg);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedPackage(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedPackage(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-xl px-4 sm:w-full sm:max-w-xs sm:h-12">
          BUY PACKAGE
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>BUY PACKAGE</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-1 gap-4">
          {!selectedPackage &&
            packages.map((pkg) => (
              <PackageCard
                key={pkg.package_id}
                packages={pkg}
                onClick={() => handlePackageSelect(pkg)}
              />
            ))}

          {selectedPackage && (
            <AvailPackagePage
              selectedPackage={selectedPackage}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalPackages;
