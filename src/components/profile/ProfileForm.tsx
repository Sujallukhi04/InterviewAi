"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { profileSchema, ProfileInput } from "@/validators/profile";
import { updateProfileAction } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileFormProps {
  initialData: {
    name: string;
    role: string;
    experience: "Entry" | "Mid" | "Senior";
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProfileInput) => {
    try {
      const result = await updateProfileAction(data);
      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      
      {/* Name Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Full Name
        </label>
        <Input
          {...register("name")}
          placeholder="Your full name"
          className="bg-[#111111] border-[#1A1A1A] focus-visible:ring-[#00FF87]/20 focus-visible:border-[#00FF87] text-white text-xs h-10 rounded-lg"
        />
        {errors.name && (
          <p className="text-red-400 text-[10px] font-semibold">{errors.name.message}</p>
        )}
      </div>

      {/* Target Role Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Target Role
        </label>
        <Input
          {...register("role")}
          placeholder="e.g. Frontend Engineer"
          className="bg-[#111111] border-[#1A1A1A] focus-visible:ring-[#00FF87]/20 focus-visible:border-[#00FF87] text-white text-xs h-10 rounded-lg"
        />
        {errors.role && (
          <p className="text-red-400 text-[10px] font-semibold">{errors.role.message}</p>
        )}
      </div>

      {/* Experience Level Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Experience Level
        </label>
        <div className="relative">
          <select
            {...register("experience")}
            className="w-full h-10 bg-[#111111] border border-[#1A1A1A] rounded-lg text-xs px-3 text-zinc-100 focus:outline-none focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87]/20 cursor-pointer appearance-none"
          >
            <option value="Entry">Entry Level</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior Level</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {errors.experience && (
          <p className="text-red-400 text-[10px] font-semibold">{errors.experience.message}</p>
        )}
      </div>

      {/* Save Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#00FF87] text-black hover:bg-[#00FF87]/90 font-bold transition-all h-10 rounded-lg cursor-pointer flex items-center justify-center text-xs"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>

    </form>
  );
}
