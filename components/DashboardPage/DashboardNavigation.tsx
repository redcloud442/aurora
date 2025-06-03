import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useRole } from "@/utils/context/roleContext";
import { formatNumberLocale } from "@/utils/function";
import { Button } from "../ui/button";
import DashboardDepositProfile from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositProfile";

const DashboardNavigation = () => {
  const { earnings } = useUserEarningsStore();
  const { profile } = useRole();
  const { teamMemberProfile } = useRole();
  return (
    <div className="space-y-2">
      <nav className="block w-full justify-between items-center bg-secondary">
        <div className="flex justify-between items-center px-4 py-2 gap-2">
          <div className="flex items-center gap-4">
            <DashboardDepositProfile />
            <div className="flex flex-col sm:flex-row gap-1 items-start justify-end leading-none">
              <span className="text-white text-xs font-bold">
                {profile?.user_first_name}
              </span>
              <span className="text-white text-xs font-bold">
                {profile?.user_last_name}
              </span>
            </div>
            <Button variant="card" size="sm" className="rounded-md p-2">
              MEMBER
              <div
                className={`w-5 h-5 rounded-full ${
                  teamMemberProfile?.company_member_is_active
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
            </Button>
          </div>
          <div className="flex  items-center text-white text-xs font-bold gap-4">
            {/* Left Block: CREDIT and BALANCE stacked */}
            <div className="flex flex-col items-start justify-end leading-none">
              <span>CREDIT</span>
              <span>BALANCE</span>
            </div>

            {/* Right Block: Amount */}
            <span>
              ₱ {formatNumberLocale(earnings?.company_combined_earnings ?? 0)}
            </span>
          </div>
        </div>
      </nav>

      <div className="flex justify-center items-center bg-secondary py-1">
        <div className="flex items-center gap-2">
          <span>Welcome {profile?.user_username}!</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
