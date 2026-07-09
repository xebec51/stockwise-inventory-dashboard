import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "MANAGER" | "STAFF" | "SUPPLIER";
      status: "ACTIVE" | "PENDING" | "REJECTED" | "INACTIVE";
    };
  }

  interface User {
    role: "ADMIN" | "MANAGER" | "STAFF" | "SUPPLIER";
    status: "ACTIVE" | "PENDING" | "REJECTED" | "INACTIVE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "MANAGER" | "STAFF" | "SUPPLIER";
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "INACTIVE";
  }
}
