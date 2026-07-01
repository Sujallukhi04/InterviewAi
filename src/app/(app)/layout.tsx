import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  // Fetch user profile from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar user={user} />
      <main className="pt-14 min-h-[calc(100vh-3.5rem)] flex flex-col">
        {children}
      </main>
    </div>
  );
}
