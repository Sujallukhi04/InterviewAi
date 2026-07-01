import { prisma } from "@/lib/prisma";

interface UpdateUserProfileData {
  name: string;
  role: string;
  experience: "Entry" | "Mid" | "Senior";
}

export async function updateUserProfile(userId: string, data: UpdateUserProfileData) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      role: data.role,
      experience: data.experience,
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}
