"use client";

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
import FileUpload from "@/components/ui/dropZone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { getMerchantOptions } from "@/services/Options/Options";
import { handleDepositRequest } from "@/services/TopUp/Member";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData } from "@/utils/function";
import { DepositRequestFormValues, depositRequestSchema } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { merchant_table } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import QRCodeViewer from "../QRview";

const DashboardDepositModalDeposit = () => {
  const supabaseClient = createClientSide();
  const [topUpOptions, setTopUpOptions] = useState<merchant_table[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { teamMemberProfile } = useRole();
  const [selectedMerchant, setSelectedMerchant] =
    useState<merchant_table | null>(null);
  const queryClient = useQueryClient();

  const { canUserDeposit, setCanUserDeposit } = useUserHaveAlreadyWithdraw();

  const { toast } = useToast();

  const form = useForm<DepositRequestFormValues>({
    resolver: zodResolver(depositRequestSchema),
    defaultValues: {
      amount: "",
      topUpMode: "",
      accountName: "",
      accountNumber: "",
      file: undefined,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isSubmitting },
  } = form;

  const file = watch("file");

  useEffect(() => {
    const getOptions = async () => {
      try {
        if (!isOpen) return;
        if (!topUpOptions.length) {
          const options = await getMerchantOptions();
          setTopUpOptions(options);
        }
      } catch (e) {}
    };

    getOptions();
  }, [isOpen]);

  const onSubmit = async (data: DepositRequestFormValues) => {
    try {
      if (!canUserDeposit) {
        toast({
          title: "Error",
          description: "You have already deposited today.",
          variant: "destructive",
        });
        return;
      }
      const sanitizedData = escapeFormData(data);
      const file = data.file;

      const filePath = `uploads/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("REQUEST_ATTACHMENTS")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error("File upload failed.");
      }

      const publicUrl = `https://cdn.auroraphil.com/storage/v1/object/public/REQUEST_ATTACHMENTS/${filePath}`;

      await handleDepositRequest({
        TopUpFormValues: sanitizedData,
        publicUrl,
      });

      toast({
        title: "Deposit Request Successfully",
        description: "Please wait for your request to be approved.",
      });

      queryClient.invalidateQueries({
        queryKey: [
          "transaction-history",
          "DEPOSIT",
          teamMemberProfile?.company_member_id,
        ],
      });
      reset();
      setIsOpen(false);
      setCanUserDeposit(false);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath:
            "components/DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit.tsx",
        });
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      }
    }
  };

  const onTopUpModeChange = (value: string) => {
    const selectedOption = topUpOptions.find(
      (option) => option.merchant_id === value
    );
    if (selectedOption) {
      setSelectedMerchant(selectedOption);
      setValue("accountName", selectedOption.merchant_account_name || "");
      setValue("accountNumber", selectedOption.merchant_account_number || "");
    }
  };

  const handleCopy = (type: "accountName" | "accountNumber") => {
    const value = form.getValues(type);

    if (value) {
      navigator.clipboard.writeText(value);
      toast({
        title: "Copied to clipboard",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedMerchant(null);
          reset();
        }
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-xl px-13 sm:w-full sm:max-w-sm sm:h-12">
          DEPOSIT
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
          <DialogDescription></DialogDescription>
          {!canUserDeposit ? (
            <Alert variant={"destructive"}>
              <AlertTitle>Deposit Request</AlertTitle>
              <AlertDescription>
                Please wait for your request to be approved.
              </AlertDescription>
            </Alert>
          ) : null}
        </DialogHeader>
        <ScrollArea className="h-[500px] sm:h-auto">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              <FormField
                control={control}
                name="topUpMode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onTopUpModeChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="text-center">
                          <SelectValue placeholder="BANK NAME" />
                        </SelectTrigger>
                        <SelectContent>
                          {topUpOptions.map((option) => (
                            <SelectItem
                              key={option.merchant_id}
                              value={option.merchant_id}
                            >
                              <div className="flex items-center gap-2">
                                {option.merchant_account_type} -{" "}
                                {option.merchant_account_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          readOnly
                          className="w-full"
                          variant="non-card"
                          id="accountName"
                          placeholder="ACCOUNT NAME"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  onClick={() => handleCopy("accountName")}
                  type="button"
                  className="bg-button-primary rounded-none h-10 text-black font-bold"
                >
                  COPY
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          readOnly
                          variant="non-card"
                          id="accountNumber"
                          placeholder="ACCOUNT NUMBER"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  onClick={() => handleCopy("accountNumber")}
                  type="button"
                  className="bg-button-primary rounded-none h-10 text-black font-bold"
                >
                  COPY
                </Button>
              </div>

              {selectedMerchant?.merchant_qr_attachment && (
                <QRCodeViewer
                  qrImageSrc={selectedMerchant.merchant_qr_attachment}
                />
              )}

              <FormField
                control={control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="AMOUNT"
                        variant="non-card"
                        {...field}
                        onChange={(e) => {
                          let inputValue = e.target.value;

                          // Allow clearing the value
                          if (inputValue === "") {
                            field.onChange("");
                            return;
                          }

                          // Remove non-numeric characters
                          inputValue = inputValue.replace(/[^0-9.]/g, "");

                          // Ensure only one decimal point
                          const parts = inputValue.split(".");
                          if (parts.length > 2) {
                            inputValue = parts[0] + "." + parts[1];
                          }

                          // Limit to two decimal places
                          if (parts[1]?.length > 2) {
                            inputValue = `${parts[0]}.${parts[1].substring(0, 2)}`;
                          }

                          if (inputValue.length > 8) {
                            inputValue = inputValue.substring(0, 8);
                          }

                          // Update the field value
                          field.onChange(inputValue);

                          // Enforce max amount
                          const numericValue = Number(inputValue);

                          setValue("amount", numericValue.toString());
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* {selectedMerchant?.merchant_qr_attachment && (
                <div className="flex flex-col gap-2 justify-center items-center">
                  <p className="text-lg font-bold">QR CODE</p>
                  <Image
                    src={selectedMerchant.merchant_qr_attachment}
                    alt="QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              )} */}

              <FormField
                control={control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        label=""
                        onFileChange={(file) => field.onChange(file)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {file && (
                <h1 className="rounded-md h-10 w-full flex items-center justify-center text-green-500 text-center">
                  PROOF OF TRANSACTION UNDER REVIEW. YOU CAN NOW SUBMIT
                </h1>
              )}

              <div className="w-full flex justify-center">
                <Button
                  variant="card"
                  className=" font-black text-2xl rounded-none w-full p-5"
                  disabled={isSubmitting || !canUserDeposit}
                  type="submit"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : null}{" "}
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalDeposit;
