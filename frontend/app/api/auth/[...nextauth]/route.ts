import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth.config";

console.log('NextAuth handler initialized with providers:', authOptions.providers?.map(p => p.id));

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
