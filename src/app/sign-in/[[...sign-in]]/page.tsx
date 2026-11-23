import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 py-12">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading secure account page…</div>}><SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border border-slate-200",
            headerTitle: "text-[#14243b]",
            formButtonPrimary: "bg-[#397cf0] hover:bg-[#2868d8]",
          },
        }}
      /></Suspense>
    </main>
  );
}
