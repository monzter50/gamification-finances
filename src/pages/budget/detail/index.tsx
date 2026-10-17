import { Copy } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui";
import { BudgetOverview, BudgetPageShell, DuplicateBudgetModal } from "@/features/budget";

const BudgetDetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [isDuplicating, setIsDuplicating] = useState(false);

  return (
    <BudgetPageShell
      budgetId={id}
      title="Budget Overview"
      backTo="/budget"
      actions={() => (
        <Button variant="outline" onClick={() => setIsDuplicating(true)}>
          <Copy aria-hidden="true" />
          Duplicate
        </Button>
      )}
    >
      {(budget) => (
        <>
          <BudgetOverview budget={budget} />
          {isDuplicating && (
            <DuplicateBudgetModal
              sourceBudget={budget}
              onClose={() => setIsDuplicating(false)}
              onDuplicated={(created) => navigate(`/budget/${created.id}`)}
            />
          )}
        </>
      )}
    </BudgetPageShell>
  );
};

export default BudgetDetailPage;
