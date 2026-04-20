import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, getStoredUser, updateUser } from "@/lib/api";
import type { User, UserRole } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Navigate } from "react-router";
import { toast } from "sonner";

const ALL_ROLES: UserRole[] = ["Member", "Leader", "SPV", "DPH", "Yang punya TMMIN"];

export default function UsersPage() {
  const isMobile = useIsMobile();
  const currentUser = getStoredUser();
  const queryClient = useQueryClient();

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

  if (isMobile) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Users</h2>
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <AvatarBadge user={user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isTMMIN ? (
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as UserRole)
                      }
                    >
                      <SelectTrigger className="h-7 w-auto text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {user.role}
                    </span>
                  )}
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tv:text-tv-xl">Users</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AvatarBadge user={user} size="sm" />
                      <span className="font-medium tv:text-tv-sm">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="tv:text-tv-sm">
                    {isTMMIN ? (
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as UserRole)
                        }
                      >
                        <SelectTrigger className="h-8 w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      user.role
                    )}
                  </TableCell>
                  <TableCell className="tv:text-tv-sm">{user.email}</TableCell>
                  <TableCell className="tv:text-tv-sm">{user.phone}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
