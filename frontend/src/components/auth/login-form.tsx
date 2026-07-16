"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/providers/auth-provider";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;



export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (
    values: LoginFormValues,
  ): Promise<void> => {
    try {
      setServerError("");

      const user = await login(values);

      if (user.role === "ADMIN") {
        router.push("/dashboard");
        return;
      }

      if (user.role === "PROJECT_MANAGER") {
        router.push("/dashboard");
        return;
      }

      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Unable to sign in. Please try again.";

      setServerError(message);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border border-l-4 border-l-primary bg-surface p-8 shadow-lg">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">
          TaskFlow
        </h1>

        <p className="mt-2 text-text-secondary">
          Project & Task Management Platform
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-lg border border-border px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

           {errors.email && (
            <p className="mt-1 text-sm text-danger">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
               {...register("password")}
              className="w-full rounded-lg border border-border px-4 py-3 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary transition hover:text-primary"
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-primary transition hover:text-primary-dark hover:underline hover:cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 hover:cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}