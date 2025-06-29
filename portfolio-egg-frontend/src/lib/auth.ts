// src/lib/auth.ts

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access-token");
  const client = localStorage.getItem("client");
  const uid = localStorage.getItem("uid");

  return {
    "access-token": token || "",
    client: client || "",
    uid: uid || "",
  };
};
