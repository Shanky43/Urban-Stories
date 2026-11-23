import Image from "next/image";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({searchParams}:{searchParams:Promise<{redirect_url?:string}>}) {
  const params=await searchParams;
  const redirectUrl=params.redirect_url?.startsWith("/")&&!params.redirect_url.startsWith("//")?params.redirect_url:"/";
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <Image
          src="/branding/urban-stories-logo.svg"
          alt="Urban Stories — Stories Beyond Boundaries"
          width={300}
          height={90}
          priority
          className="auth-brand"
        />
        <Suspense fallback={<div className="text-sm text-slate-500">Loading secure account page…</div>}>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl={redirectUrl}
            fallbackRedirectUrl={redirectUrl}
            appearance={{
              variables: { colorPrimary: "#397cf0", colorBackground: "#ffffff", borderRadius: "10px" },
              elements: {
                rootBox: "auth-clerk-root",
                cardBox: "auth-clerk-cardbox",
                card: "auth-clerk-card",
                footer: "hidden",
                headerTitle: "text-[#14243b]",
                formButtonPrimary: "bg-[#397cf0] hover:bg-[#2868d8] text-white",
              },
            }}
          />
        </Suspense>
      </section>
    </main>
  );
}
