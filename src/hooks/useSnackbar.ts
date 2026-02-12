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
      className: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
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
      className: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
    });
  };

  const info = ({ title = "Info", description, duration = 5000 }: SnackbarOptions) => {
    return toast({
      title,
      description,
      variant: "default",
      duration,
      className: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
    });
  };

  return {
    success,
    error,
    warning,
    info,
  };
};
