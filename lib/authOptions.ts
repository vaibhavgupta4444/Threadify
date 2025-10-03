import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./dbConnection";
import User from "../models/User";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials: Record<"email" | "password", string> | undefined) {

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Credentials not found");
                }

                try {

                    await dbConnect();

                    const user = await User.findOne({ email: credentials.email });

                    if (!user) {
                        throw new Error("User not found");
                    }

                    const isValidPassword = await bcrypt.compare(credentials.password, user.password);

                    if (!isValidPassword) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        image:user.image
                    }


                } catch (error) {
                    throw error;
                }
            }
        })],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
                token.picture = (user as any).image;
            }
            return token;
        },
        async session({ session, token }) {

            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.image = token.picture;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET
};