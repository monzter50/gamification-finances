import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, Card, CardContent, EmptyState, Skeleton } from "@/components/ui";
import { useSnackbar } from "@/hooks";

const ACCEPTED_TYPES = [ "image/png", "image/jpeg", "image/webp" ];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

interface StatementUploadProps {
  uploading: boolean;
  // eslint-disable-next-line no-unused-vars
  onFile: (file: File) => void;
}

export const StatementUpload = ({ uploading, onFile }: StatementUploadProps) => {
  const snackbar = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const [ previewUrl, setPreviewUrl ] = useState<string | null>(null);

  // Revoke the object URL when it changes / on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); }
    };
  }, [ previewUrl ]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) { return; }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      snackbar.warning({ title: "Unsupported file",
        description: "Upload a PNG, JPEG, or WebP image." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      snackbar.warning({ title: "File too large",
        description: "The image must be 5 MB or smaller." });
      return;
    }

    setPreviewUrl((prev) => {
      if (prev) { URL.revokeObjectURL(prev); }
      return URL.createObjectURL(file);
    });
    onFile(file);
  };

  if (uploading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <p className="text-sm text-muted-foreground">Reading your statement…</p>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Statement preview"
              width={320}
              height={200}
              loading="lazy"
              className="max-h-48 w-auto rounded-md border border-border object-contain"
            />
          ) : null}
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
          accept={ACCEPTED_TYPES.join(",")}
          capture="environment"
          className="sr-only"
          onChange={handleSelect}
        />
        <EmptyState
          icon={<Upload />}
          title="Upload a statement image"
          description="Snap or upload a photo of your bank/credit-card statement. We'll extract the transactions for you to review before saving."
          action={<Button onClick={() => inputRef.current?.click()}>Choose image</Button>}
        />
      </CardContent>
    </Card>
  );
};
