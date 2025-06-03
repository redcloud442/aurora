"use client";

import { useToast } from "@/hooks/use-toast";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useRole } from "@/utils/context/roleContext";
import { formatNumberLocale } from "@/utils/function";
import { company_promo_table, package_table } from "@prisma/client";
import Image from "next/image";
import { Button } from "../ui/button";
import DashboardPromobanner from "./DashboardComponents/DashboardPromobanner";
import DashboardDepositModalDeposit from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";
import DashboardDepositModalPackages from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal";
import DashboardDirectReferral from "./DashboardDepositRequest/DashboardDepositModal/DashboardDirectReferral";
import TransactionHistory from "./DashboardDepositRequest/DashboardDepositModal/DashboardTransactionHistory";
import DashboardWithdrawalModal from "./DashboardDepositRequest/DashboardDepositModal/DashboardWithdrawalModal";
import DashboardNavigation from "./DashboardNavigation";
import DashboardPackages from "./DashboardPackages";

type Props = {
  packages: package_table[];
  banners: company_promo_table[];
};

const DashboardPage = ({ packages, banners }: Props) => {
  const { referral } = useRole();
  const { totalEarnings } = useUserDashboardEarningsStore();
  const { teamMemberProfile } = useRole();
  const { chartData } = usePackageChartData();
  const { toast } = useToast();

  const handleCopyReferralLink = () => {
    if (!teamMemberProfile.company_member_is_active) {
      toast({
        title: "You need to buy a package to get a referral link",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(`${referral.company_referral_link}`);

    toast({
      title: "Referral Link Copied",
      description: "Referral link copied to clipboard",
    });
  };

  const totalReferral =
    (totalEarnings?.indirectReferralAmount ?? 0) +
    (totalEarnings?.directReferralAmount ?? 0);

  return (
    <>
      <DashboardNavigation />
      <div className="w-full">
        <div className="flex flex-col items-center justify-between min-h-[80vh] sm:min-h-screen p-4 relative">
          {/* Aurora Background */}
          <Image
            src="/assets/icons/AURORA.webp"
            alt="Aurora Background"
            width={1980}
            height={1080}
            className="absolute top-10 left-0 w-full h-full object-none z-40 animate-pulse"
            priority
          />

          <div className="w-full flex justify-between relative z-50">
            <div className="space-y-4 flex flex-col items-start sm:items-stretch sm:w-full">
              <Button
                onClick={handleCopyReferralLink}
                className="rounded-xl px-5 sm:w-full w-auto sm:max-w-sm sm:h-12"
              >
                REFERRAL LINK
              </Button>
              <DashboardDirectReferral />
            </div>

            <div className="space-y-4 flex flex-col justify-end items-end w-full">
              <DashboardDepositModalDeposit />
              <DashboardDepositModalPackages packages={packages} />
            </div>
          </div>

          <div className="space-y-4 z-50 w-full">
            <div className="w-full flex justify-between sm:justify-baseline space-x-2 sm:space-x-4 relative">
              <DashboardWithdrawalModal />

              <Button className="rounded-xl w-auto sm:w-full sm:h-12">
                COMMUNITY
              </Button>
            </div>
            <TransactionHistory />
          </div>
        </div>

        <div className="min-h-auto sm:min-h-min w-full relative">
          <Image
            src="/assets/bg/SECONDARYBG.webp"
            alt="Aurora Background"
            width={1980}
            height={1080}
            className="absolute left-0 w-full h-full object-cover z-40"
            priority
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-50 p-4 h-full">
            <DashboardPromobanner promoBanner={banners} />
            <div className="flex flex-col sm:justify-evenly h-full gap-6">
              {/* Total Profit */}
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-lg sm:text-xl font-bold text-cyan-300 mb-2 tracking-wide">
                  TOTAL PROFIT:
                </h1>
                <div className="w-full relative">
                  <input
                    type="text"
                    className="w-full bg-gray-900/80 border-2 border-cyan-400 rounded-full h-14 px-6 text-white font-semibold text-lg shadow-lg shadow-cyan-400/30 focus:outline-none focus:shadow-cyan-400/50 transition-all duration-300"
                    value={`₱ ${formatNumberLocale(totalEarnings?.totalEarnings ?? 0)}`}
                    readOnly
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse opacity-50"></div>
                </div>
              </div>

              {/* Total Withdrawal */}
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-lg sm:text-xl font-bold text-green-300 mb-2 tracking-wide">
                  TOTAL WITHDRAWAL:
                </h1>
                <div className="w-full relative">
                  <input
                    type="text"
                    className="w-full bg-gray-900/80 border-2 border-green-400 rounded-full h-14 px-6 text-white font-semibold text-lg shadow-lg shadow-green-400/30 focus:outline-none focus:shadow-green-400/50 transition-all duration-300"
                    value={`₱ ${formatNumberLocale(totalEarnings?.withdrawalAmount ?? 0)}`}
                    readOnly
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse opacity-50"></div>
                </div>
              </div>

              {/* Total Referral */}
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-lg sm:text-xl font-bold text-cyan-300 mb-2 tracking-wide">
                  TOTAL REFERRAL:
                </h1>
                <div className="w-full relative">
                  <input
                    type="text"
                    className="w-full bg-gray-900/80 border-2 border-cyan-400 rounded-full h-14 px-6 text-white font-semibold text-lg shadow-lg shadow-cyan-400/30 focus:outline-none focus:shadow-cyan-400/50 transition-all duration-300"
                    value={`₱ ${formatNumberLocale(totalReferral)}`}
                    readOnly
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse opacity-50"></div>
                </div>
              </div>

              {/* Total Package */}
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-lg sm:text-xl font-bold text-purple-300 mb-2 tracking-wide">
                  TOTAL PACKAGE:
                </h1>
                <div className="w-full relative">
                  <input
                    type="text"
                    className="w-full bg-gray-900/80 border-2 border-purple-400 rounded-full h-14 px-6 text-white font-semibold text-lg shadow-lg shadow-purple-400/30 focus:outline-none focus:shadow-purple-400/50 transition-all duration-300"
                    value={`₱ ${formatNumberLocale(totalEarnings?.packageEarnings ?? 0)}`}
                    readOnly
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-pulse opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {chartData.length > 0 && (
          <div className="p-4">
            <h1 className="text-md sm:text-xl font-bold">List Of Packages</h1>
            <DashboardPackages />
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
