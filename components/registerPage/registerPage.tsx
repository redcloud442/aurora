"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { checkUserName, createTriggerUser } from "@/services/Auth/Auth";
import { BASE_URL } from "@/utils/constant";
import { escapeFormData } from "@/utils/function";
import { RegisterFormData, RegisterSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, XSquareIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Resolver, useController, useForm } from "react-hook-form";
import Turnstile, { BoundTurnstileObject } from "react-turnstile";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { PasswordInput } from "../ui/passwordInput";

type Props = {
  referralLink: string;
  userName: string;
};
const RegisterPage = ({ referralLink, userName }: Props) => {
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isUsernameValidated, setIsUsernameValidated] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { toast } = useToast();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema) as Resolver<RegisterFormData>,
    defaultValues: {
      referralLink: referralLink,
      sponsor: userName,
      firstName: "",
      lastName: "",
      userName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
    clearErrors,
  } = form;

  const debounce = <T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const router = useRouter();
  const pathName = usePathname();
  const captcha = useRef<BoundTurnstileObject>(null);

  const url = `${BASE_URL}${pathName}`;

  const { field: userNameField } = useController({
    name: "userName",
    control,
  });

  const validateUserName = useCallback(
    debounce(async (value: string) => {
      if (!value) return;

      setIsUsernameLoading(true);
      setIsUsernameValidated(false); // Reset validation state while loading

      try {
        const result = await checkUserName({ userName: value });

        if (result.status === 400) {
          setError("userName", { message: "Username already taken." });
        } else if (result.status === 200) {
          clearErrors("userName");
          setIsUsernameValidated(true);
        }
      } catch (e) {
        form.setError("userName", {
          message: "Username already taken.",
        });
      } finally {
        setIsUsernameLoading(false); // Ensure loading is reset
      }
    }, 3000),
    [form]
  );

  const handleRegistrationSubmit = async (data: RegisterFormData) => {
    if (isUsernameLoading || !isUsernameValidated) {
      return toast({
        title: "Please wait",
        description: "Username validation is still in progress.",
        variant: "destructive",
      });
    }

    if (!captchaToken) {
      if (captcha.current) {
        captcha.current.reset();
        captcha.current.execute();
      }
    }

    const sanitizedData = escapeFormData(data);

    const {
      userName,
      firstName,
      lastName,
      botField,
      referralLink,
      email,
      phoneNumber,
    } = sanitizedData;

    try {
      await createTriggerUser({
        userName: userName,
        firstName,
        lastName,
        referalLink: referralLink,
        url,
        captchaToken: captchaToken || "",
        botField: botField || "",
        password: data.password,
        email: email || "",
        phoneNumber: phoneNumber || "",
      });

      if (captcha.current) {
        captcha.current.reset();
      }

      setIsSuccess(true);
      toast({
        title: "Registration Successful",
      });

      router.push("/console");
    } catch (e) {
      if (captcha.current) {
        captcha.current.reset();
      }
      setIsSuccess(false);
      if (e instanceof Error) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 sm:p-8 max-w-lg mx-auto">
      {/* Top Aurora Logo */}
      <div className="w-full ">
        <Image
          src="/assets/icons/AURORA.webp"
          alt="Aurora Logo"
          width={1000}
          height={1000}
          className="w-full h-auto"
          priority
        />
      </div>
      <Form {...form}>
        <form
          className="space-y-4 w-full z-40"
          onSubmit={handleSubmit(handleRegistrationSubmit)}
        >
          <FormField
            control={control}
            name="botField"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Bot Field</FormLabel>
                <FormControl>
                  <Input
                    id="botField"
                    variant="non-card"
                    placeholder="Bot Field"
                    {...field}
                    hidden
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="firstName"
                    variant="non-card"
                    placeholder="FIRST NAME:"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="lastName"
                    variant="non-card"
                    placeholder="LAST NAME:"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="userName"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    id="userName"
                    variant="non-card"
                    placeholder="USERNAME:"
                    {...field}
                    onChange={(e) => {
                      userNameField.onChange(e.target.value);
                      validateUserName(e.target.value);
                    }}
                    onBlur={() => validateUserName(userNameField.value)}
                    className="pr-10"
                  />
                </FormControl>
                {!isUsernameLoading &&
                  isUsernameValidated &&
                  !errors.userName && (
                    <CheckIcon className="w-5 h-5 text-orange-500 absolute right-3 mt-3 top-1/2 -translate-y-1/2" />
                  )}

                {/* Show error icon if validation failed */}
                {!isUsernameLoading && errors.userName && (
                  <XSquareIcon className="w-5 h-5 text-primaryRed absolute right-3 pt-5 top-1/2 -translate-y-1/2" />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      id="password"
                      variant="non-card"
                      placeholder="PASSWORD:"
                      {...field}
                      className="pr-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      id="confirmPassword"
                      variant="non-card"
                      placeholder="CONFIRM PASSWORD:"
                      {...field}
                      className="pr-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="referralLink"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="referralLink"
                    variant="non-card"
                    readOnly
                    placeholder="REFERRAL CODE:"
                    {...field}
                    className="pr-10 text-center"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex flex-1 justify-center">
            <Turnstile
              size="flexible"
              sitekey={process.env.NEXT_PUBLIC_TURSTILE_SITE_KEY || ""}
              onVerify={(token: string) => {
                setCaptchaToken(token);
              }}
            />
          </div>

          <div className="w-full flex justify-center relative ">
            <Button
              variant="card"
              className=" font-black text-2xl rounded-md p-5"
              disabled={isSubmitting || isSuccess}
              type="submit"
            >
              REGISTER
            </Button>
            <Image
              src="/assets/icons/AURORA.webp"
              alt="Aurora Logo"
              width={600}
              height={300}
              className="absolute -top-0 left-1/2 -translate-x-1/2 rotate-180 opacity-30 w-1/2 h-auto -z-10"
              priority
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterPage;
