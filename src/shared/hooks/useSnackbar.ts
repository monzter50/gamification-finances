import { toast } from "./use-toast";

interface SnackbarOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const useSnackbar = () => {
  const success = ({ title = "Success", description, duration = 5000 }: SnackbarOptions) => {
    return toast({
      title,
      description,
      variant: "default",
      duration,
      className: "border-success/30 bg-success-subtle",
    });
  };

  const error = ({ title = "Error", description, duration = 5000 }: SnackbarOptions) => {
    return toast({
      title,
      description,
      variant: "destructive",
      duration,
    });
  };

  const warning = ({ title = "Warning", description, duration = 5000 }: SnackbarOptions) => {
    return toast({
      title,
      description,
      variant: "default",
      duration,
      className: "border-warning/30 bg-warning-subtle",
    });
  };

  const info = ({ title = "Info", description, duration = 5000 }: SnackbarOptions) => {
    return toast({
      title,
      description,
      variant: "default",
      duration,
      className: "border-info/30 bg-info-subtle",
    });
  };

  return {
    success,
    error,
    warning,
    info,
  };
};
