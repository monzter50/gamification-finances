import { Plus } from "lucide-react";
import { useState } from "react";

import { Button, PageHeader } from "@/components/ui";
import { AccountFormModal, AccountsGrid, DeleteAccountModal } from "@/features/accounts";
import type { Account } from "@/types/api";

/** Which form is open: create (no account) or edit (with account). */
type FormState = { account?: Account } | null;

const AccountsPage = () => {
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<Account | null>(null);

  const handleCreate = () => setForm({});
  const handleEdit = (account: Account) => setForm({ account });

  return (
    <div className="space-y-stack">
      <PageHeader
        title="Accounts"
        description="Manage your bank and financial accounts."
        actions={
          <Button onClick={handleCreate}>
            <Plus aria-hidden="true" />
            New Account
          </Button>
        }
      />

      <AccountsGrid onCreate={handleCreate} onEdit={handleEdit} onDelete={setDeleting} />

      {form && <AccountFormModal account={form.account} onClose={() => setForm(null)} />}
      {deleting && <DeleteAccountModal account={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
};

export default AccountsPage;
