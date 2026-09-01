import { withAuth } from "next-auth/middleware";

// Protect everything under /portal — public site + /login stay open.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/portal/:path*"],
};
