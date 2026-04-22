import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Target, Search, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalForm } from "@/components/ModalForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { cn } from "@/lib/utils";
import {
  getHoshinKPIs,
  createHoshinKPI,
  updateHoshinKPI,
  deleteHoshinKPI,
  getStoredUser,
} from "@/lib/api";
import type { HoshinKPI } from "@/types";

export default function HoshinPage() {
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();
  const isTmmin = currentUser?.role === "Yang punya TMMIN";

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["hoshin-kpis"],
    queryFn: getHoshinKPIs,
    staleTime: 5 * 60 * 1000,
  });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<HoshinKPI | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formCluster, setFormCluster] = useState("");
  const [formSubCluster, setFormSubCluster] = useState("");
  const [formActionPlan, setFormActionPlan] = useState("");
  const [formTarget, setFormTarget] = useState("");

  const createMutation = useMutation({
    mutationFn: createHoshinKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hoshin-kpis"] });
      toast.success("KPI Hoshin created!");
      closeModal();
    },
    onError: (err: any) => toast.error(err.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateHoshinKPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hoshin-kpis"] });
      toast.success("KPI Hoshin updated!");
      closeModal();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHoshinKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hoshin-kpis"] });
      toast.success("KPI Hoshin deleted");
    },
  });

  const openCreate = () => {
    setEditingKPI(null);
    setFormCode("");
    setFormCluster("");
    setFormSubCluster("");
    setFormActionPlan("");
    setFormTarget("");
    setModalOpen(true);
  };

  const openEdit = (kpi: HoshinKPI) => {
    setEditingKPI(kpi);
    setFormCode(kpi.code);
    setFormCluster(kpi.cluster);
    setFormSubCluster(kpi.subCluster || "");
    setFormActionPlan(kpi.actionPlan);
    setFormTarget(kpi.target || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingKPI(null);
  };

  const handleSubmit = () => {
    if (!formCode.trim() || !formCluster.trim() || !formActionPlan.trim()) {
      toast.error("Code, Cluster, and Action Plan are required.");
      return;
    }
    const payload = {
      code: formCode.trim(),
      cluster: formCluster.trim(),
      subCluster: formSubCluster.trim() || undefined,
      actionPlan: formActionPlan.trim(),
      target: formTarget.trim() || undefined,
    };

    if (editingKPI) {
      updateMutation.mutate({ id: editingKPI.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const filtered = kpis.filter(
    (k) =>
      k.cluster.toLowerCase().includes(search.toLowerCase()) ||
      k.actionPlan.toLowerCase().includes(search.toLowerCase()) ||
      k.code.toLowerCase().includes(search.toLowerCase())
  );

  if (!isTmmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass p-12 rounded-[2rem] text-center border-none">
          <Target className="h-12 w-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-bold uppercase tracking-widest">
            Access restricted to Super Admin
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading KPI Hoshin data...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up px-2 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display text-glow">
            KPI Hoshin
          </h1>
          <p className="text-sm text-white/40 font-medium tracking-wide uppercase">
            Master data management for KPI alignment
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add KPI
        </Button>
      </div>

      {/* Search */}
      <div className="px-2">
        <div className="relative group max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
          <Input
            placeholder="Search KPI by cluster, code, or action plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 bg-white/5 border-white/10 rounded-2xl pl-10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[0.8fr_1.2fr_1fr_2fr_1fr_auto] gap-4 px-8 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
          <div>Code</div>
          <div>Cluster</div>
          <div>Sub Cluster</div>
          <div>Action Plan</div>
          <div>Target</div>
          <div></div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="glass p-12 rounded-[2rem] text-center border-none">
              <Target className="h-12 w-12 text-white/5 mx-auto mb-4" />
              <p className="text-white/20 font-bold uppercase tracking-widest">
                No KPI Hoshin data found
              </p>
            </div>
          ) : (
            filtered.map((kpi) => (
              <div
                key={kpi.id}
                className="glass hover:bg-white/[0.08] p-4 lg:px-8 lg:py-5 rounded-[2rem] border-none transition-all duration-300 hover:scale-[1.01] group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr_1fr_2fr_1fr_auto] items-center gap-4 lg:gap-6">
                  {/* Code */}
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      {kpi.code}
                    </span>
                  </div>

                  {/* Cluster */}
                  <div className="flex items-center gap-2">
                    <Layers className="h-3 w-3 text-cyan-400/40" />
                    <span className="text-sm font-bold text-white">
                      {kpi.cluster}
                    </span>
                  </div>

                  {/* Sub Cluster */}
                  <div>
                    <span className="text-xs text-white/50">
                      {kpi.subCluster || "—"}
                    </span>
                  </div>

                  {/* Action Plan */}
                  <div>
                    <p className="text-sm text-white/70 line-clamp-2">
                      {kpi.actionPlan}
                    </p>
                  </div>

                  {/* Target */}
                  <div>
                    <span className="text-xs font-bold text-white/50">
                      {kpi.target || "—"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:justify-end items-center gap-2">
                    <button
                      onClick={() => openEdit(kpi)}
                      className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(kpi.id)}
                      className="p-2.5 rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <ModalForm
        open={modalOpen}
        onOpenChange={(v) => {
          if (!v) closeModal();
          else setModalOpen(v);
        }}
        title={editingKPI ? "Edit KPI Hoshin" : "Create KPI Hoshin"}
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">
                KPI Code
              </Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. KPI-S-001"
                className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">
                Cluster
              </Label>
              <Input
                value={formCluster}
                onChange={(e) => setFormCluster(e.target.value)}
                placeholder="e.g. Safety"
                className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">
                Sub Cluster (optional)
              </Label>
              <Input
                value={formSubCluster}
                onChange={(e) => setFormSubCluster(e.target.value)}
                placeholder="e.g. Fire Prevention"
                className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">
                Target (optional)
              </Label>
              <Input
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                placeholder="e.g. Zero Accident"
                className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">
              Action Plan
            </Label>
            <Input
              value={formActionPlan}
              onChange={(e) => setFormActionPlan(e.target.value)}
              placeholder="Describe the action plan..."
              className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 border border-white/10 cyan-glow"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Processing...</span>
              </div>
            ) : editingKPI ? (
              "Update KPI Hoshin"
            ) : (
              "Create KPI Hoshin"
            )}
          </Button>
        </div>
      </ModalForm>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete KPI Hoshin"
        description="Are you sure you want to delete this KPI? Projects linked to it will lose their alignment reference."
        confirmText="Delete KPI"
        variant="destructive"
      />
    </div>
  );
}
