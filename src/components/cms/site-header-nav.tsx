"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export function SiteHeaderNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="blog-nav">
      <div className="blog-container nav-inner">
        <Link href="/" className="brand-logo" aria-label="Urban Stories – Go to homepage" onClick={close}>
          <Image src="/branding/urban-stories-logo.svg" alt="Urban Stories" width={190} height={42} priority />
        </Link>
        <button className="mobile-menu-toggle" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
        <nav id="primary-navigation" className={"nav-links" + (open ? " is-open" : "")} aria-label="Main navigation">
          <Link href="/about" onClick={close}>Our Story</Link>
          <Link href="/#topics" onClick={close}>Categories</Link>
          <Link href="/contributor/editor" onClick={close}>Write</Link>
          <Show when="signed-out">
            <SignInButton mode="modal"><button type="button" className="header-signin" onClick={close}>Sign In</button></SignInButton>
            <SignUpButton mode="modal"><button type="button" className="header-get-started" onClick={close}>Get Started</button></SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/contributor/dashboard" onClick={close}>Dashboard</Link>
            <span className="header-user-menu"><UserButton /></span>
          </Show>
        </nav>
      </div>
    </header>
  );
}
