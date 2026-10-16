import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button, PageHeader } from "@/components/ui";
import { XlsxImportFlow } from "@/features/transactions";

const XlsxImportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-stack">
      <PageHeader
        title="Import from Excel"
        description="Upload your .xlsx budget workbook. Income and Expenses sheets become budget items; Budget track becomes transactions."
        actions={
          <Button variant="outline" asChild>
            <Link to="/transactions">
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
        }
      />
      <XlsxImportFlow onImported={() => navigate("/transactions")} />
    </div>
  );
};

export default XlsxImportPage;
