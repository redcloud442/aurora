"use client";

import { useToast } from "@/hooks/use-toast";
import { ClaimPackageHandler } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useRole } from "@/utils/context/roleContext";
import { ChartDataMember } from "@/utils/types";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import CircularProgressWrapper from "./CircularPackage";

const DashboardPackages = () => {
  const { toast } = useToast();
  const { teamMemberProfile } = useRole();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();
  const { totalEarnings, setTotalEarnings } = useUserDashboardEarningsStore();
  const { setTransactionHistory } = useUserTransactionHistoryStore();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [liveData, setLiveData] = useState(() => {
    return chartData.map((data) => ({
      ...data,
      currentPercentage: data.completion,
      current_amount: data.current_amount,
    }));
  });

  useEffect(() => {
    const animationFrames: { [key: string]: number } = {};

    chartData.forEach((data: ChartDataMember, index: number) => {
      const animate = () => {
        const now = Date.now();
        const startDate = new Date(data.package_date_created).getTime();
        const completionDate = new Date(data.completion_date).getTime();
        const totalTime = Math.max(completionDate - startDate, 1); // prevent divide by 0
        const elapsedTime = Math.max(now - startDate, 0);

        const percentage = Math.min((elapsedTime / totalTime) * 100, 100);
        const finalAmount = data.amount + data.profit_amount;
        const currentAmount = finalAmount * (percentage / 100);

        setLiveData((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...data,
            is_ready_to_claim: percentage === 100,
            currentPercentage: Number(percentage.toFixed(2)),
            current_amount: currentAmount,
          };
          return updated;
        });

        if (percentage < 100) {
          animationFrames[data.package_connection_id] =
            requestAnimationFrame(animate);
        }
      };

      animationFrames[data.package_connection_id] =
        requestAnimationFrame(animate);
    });

    return () => {
      Object.values(animationFrames).forEach(cancelAnimationFrame);
    };
  }, [chartData]);

  const handleClaimPackage = async (packageData: ChartDataMember) => {
    const { amount, profit_amount, package_connection_id } = packageData;

    try {
      setIsLoading(package_connection_id);
      const response = await ClaimPackageHandler({
        packageConnectionId: package_connection_id,
        earnings: profit_amount,
        amount,
      });

      if (response.ok) {
        toast({
          title: "Package claimed successfully",
          description: "You have successfully claimed the package",
        });

        setChartData(
          chartData.filter(
            (data) => data.package_connection_id !== package_connection_id
          )
        );

        setLiveData(
          liveData.filter(
            (data) => data.package_connection_id !== package_connection_id
          )
        );

        const newEarnings = amount + profit_amount;

        // Update earnings
        if (earnings) {
          setEarnings({
            ...earnings,
            company_earnings_id: earnings.company_earnings_id || "",
            company_member_wallet: earnings.company_member_wallet || 0,
            company_package_earnings:
              earnings.company_package_earnings + newEarnings,
            company_referral_earnings: earnings.company_referral_earnings || 0,
            company_combined_earnings:
              earnings.company_combined_earnings + newEarnings,
            company_earnings_member_id:
              earnings.company_earnings_member_id || "",
          });
        }

        setTransactionHistory({
          data: [
            {
              company_transaction_id: uuidv4(),
              company_transaction_date: new Date(),
              company_transaction_description: ` ${packageData.package} Package Claimed`,
              company_transaction_details: "",
              company_transaction_amount: newEarnings,
              company_transaction_attachment: "",
              company_transaction_member_id:
                teamMemberProfile.company_member_id,
              company_transaction_type: "PACKAGE",
            },
          ],
          count: 1,
        });

        // Update total earnings
        setTotalEarnings({
          ...totalEarnings!,
          totalEarnings: totalEarnings!.totalEarnings + newEarnings,
        });
      }
      setOpenDialogId(null);
    } catch (error) {
      toast({
        title: "Failed to claim package",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null); // Clear loading state
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {liveData.map((data) => (
        <CircularProgressWrapper
          openDialogId={openDialogId}
          setOpenDialogId={setOpenDialogId}
          key={data.package_connection_id}
          data={data}
          handleClaimPackage={handleClaimPackage}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default DashboardPackages;
