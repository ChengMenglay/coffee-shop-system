"use client";
import { Card, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, loginSchema } from "@/lib/schema/authSchema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { SignInUser } from "../actions/authAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const onSubmitted = async (data: LoginSchema) => {
    try {
      setIsLoading(true);
      const result = await SignInUser(data);
      if (result.status === "success") {
        toast.success(result.data);
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error as string);
      }
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="w-xl  p-6 space-y-1 mx-2">
      <CardTitle className="text-2xl text-center font-extrabold">
        Coffee Shop
      </CardTitle>
      <CardTitle className="text-lg">Login</CardTitle>
      <form onSubmit={handleSubmit(onSubmitted)}>
        <div className="mb-4 space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors?.name && (
            <p className="text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="mb-4 space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors?.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>
        <Button className="w-full mt-4" type="submit">
          {isLoading && <CgSpinnerTwoAlt className=" animate-spin" />}
          {isLoading ? "Loading..." : "Login"}
        </Button>
      </form>
    </Card>
  );
}

export default LoginForm;
