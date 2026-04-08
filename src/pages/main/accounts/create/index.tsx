"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSnackbar } from "@/hooks";
import { accountService } from "@/services/account.service";
import type { AccountType, CreateAccountDto } from "@/types/api";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "checking",
    label: "Checking" },
  { value: "savings",
    label: "Savings" },
  { value: "credit",
    label: "Credit" },
  { value: "investment",
    label: "Investment" },
];

export default function CreateAccount() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAccountDto>({
    defaultValues: {
      name: "",
      type: "checking",
    },
  });

  const selectedType = watch("type");

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await accountService.create(data);
      snackbar.success({
        title: "Account created",
        description: `"${data.name}" has been created successfully.`,
      });
      navigate("/accounts");
    } catch (error) {
      snackbar.error({
        title: "Failed to create account",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold">New Account</h2>
        <p className="text-muted-foreground">Add a bank or financial account to track your finances.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            The account will be created in MXN with a starting balance of $0.
          </CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g. Mi cuenta BBVA"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">Account Type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue("type", value as AccountType, { shouldValidate: true })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/accounts")}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
