"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePasteJob } from "../hooks/use-analyze-job";
import { ApiError } from "@/lib/api/error";

const schema = z.object({
  text: z.string().min(50, "Paste the full job posting (at least a few sentences)"),
  position: z.string().optional(),
  company: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function PasteJobForm() {
  const paste = usePasteJob();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = (v: Form) =>
    paste.mutate(v, {
      onError: (err) => {
        // Real code confirmed live: JD_TOO_SHORT (the client-side length check above should
        // normally catch this first, but the server is the actual authority on "too short").
        // There is no separate "not a real job posting" error — the analyzer degrades gracefully
        // instead (empty requirements/skills, position "Untitled position"), so nothing else to
        // special-case here.
        if (err instanceof ApiError && err.code === "JD_TOO_SHORT") {
          setError("text", { message: "Paste the full job posting — this looks incomplete." });
          return;
        }
        setError("root", { message: (err as ApiError).message });
      },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Textarea label="Job posting" rows={12} placeholder="Paste the full job description here…" error={errors.text?.message} {...register("text")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Position (optional)" placeholder="Senior Backend Engineer" {...register("position")} />
        <Input label="Company (optional)" placeholder="Meridian Systems" {...register("company")} />
      </div>
      {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
      <Button type="submit" loading={paste.isPending} className="w-full">
        {paste.isPending ? "Analyzing…" : "Analyze job description"}
      </Button>
      {paste.isPending && <p className="text-center text-sm text-ink-secondary">Extracting requirements and skills — this takes a few seconds.</p>}
    </form>
  );
}
