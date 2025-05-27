import { cn } from "@/lib/utils"; // or wherever your `cn` utility is
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

type ReusableCardProps = {
  title?: string | null;
  description?: string | null;
  children: React.ReactNode;
  className?: string; // <-- add this
  type?: "admin" | "user";
  imageUrl?: string;
};

const ReusableCard = ({
  title = null,
  description = null,
  children,
  className,
  type = "user",
}: ReusableCardProps) => {
  return (
    <Card
      className={`bg-gray-600 dark:bg-gray-600 ${
        type === "admin" ? "max-w-lg bg-auto" : "max-w-full h-auto"
      } border-2 border-gray-700 p-6 relative z-50`}
      // style={{
      //   backgroundImage: "url('/assets/card/cardbg.png')",
      //   backgroundSize: "cover",
      //   backgroundPosition: "center",
      //   backgroundRepeat: "no-repeat",
      // }}
    >
      <div className="relative z-10">
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle className="text-white text-3xl stroke-text-orange font-bold text-center">
                {title}
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={cn(className, "mx-auto")}>
          {children}
        </CardContent>
      </div>
    </Card>
  );
};

export default ReusableCard;
