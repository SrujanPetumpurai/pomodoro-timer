"use client"

import { googleSignIn, userSignOut } from "@/lib/auth/actions"

export default function Login({ user }: { user: { name?: string | null; image?: string | null } | null }) {
  if (user) {
    return (
      <form action={userSignOut}>
        <img src={user.image ?? ""} alt={user.name ?? "User"} className="w-8 h-8 rounded-full" />
        <button type="submit">Sign out</button>
      </form>
    )
  }

  return (
    <form action={googleSignIn}>
      <button type="submit">Sign in with Google</button>
    </form>
  )
}