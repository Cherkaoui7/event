import { useContext } from "react";
import { AuthContext } from "../context/AuthContextObject";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
};
