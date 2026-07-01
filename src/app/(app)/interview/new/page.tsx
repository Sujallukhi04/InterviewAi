import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SelectionForm from "./selection-form";

export default async function NewInterviewPage() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black max-w-5xl w-full mx-auto px-6 py-12 select-none">
      <div className="flex flex-col items-center text-center mb-10 max-w-xl space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          What type of interview?
        </h1>
        <p className="text-[#888888] text-xs md:text-sm font-medium">
          Choose one to practice. Depth over breadth.
        </p>
      </div>
      <SelectionForm />
    </div>
  );
}
