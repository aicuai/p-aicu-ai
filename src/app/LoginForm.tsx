"use client"

import { useActionState } from "react"

type SignInAction = (formData: FormData) => Promise<{ error: string } | void>

export default function LoginForm({ signInAction }: { signInAction: SignInAction }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      try {
        const result = await signInAction(formData)
        if (result && typeof result === "object" && "error" in result && result.error) {
          return { error: String(result.error) }
        }
        return null
      } catch {
        // redirect() throws — let it propagate by returning null
        return null
      }
    },
    null,
  )

  return (
    <form action={formAction}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          name="email"
          placeholder="メールアドレス"
          required
          autoComplete="email"
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 15,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--glass-bg, rgba(255,255,255,0.06))",
            color: "var(--text-primary)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 16px",
            background: isPending ? "var(--aicu-teal-dark, #2d9f8f)" : "var(--aicu-teal, #41C9B4)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: isPending ? "wait" : "pointer",
            transition: "background 0.2s, transform 0.15s",
            boxShadow: "0 4px 12px rgba(65, 201, 180, 0.2)",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "送信中..." : "ログインリンクを送信"}
        </button>
      </div>

      {state?.error && (
        <p style={{ textAlign: "center", fontSize: 13, color: "#ef4444", marginTop: 12 }}>
          {state.error}
        </p>
      )}
    </form>
  )
}
