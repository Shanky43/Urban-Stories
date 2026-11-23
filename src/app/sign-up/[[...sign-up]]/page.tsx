import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-signup">
        <Suspense fallback={<div className="text-sm text-slate-500">Loading secure account page…</div>}>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                rootBox: "auth-clerk-root",
                cardBox: "auth-clerk-cardbox",
                card: "auth-clerk-card",
                footer: "hidden",
                headerTitle: "text-[#14243b]",
                formButtonPrimary: "bg-[#397cf0] hover:bg-[#2868d8]",
              },
            }}
          />
        </Suspense>
      </section>
    </main>
  );
}
