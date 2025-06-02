import AllyBountyTable from "@/components/AllyBountyPage/AllyBountyTable";
import LegionBountyTable from "@/components/LegionBountyPage/LegionBountyTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";

const DashboardDirectReferral = () => {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<"direct" | "indirect">("direct");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-xl px-5 sm:w-full sm:max-w-xs sm:h-12">
          REFERRALS
        </Button>
      </DialogTrigger>

      <DialogContent type="table" className="h-[80vh]">
        <DialogTitle className="text-2xl font-bold text-white">
          {tabs === "direct" ? "Direct Referral" : "Indirect Referral"}
        </DialogTitle>
        <DialogDescription> </DialogDescription>
        <Tabs
          defaultValue="direct"
          className="w-full"
          onValueChange={(value) => setTabs(value as "direct" | "indirect")}
        >
          <TabsList variant={"underline"}>
            <TabsTrigger variant={"underline"} value="direct">
              Direct
            </TabsTrigger>
            <TabsTrigger variant={"underline"} value="indirect">
              Indirect
            </TabsTrigger>
          </TabsList>
          <TabsContent value="direct">
            <AllyBountyTable />
          </TabsContent>
          <TabsContent value="indirect">
            <LegionBountyTable />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-center"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDirectReferral;
