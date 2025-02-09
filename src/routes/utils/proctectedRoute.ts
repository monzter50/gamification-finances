import { redirect } from "react-router";

export const protectedLoader = (checkAuth: () => Promise<boolean>) => async () => {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return redirect("/login");
  }
  return null;
};
