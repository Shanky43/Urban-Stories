"use client";
import Link from "next/link";
import {SignInButton,SignUpButton,SignedIn,SignedOut,UserButton} from "@clerk/nextjs";
export function AuthControls(){return <div className="community-auth"><SignedOut><SignInButton mode="modal"><button className="community-signin">Sign in</button></SignInButton><SignUpButton mode="modal"><button className="community-signup">Join</button></SignUpButton></SignedOut><SignedIn><Link href="/contributor/dashboard">Workspace</Link><UserButton/></SignedIn></div>}
