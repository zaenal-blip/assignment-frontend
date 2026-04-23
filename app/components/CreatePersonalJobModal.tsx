import { useState } from "react";
import { ModalForm } from "@/components/ModalForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { PersonalJob, PersonalJobPriority } from "@/types";

import { useMutation } from "@tanstack/react-query";
import { createPersonalJob } from "@/lib/api";

interface CreatePersonalJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePersonalJobModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePersonalJobModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [priority, setPriority] = useState<PersonalJobPriority>("Medium");
  const [checklistItems, setChecklistItems] = useState<string[]>([""]);

  const createMutation = useMutation({
    mutationFn: createPersonalJob,
    onSuccess: () => {
      toast.success("Personal job created successfully!");
      onSuccess?.();
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create personal job.");
    },
  });

  const addChecklistItem = () => setChecklistItems((prev) => [...prev, ""]);

  const removeChecklistItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, value: string) => {
    setChecklistItems((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setDueDate(new Date());
    setPriority("Medium");
    setChecklistItems([""]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dueDate) {
      toast.error("Please fill in Job Name and Due Date.");
      return;
    }
    const validChecklist = checklistItems.filter((item) => item.trim());
    if (validChecklist.length === 0) {
      toast.error("Please add at least one checklist item.");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      activities: validChecklist,
      dueDate: dueDate.toISOString().split("T")[0],
      priority,
    });
  };

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title="Create Personal Job"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="pj-name" className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Job Name</Label>
          <Input
            id="pj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daily Machine Check"
            className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="pj-desc" className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Description</Label>
          <Textarea
            id="pj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the job objective..."
            className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4 py-3 min-h-[100px] resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <Label htmlFor="pj-due" className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="pj-due"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all",
                    !dueDate && "text-white/20",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                  {dueDate ? format(dueDate, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-darker border-white/10 text-white backdrop-blur-3xl" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as PersonalJobPriority)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
                {["Low", "Medium", "High"].map((p) => (
                  <SelectItem key={p} value={p} className="focus:bg-cyan-500/20 focus:text-white cursor-pointer">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80">Checklist Activities</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addChecklistItem}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Step
            </Button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 animate-fade-in group/item">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-cyan-400 group-hover/item:border-cyan-500/50 transition-colors shadow-inner">
                  {index + 1}
                </div>
                <Input
                  value={item}
                  onChange={(e) => updateChecklistItem(index, e.target.value)}
                  placeholder={`Checklist item ${index + 1}`}
                  className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all font-medium"
                />
                {checklistItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChecklistItem(index)}
                    className="shrink-0 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl h-12 w-12 border border-transparent hover:border-rose-500/20 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 border border-white/10 cyan-glow"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Constructing...</span>
            </div>
          ) : "Create Job Protocol"}
        </Button>
      </form>
    </ModalForm>
  );
}
