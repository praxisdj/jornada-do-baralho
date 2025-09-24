/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { UserService } from "@/services/user.service";
import logger from "./utils/logger";

const userService = new UserService();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      logger.error(`NextAuth error ${code}: ${message}`);
    },
    warn(code, ...message) {
      logger.warn(`NextAuth warning ${code}: ${message}`);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === "development") {
        logger.debug(`NextAuth debug ${code}:`, { message });
      }
    },
  },
  callbacks: {
    async signIn({ user, profile }: { user: any; profile?: any }) {
      if (!user?.email) return false;

      console.log("🤓 Profile:", profile);
      console.log("🤓 User:", user);

      const currentUser = await userService.findUser({ email: user.email });
      if (currentUser) {
        return true;
      }

      const newUser = await userService.createUser({
        email: user.email,
        name: user.name,
        image: user.image,
      });

      user.id = newUser.id;

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      } else {
        try {
          const updatedUser = await userService.findUser({
            email: token.email,
          });

          if (updatedUser) {
            token.id = updatedUser.id;
          }
        } catch (error) {
          console.error("Error fetching updated user:", error);
        }
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      return session;
    },
  },
};
