import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Account } from "@/types/api";
import { INCOME_TYPES } from "@/types/budget";
import type { IncomeType } from "@/types/budget";

interface IncomeModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: {
    description: string;
    amount: string;
    type: IncomeType | "";
    accountId: string;
  };
  accounts: Account[];
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onChange: (field: "description" | "amount" | "type" | "accountId", value: string) => void;
  onSave: () => void;
}

export function IncomeModal({
  isOpen,
  isEditMode,
  formData,
  accounts,
  onClose,
  onChange,
  onSave,
}: IncomeModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Income Item" : "Add Income Item"}
    >
      <div className="px-6 pb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Update your income source details."
            : "Add a new income source to your budget."}
        </p>

        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Salary, Freelance, Investment"
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => onChange("type", value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select income type" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="accountId">Account</Label>
            <Select
              value={formData.accountId}
              onValueChange={(value) => onChange("accountId", value)}
            >
              <SelectTrigger id="accountId">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Amount (MXN)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => onChange("amount", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onSave} className="flex-1">
            {isEditMode ? "Update Income" : "Add Income"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
