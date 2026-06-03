import { FileSpreadsheet } from "lucide-react";
import { useRef } from "react";

import { Button, Card, CardContent, EmptyState, Skeleton } from "@/components/ui";
import { useSnackbar } from "@/hooks";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

interface XlsxUploadProps {
  uploading: boolean;
  // eslint-disable-next-line no-unused-vars
  onFile: (file: File) => void;
}

export const XlsxUpload = ({ uploading, onFile }: XlsxUploadProps) => {
  const snackbar = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) { return; }

    const isXlsx = file.type === XLSX_MIME || file.name.toLowerCase().endsWith(".xlsx");
    if (!isXlsx) {
      snackbar.warning({ title: "Unsupported file",
        description: "Upload an .xlsx Excel file." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      snackbar.warning({ title: "File too large",
        description: "The file must be 10 MB or smaller." });
      return;
    }
    onFile(file);
  };

  if (uploading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <p className="text-sm text-muted-foreground">Reading your workbook…</p>
          {[ 0, 1, 2, 3 ].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={handleSelect}
        />
        <EmptyState
          icon={<FileSpreadsheet />}
          title="Upload an Excel workbook"
          description="Upload your .xlsx budget file. We'll read the 'Budget track' and 'Income' sheets so you can review the transactions before saving."
          action={<Button onClick={() => inputRef.current?.click()}>Choose .xlsx file</Button>}
        />
      </CardContent>
    </Card>
  );
};
