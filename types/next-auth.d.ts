
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      profession?: string | null
    }
  }

  interface User {
    id: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    profession?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    profession?: string | null
  }
}
