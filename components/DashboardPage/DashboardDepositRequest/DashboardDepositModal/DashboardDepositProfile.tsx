import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/passwordInput";
import TableLoading from "@/components/ui/tableLoading";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { changeUserPassword, updateUserProfile } from "@/services/User/User";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, userNameToEmail } from "@/utils/function";
import { ChangePasswordFormValues, ChangePasswordSchema } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, Loader2, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

const DashboardDepositProfile = () => {
  const [open, setOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const { profile, setProfile } = useRole();
  const { toast } = useToast();

  const router = useRouter();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const supabaseClient = createClientSide();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      const formData = escapeFormData(data);

      await changeUserPassword({
        userId: profile.user_id,
        email: userNameToEmail(profile?.user_username || ""),
        password: formData.password,
      });

      reset();
      toast({
        title: "Password Change Successfully",
      });
      setOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/UserAdminProfile/ChangePassword.tsx",
        });
      }
      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.refresh();
  };

  const handleUploadProfilePicture = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "Error",
        description: `File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`,
        variant: "destructive",
      });
      return;
    }
    const filePath = `profile-pictures/${Date.now()}_${file.name}`;
    try {
      setIsUploading(true);
      const { error: uploadError } = await supabaseClient.storage
        .from("USER_PROFILE")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const publicUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/USER_PROFILE/${filePath}`;

      await updateUserProfile({
        userId: profile.user_id,
        profilePicture: publicUrl,
      });

      setProfile({
        profile: {
          ...profile,
          user_profile_picture: publicUrl,
        },
      });

      toast({
        title: "Profile Picture Updated Successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isUploading) return <TableLoading />;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage
            src={profile.user_profile_picture || ""}
            alt={`${profile.user_first_name} ${profile.user_last_name}`}
          />
          <AvatarFallback>
            <UserIcon className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle className="text-2xl font-bold">
          Personal Profile
        </DialogTitle>
        <DialogDescription />

        <div className="relative flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <Avatar
              onClick={() => inputRef.current?.click()}
              className="w-40 h-auto rounded-none mb-4"
            >
              <AvatarImage
                src={profile.user_profile_picture || ""}
                alt={`${profile.user_first_name} ${profile.user_last_name}`}
              />
              <AvatarFallback
                onClick={() => setOpen(true)}
                className="text-white w-40 h-auto rounded-xl mb-4 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>

            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleUploadProfilePicture(file);
                }
              }}
            />

            <div className="flex flex-col items-start justify-center gap-4">
              <div>
                <Input
                  readOnly
                  variant="non-card"
                  value={profile?.user_first_name || ""}
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  readOnly
                  variant="non-card"
                  value={profile?.user_last_name || ""}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="relative">
              <div className="relative">
                <PasswordInput
                  id="password"
                  variant="non-card"
                  value={watch("password")}
                  placeholder="Password"
                  {...register("password")}
                  className="pr-10 w-full"
                />
                {touchedFields.password && !errors.password && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-10 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {errors.password && (
                <p className="text-primaryRed text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div className="relative">
                <PasswordInput
                  id="confirmPassword"
                  variant="non-card"
                  value={watch("confirmPassword")}
                  placeholder="Confirm Password"
                  {...register("confirmPassword")}
                  className="pr-10 w-full"
                />
                {touchedFields.confirmPassword &&
                  !errors.confirmPassword &&
                  touchedFields.password &&
                  !errors.password &&
                  watch("password") === watch("confirmPassword") && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-10 top-1/2 transform -translate-y-1/2" />
                  )}
              </div>
              {errors.confirmPassword && (
                <p className="text-primaryRed text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                disabled={isSubmitting}
                type="submit"
                className="rounded-none"
                variant="card"
              >
                {isSubmitting && <Loader2 className="animate-spin" />}
                Change Password
              </Button>
            </div>
            <Button
              disabled={isSubmitting}
              type="button"
              className="rounded-none"
              variant="card"
              onClick={handleLogout}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Logout
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositProfile;
