import "server-only";
import {auth, clerkClient} from "@clerk/nextjs/server";

export type Role = "reader" | "contributor" | "admin";
export async function getUserAccess() {
  const {userId} = await auth();
  if (!userId) return {userId:null,role:"reader" as Role,profile:null};
  const adminIds=(process.env.URBAN_STORIES_ADMIN_USER_IDS||"").split(",").map(v=>v.trim()).filter(Boolean);
  if(adminIds.includes(userId)) return {userId,role:"admin" as Role,profile:null};
  const client=await clerkClient();
  const user=await client.users.getUser(userId);
  const role=user.privateMetadata?.urbanStoriesRole;
  const suspended=user.privateMetadata?.urbanStoriesSuspended===true;
  const resolvedRole: Role = suspended ? "reader" : role === "contributor" ? "contributor" : "reader";
  return {userId,role:resolvedRole,profile:user};
}
export async function requireRole(allowed:Role[]) {
  const access=await getUserAccess();
  if(!access.userId) throw new Error("UNAUTHENTICATED");
  if(!allowed.includes(access.role)) throw new Error("FORBIDDEN");
  return access;
}
