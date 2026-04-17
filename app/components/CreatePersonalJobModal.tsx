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
        <div className="space-y-2">
          <Label htmlFor="pj-name">Job Name</Label>
          <Input
            id="pj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daily Machine Check"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pj-desc">Description</Label>
          <Textarea
            id="pj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the job..."
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="pj-due">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="pj-due"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal min-h-[44px]",
                    !dueDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as PersonalJobPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Checklist Activities</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addChecklistItem}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateChecklistItem(index, e.target.value)}
                  placeholder={`Checklist item ${index + 1}`}
                  className="flex-1"
                />
                {checklistItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChecklistItem(index)}
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full min-h-[44px]">
          Create Job
        </Button>
      </form>
    </ModalForm>
  );
}
