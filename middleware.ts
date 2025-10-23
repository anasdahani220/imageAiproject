
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/*const isPublicRoute = createRouteMatcher([
  '/' ,
  "/api/webhooks/clerk",
  '/api/webhooks/stripe' ,
  "/sign-in(.*)",        // Clerk sign-in
  "/sign-up(.*)",        // Clerk sign-up
]);

export default clerkMiddleware( async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect(); // ✅ redirect instead of 404
  }
});*/

import { authMiddleware } from "@clerk/nextjs/server";


export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks/clerk",
    "/api/webhooks/stripe"
  ],
});


export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};