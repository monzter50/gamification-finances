import { Plus } from "lucide-react";
import { useState } from "react";

import { Button, PageHeader } from "@/components/ui";
import { BudgetsList, CreateBudgetModal } from "@/features/budget";

const BudgetListPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const handleCreate = () => setIsCreating(true);

  return (
    <div className="space-y-stack">
      <PageHeader
        title="Budget Manager"
        description="Plan each month's income and expenses."
        actions={
          <Button onClick={handleCreate}>
            <Plus aria-hidden="true" />
            Create Budget
          </Button>
        }
      />
      <BudgetsList onCreate={handleCreate} />
      {isCreating && <CreateBudgetModal onClose={() => setIsCreating(false)} />}
    </div>
  );
};

export default BudgetListPage;
