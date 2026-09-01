"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowRightLeft } from "lucide-react";

export function SectionChangeButton({
  studentId,
  currentSection,
  className,
}: {
  studentId: string;
  currentSection: string;
  className?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [newSection, setNewSection] = useState(currentSection);

  async function change() {
    startTransition(async () => {
      const res = await fetch(`/api/portal/students/${studentId}/section`, {
        method: "POST",
        body: JSON.stringify({ section: newSection }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? "Section changed" : "Error",
        description: res.ok ? `Moved to section ${newSection}` : j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) { setOpen(false); router.refresh(); }
    });
  }

  const available = ["A", "B", "C"].filter((s) => s !== currentSection);

  return (
    <>
      <Button variant="ghost" size="sm" className={className} onClick={() => setOpen(true)}>
        <ArrowRightLeft className="mr-1 h-3 w-3" />Change section
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" />Change Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current: <span className="font-semibold text-foreground">{className}-{currentSection}</span>
            </p>
            <div>
              <span className="mb-1.5 block text-sm font-medium">New section</span>
              <Select value={newSection} onValueChange={setNewSection}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {available.map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={change} disabled={pending || newSection === currentSection}>Confirm change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
