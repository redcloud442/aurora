import TransactionHistoryTable from "@/components/TransactionHistoryPage/TransactionHistoryTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";

const TransactionHistory = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:h-12">Transaction History</Button>
      </DialogTrigger>

      <DialogContent type="table" className="h-[80vh]">
        <DialogTitle className="text-2xl font-bold text-white">
          Transaction History
        </DialogTitle>
        <DialogDescription></DialogDescription>
        <TransactionHistoryTable />
        <DialogFooter className="flex justify-center"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistory;
