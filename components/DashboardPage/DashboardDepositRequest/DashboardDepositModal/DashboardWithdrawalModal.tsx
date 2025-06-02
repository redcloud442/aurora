import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createWithdrawalRequest } from "@/services/Withdrawal/Member";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { withdrawalFormSchema, WithdrawalFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const bankData = ["Gotyme", "Gcash", "BPI", "PayMaya"];

const DashboardWithdrawalModal = () => {
  const [open, setOpen] = useState(false);
  const { earnings, setEarnings } = useUserEarningsStore();
  const { teamMemberProfile } = useRole();
  const queryClient = useQueryClient();

  const { isWithdrawalToday, setIsWithdrawalToday } =
    useUserHaveAlreadyWithdraw();

  const { toast } = useToast();

  const form = useForm<WithdrawalFormValues>({
    mode: "onChange",
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      earnings: "",
      amount: "",
      bank: "",
      accountName: "",
      accountNumber: "",
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = form;

  const selectedEarnings = watch("earnings");

  const getMaxAmount = () => {
    switch (selectedEarnings) {
      case "PACKAGE":
        return earnings?.company_package_earnings ?? 0;
      case "REFERRAL":
        return earnings?.company_referral_earnings ?? 0;
      default:
        return 0;
    }
  };

  const handleWithdrawalRequest = async (data: WithdrawalFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);

      await createWithdrawalRequest({
        WithdrawFormValues: sanitizedData,
        teamMemberId: teamMemberProfile.company_member_id,
      });

      switch (selectedEarnings) {
        case "PACKAGE":
          if (earnings) {
            let remainingAmount = Number(sanitizedData.amount);

            const olympusDeduction = Math.min(
              remainingAmount,
              earnings.company_package_earnings
            );
            remainingAmount -= olympusDeduction;

            if (remainingAmount > 0) {
              break;
            }

            // Update state with new earnings values
            setEarnings({
              ...earnings,
              company_combined_earnings:
                earnings.company_combined_earnings -
                Number(sanitizedData.amount),
              company_package_earnings:
                earnings.company_package_earnings - olympusDeduction,
            });
          }

          setIsWithdrawalToday({
            ...isWithdrawalToday,
            package: true,
          });
          break;
        case "REFERRAL":
          if (earnings) {
            // Remaining amount to be deducted

            let remainingAmount = Number(sanitizedData.amount);

            // Calculate Referral Bounty deduction
            const referralDeduction = Math.min(
              remainingAmount,
              earnings.company_referral_earnings
            );

            remainingAmount -= referralDeduction;

            if (remainingAmount > 0) {
              break;
            }

            // Update state with new earnings values
            setEarnings({
              ...earnings,
              company_combined_earnings:
                earnings.company_combined_earnings -
                Number(sanitizedData.amount),
              company_referral_earnings:
                earnings.company_referral_earnings - referralDeduction,
            });
          }

          setIsWithdrawalToday({
            ...isWithdrawalToday,
            referral: true,
          });

          break;
        default:
          break;
      }

      toast({
        title: "Withdrawal Request Successfully",
        description: "Please wait for it to be approved",
      });

      queryClient.invalidateQueries({
        queryKey: [
          "transaction-history",
          "WITHDRAWAL",
          teamMemberProfile?.company_member_id,
        ],
      });

      reset();
      setOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-xl w-auto sm:w-full sm:h-12">
          WITHDRAW
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdrawal</DialogTitle>
          <DialogDescription></DialogDescription>
          {!isWithdrawalToday.package && (
            <Alert variant={"destructive"}>
              <AlertTitle>Withdrawal Already Requested</AlertTitle>
              <AlertDescription>
                Please wait for your request to be approved.
              </AlertDescription>
            </Alert>
          )}
          {!isWithdrawalToday.referral && (
            <Alert variant={"destructive"}>
              <AlertTitle>Withdrawal Referral Already Requested</AlertTitle>
              <AlertDescription>
                Please wait for your request to be approved.
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleWithdrawalRequest)}
            className="space-y-4 w-full"
          >
            <div className="flex w-full gap-2 relative z-10">
              {/* Earnings Select */}
              <div className="relative w-full">
                <FormField
                  control={control}
                  name="earnings"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "PACKAGE") {
                              setValue(
                                "amount",
                                earnings?.company_package_earnings.toFixed(2) ??
                                  "0"
                              );
                            } else if (value === "REFERRAL") {
                              setValue(
                                "amount",
                                earnings?.company_referral_earnings.toFixed(
                                  2
                                ) ?? "0"
                              );
                            }
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full z-50">
                            <SelectValue placeholder="TYPE OF EARNINGS">
                              {field.value === "PACKAGE"
                                ? `₱ ${formatNumberLocale(earnings?.company_package_earnings ?? 0)}`
                                : `₱ ${formatNumberLocale(earnings?.company_referral_earnings ?? 0)}`}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            {isWithdrawalToday.package && (
                              <SelectItem className="text-xs" value="PACKAGE">
                                Package Earnings ₱{" "}
                                {formatNumberLocale(
                                  earnings?.company_package_earnings ?? 0
                                )}
                              </SelectItem>
                            )}
                            {isWithdrawalToday.referral && (
                              <SelectItem className="text-xs" value="REFERRAL">
                                Referral Earnings ₱{" "}
                                {formatNumberLocale(
                                  earnings?.company_referral_earnings ?? 0
                                )}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bank Select */}
              <div className="relative w-full">
                <FormField
                  control={control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full z-50">
                            <SelectValue placeholder="TYPE OF BANK" />
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            {bankData.map((bank, index) => (
                              <SelectItem key={index} value={bank}>
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      id="accountName"
                      variant="non-card"
                      className="text-center"
                      placeholder="ACCOUNT NAME"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      variant="non-card"
                      id="accountNumber"
                      className="text-center"
                      placeholder="ACCOUNT NUMBER"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <Input
                      type="text"
                      id="amount"
                      variant="non-card"
                      placeholder="AMOUNT"
                      className="text-center"
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        let value = e.target.value;

                        if (value === "") {
                          field.onChange("");
                          return;
                        }

                        value = value.replace(/[^0-9.]/g, "");

                        const parts = value.split(".");
                        if (parts.length > 2) {
                          value = `${parts[0]}.${parts[1]}`;
                        }

                        // Limit to 2 decimal places
                        if (parts[1]?.length > 2) {
                          value = `${parts[0]}.${parts[1].substring(0, 2)}`;
                        }

                        if (value.startsWith("0")) {
                          value = value.replace(/^0+/, "");
                        }

                        // Limit total length to 10 characters
                        if (Math.floor(Number(value)).toString().length > 7) {
                          value = value.substring(0, 7);
                        }

                        if (Number(value) > getMaxAmount()) {
                          value = getMaxAmount()
                            .toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                            .toString();
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    className="absolute right-2 top-2 bg-primary text-xs px-3 py-1 h-auto z-50 rounded-none" // add `z-50` and spacing
                    onClick={() => {
                      if (!selectedEarnings) {
                        toast({
                          title: "SELECT TYPE OF EARNINGS",
                          variant: "destructive",
                        });
                        return;
                      }
                      setValue("amount", formatNumberLocale(getMaxAmount()));
                    }}
                  >
                    MAX
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full flex justify-center">
              <Button
                variant="card"
                className=" font-black rounded-none p-5"
                disabled={isSubmitting || getMaxAmount() === 0}
                type="submit"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}{" "}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawalModal;
