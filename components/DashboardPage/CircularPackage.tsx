import { formateMonthDateYear, formatNumberLocale } from "@/utils/function";
import { ChartDataMember } from "@/utils/types";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type CircularProgressWrapperProps = {
  data: ChartDataMember;
  handleClaimPackage: (data: ChartDataMember) => void;
  openDialogId: string | null;
  setOpenDialogId: Dispatch<SetStateAction<string | null>>;
  isLoading: string | null;
};

const CircularProgressWrapper = ({
  data,
  handleClaimPackage,
  openDialogId,
  setOpenDialogId,
  isLoading,
}: CircularProgressWrapperProps) => {
  const radius = 140; // increased from 100
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (data.currentPercentage / 100) * circumference;

  return (
    <div className="relative w-[360px] h-[360px] flex items-center justify-center">
      <svg height="360" width="360" className="absolute top-0 left-0">
        <circle
          stroke="#2c2c3e"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="180"
          cy="180"
        />
        <circle
          stroke={data.package_color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
          r={normalizedRadius}
          cx="180"
          cy="180"
          transform="rotate(-90 180 180)"
        />
      </svg>

      <div className="text-white bg-[#1e1933] rounded-full w-[260px] h-[260px] flex flex-col items-center justify-center gap-2 text-center">
        <h2 className="text-sm font-bold text-cyan-400 tracking-wide">
          {data.package} Package
        </h2>
        <div className="text-xs font-semibold">
          AMOUNT: {formatNumberLocale(data.amount)}
        </div>
        <div className="text-xs font-semibold">
          PROFIT: {formatNumberLocale(data.profit_amount)}
        </div>
        <div className="text-xs font-semibold">TOTAL EARNINGS</div>
        <div className="bg-cyan-400 px-4 py-1 rounded-full text-black font-extrabold text-2xl mt-1">
          {formatNumberLocale(data.current_amount)}
        </div>
        <div className="text-xs mt-2">
          <div className="text-xs font-semibold">
            START: {formateMonthDateYear(data.package_date_created)}
          </div>
          <div className="text-xs font-semibold">
            MATURITY: {formateMonthDateYear(data.completion_date)}
          </div>
        </div>
        {data.is_ready_to_claim && (
          <Dialog
            open={openDialogId === data.package_connection_id}
            onOpenChange={(isOpen) =>
              setOpenDialogId(isOpen ? data.package_connection_id : null)
            }
          >
            <DialogTrigger asChild>
              <Button variant="default" className="z-50">
                CLAIM
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e1933] text-white border-cyan-400">
              <DialogHeader>
                <DialogTitle className="text-lg mb-2 text-white">
                  Claim {data.package}
                </DialogTitle>
                <p className="text-white">
                  Generate Earnings by claiming this package
                </p>
              </DialogHeader>
              <DialogFooter>
                <Button
                  disabled={isLoading === data.package_connection_id}
                  onClick={() => handleClaimPackage(data)}
                  className="w-full bg-cyan-400 text-black font-bold"
                >
                  {isLoading === data.package_connection_id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Collecting...
                    </>
                  ) : (
                    "Collect"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="absolute bottom-0 text-white text-base">
        {data.currentPercentage.toFixed(2)}%
      </div>
    </div>
  );
};

export default CircularProgressWrapper;
