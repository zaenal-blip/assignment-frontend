import { AvatarBadge } from "@/components/AvatarBadge";
import { ConfirmModal } from "@/components/ConfirmModal";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteUser, getStoredUser, getUsers, updateUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Mail,
  Phone,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

const ALL_ROLES: UserRole[] = [
  "Member",
  "Leader",
  "SPV",
  "DPH",
  "Yang punya TMMIN",
];
export default function UsersPage() {
  const isMobile = useIsMobile();
  const currentUser = getStoredUser();
  const queryClient = useQueryClient();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState<string>("");

  const isTMMIN = currentUser?.role === "Yang punya TMMIN";

  // Only leaders and above can access this page
  if (currentUser?.role === "Member") {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUser(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role berhasil diubah");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengubah role");
    },
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    roleMutation.mutate({ userId, role: newRole });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus user");
    },
  });

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteUserId(userId);
    setDeleteUserName(userName);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
      setDeleteOpen(false);
      setDeleteUserId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up px-2 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display text-glow">
            Command Center / Personnel
          </h1>
          <p className="text-sm text-foreground/40 font-medium tracking-wide uppercase">
            System Operators and Access Control Grid
          </p>
        </div>

        {isTMMIN && (
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-foreground font-bold rounded-2xl h-11 px-6 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95">
            <UserPlus className="h-5 w-5 mr-2" />
            Provision Operator
          </Button>
        )}
      </div>

      {/* Stats Summary (Minimalist Glass) */}
      <div className="flex gap-4 px-2">
        <div className="glass px-6 py-3 rounded-2xl border-none flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
              Active Core
            </p>
            <p className="text-xl font-black text-foreground text-glow">
              {users.length} Units
            </p>
          </div>
        </div>
      </div>

      {/* User Card Table */}
      <div className="space-y-4">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-8 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30">
          <div>Personnel Identity</div>
          <div>Access Protocol (Role)</div>
          <div>Comms Interface (Email)</div>
          <div>Direct Uplink (Phone)</div>
          <div>Unit State</div>
          <div>Action</div>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="glass hover:bg-foreground/[0.08] p-4 lg:px-8 lg:py-5 rounded-[2rem] border-none transition-all duration-300 hover:scale-[1.01] hover:blue-glow group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr_auto] items-center gap-4 lg:gap-6">
                {/* Identity */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <AvatarBadge
                      user={user}
                      size="md"
                      className="ring-2 ring-foreground/10 group-hover:ring-cyan-500/50 transition-all"
                    />
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#090a18]",
                        user.status === "Active"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                          : "bg-rose-500",
                      )}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-foreground group-hover:text-cyan-400 transition-colors font-display tracking-tight leading-tight">
                      {user.name}
                    </h4>
                    <p className="text-[10px] text-foreground/20 uppercase tracking-widest">
                      UNIT-ID: {user.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div>
                  {isTMMIN ? (
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as UserRole)
                      }
                    >
                      <SelectTrigger className="h-9 w-full bg-foreground/5 border-foreground/10 rounded-xl text-foreground text-xs font-bold uppercase tracking-widest focus:ring-cyan-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-darker border-foreground/10 text-foreground">
                        {ALL_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-[10px] font-bold text-foreground/60 uppercase tracking-widest uppercase">
                      {user.role}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 text-foreground/50 group-hover:text-foreground/80 transition-colors">
                  <Mail className="h-3.5 w-3.5 opacity-40 shrink-0" />
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-foreground/50">
                  <Phone className="h-3.5 w-3.5 opacity-40 shrink-0" />
                  <span className="text-sm font-mono tracking-tighter">
                    {user.phone || "N/A"}
                  </span>
                </div>

                {/* Status */}
                <StatusBadge
                  status={user.status}
                  className="scale-90 origin-left"
                />

                {/* Actions */}
                <div className="flex lg:justify-end gap-2">
                  {isTMMIN && user.id !== currentUser?.id ? (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deleteMutation.isPending}
                      className="p-2.5 rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 disabled:opacity-20"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  ) : (
                    <div className="h-10 w-10" />
                  )}
                  <button className="p-2.5 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground/40 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Core Operator"
        description={`Apakah Anda yakin ingin menghapus user ${deleteUserName}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus User"
        variant="destructive"
      />
    </div>
  );
}
