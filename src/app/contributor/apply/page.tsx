import Link from "next/link";
import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import {getUserAccess} from "@/lib/auth/roles";
import {AuthControls} from "@/components/community/auth-controls";
import {ContributorApplicationForm} from "@/components/community/contributor-application-form";
export default async function ApplyPage(){
 const {userId}=await auth();if(!userId) redirect("/sign-in?redirect_url="+encodeURIComponent("/contributor/apply"));
 const access=await getUserAccess();if(access.role==="admin")redirect("/admin");if(access.role==="contributor")redirect("/contributor/dashboard");
 return <main className="community-page"><header><Link href="/">Urban Stories</Link><AuthControls/></header><section className="community-panel"><p className="community-eyebrow">Stories Beyond Boundaries.</p><h1>Become a contributor</h1><p>Tell us about yourself, the subjects you care about and the stories you'd like to share.</p><ContributorApplicationForm/></section></main>;
}
