import { package_table } from "@prisma/client";
import Image from "next/image";

type Props = {
  onClick: () => void;
  packages: package_table;
};

const PackageCard = ({ onClick, packages }: Props) => {
  return (
    <div className="relative">
      <Image
        src={packages.package_image || ""}
        alt={packages.package_name}
        width={800}
        height={800}
        priority
        onClick={onClick}
        className={`rounded-md cursor-pointer transition-transform hover:scale-105`}
      />
    </div>
  );
};

export default PackageCard;
