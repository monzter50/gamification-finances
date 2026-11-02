import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { useDeleteAccount } from "@/features/accounts/api/useAccountMutations";
import type { Account } from "@/types/api";

export interface DeleteAccountModalProps {
  account: Account;
  onClose: () => void;
}

export const DeleteAccountModal = ({ account, onClose }: DeleteAccountModalProps) => {
  const remove = useDeleteAccount();

  const handleClose = () => {
    if (!remove.isPending) onClose();
  };
  const handleConfirm = () => remove.mutate(account.id, { onSuccess: onClose });

  return (
    <Modal open onClose={handleClose} title="Delete Account">
      <div className="px-6 pb-6 space-y-4">
        <p className="text-sm">
          Are you sure you want to delete <span className="font-semibold">{account.name}</span>?
        </p>
        <p className="text-xs text-muted-foreground">
          The server will reject this if the account has any transactions. You&apos;ll need to
          delete or reassign those first.
        </p>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={remove.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={handleConfirm}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
