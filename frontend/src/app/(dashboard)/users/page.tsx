"use client";
import AppSelect from "@/components/common/app-select";
import { useState } from "react";
import {
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import {  Pencil,
  Power,
  Search,
  Trash2,
  UserPlus,} from "lucide-react";
import CreateUserModal from "@/components/users/create-user-modal";
import { getUsers, updateUserStatus,} from "@/services/user.service";
import EditUserModal from "@/components/users/edit-user-modal";
import type { User } from "@/types/user";
import DeleteUserDialog from "@/components/users/delete-user-dialog";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);
  const [userToDelete, setUserToDelete] =
    useState<User | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users", page, search, role, status],
    queryFn: () =>
        getUsers({
            page,
            limit: 10,
            search: search || undefined,
            role:
            role === ""
                ? undefined
                : (role as
                    | "ADMIN"
                    | "PROJECT_MANAGER"
                    | "TEAM_MEMBER"),
            isActive:
            status === ""
                ? undefined
                : status === "active",
        }),
        enabled: user?.role === "ADMIN",
  });

  const statusMutation = useMutation({
        mutationFn: ({
            userId,
            isActive,
        }: {
            userId: string;
            isActive: boolean;
        }) =>
            updateUserStatus(userId, {
            isActive,
            }),

        onSuccess: async () => {
            await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ["users"],
            }),
            queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            }),
            ]);
        },
  });

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
        router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
  return null;
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            User Management
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage system users, roles and account status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <UserPlus size={18} />
          Create User
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
                <div className="relative">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                    }}
                    placeholder="Search users..."
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none focus:border-primary"
                />
                </div>

                <select
                value={role}
                onChange={(event) => {
                    setRole(event.target.value);
                    setPage(1);
                }}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                >
                <option value="">All roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="PROJECT_MANAGER">
                    Project Manager
                </option>
                <option value="TEAM_MEMBER">Team Member</option>
                </select>

                <select
                value={status}
                onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                }}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>

        {usersQuery.isPending && (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-lg bg-background"
              />
            ))}
          </div>
        )}

        {usersQuery.isError && (
          <div className="p-6 text-sm text-danger">
            Unable to load users.
          </div>
        )}

        {usersQuery.data &&
          usersQuery.data.users.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium text-text-primary">
                No users found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Try using a different search term.
              </p>
            </div>
          )}

        {usersQuery.data &&
          usersQuery.data.users.length > 0 && (
            <>
              <div className="overflow-x-auto">
                {statusMutation.isError && (
                    <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-danger">
                        Unable to update the user status.
                    </div>
                )}
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="border-b border-border bg-background text-text-secondary">
                    <tr>
                      <th className="px-5 py-3 font-medium">
                        User
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Role
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Last login
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Created
                      </th>

                      <th className="px-5 py-3 text-right font-medium">
                         Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {usersQuery.data.users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-background"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-text-primary">
                              {user.firstName}{" "}
                              {user.lastName}
                            </p>

                            <p className="mt-1 text-xs text-text-secondary">
                              {user.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-text-primary">
                          {user.role.replaceAll("_", " ")}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              user.isActive
                                ? "bg-green-50 text-success"
                                : "bg-red-50 text-danger",
                            ].join(" ")}
                          >
                            {user.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-text-secondary">
                          {user.lastLoginAt
                            ? new Date(
                                user.lastLoginAt,
                              ).toLocaleDateString()
                            : "Never"}
                        </td>

                        <td className="px-5 py-4 text-text-secondary">
                          {new Date(
                            user.createdAt,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-text-secondary">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                type="button"
                                title="Edit user"
                                aria-label={`Edit ${user.firstName} ${user.lastName}`}
                                onClick={() => setSelectedUser(user)}
                                className="rounded-lg border border-border p-2 text-text-secondary hover:border-primary hover:bg-primary-light hover:text-primary"
                                >
                                <Pencil size={16} />
                                </button>

                                <button
                                type="button"
                                title={user.isActive ? "Deactivate user" : "Activate user"}
                                aria-label={
                                    user.isActive
                                    ? `Deactivate ${user.firstName} ${user.lastName}`
                                    : `Activate ${user.firstName} ${user.lastName}`
                                }
                                disabled={statusMutation.isPending}
                                onClick={() =>
                                    statusMutation.mutate({
                                    userId: user.id,
                                    isActive: !user.isActive,
                                    })
                                }

                                className={[
                                    "rounded-lg border p-2",
                                    user.isActive
                                    ? "border-border text-text-secondary hover:border-warning hover:bg-amber-50 hover:text-warning"
                                    : "border-border text-text-secondary hover:border-success hover:bg-green-50 hover:text-success",
                                ].join(" ")}
                                >
                                <Power size={16} />
                                </button>

                                <button
                                type="button"
                                title="Delete user"
                                aria-label={`Delete ${user.firstName} ${user.lastName}`}
                                onClick={() => setUserToDelete(user)}
                                className="rounded-lg border border-border p-2 text-text-secondary hover:border-danger hover:bg-red-50 hover:text-danger"
                                >
                                <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <p className="text-sm text-text-secondary">
                  Page{" "}
                  {usersQuery.data.pagination.page} of{" "}
                  {
                    usersQuery.data.pagination
                      .totalPages
                  }
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.max(
                          currentPage - 1,
                          1,
                        ),
                      )
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >=
                      usersQuery.data.pagination
                        .totalPages
                    }
                    onClick={() =>
                      setPage(
                        (currentPage) =>
                          currentPage + 1,
                      )
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        onCreated={async () => {
            setPage(1);

            await Promise.all([
                queryClient.invalidateQueries({
                queryKey: ["users"],
                }),
                queryClient.invalidateQueries({
                queryKey: ["dashboard"],
                }),
            ]);
        }}
      />

      <EditUserModal
        isOpen={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdated={async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["users"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["dashboard"],
                }),
            ]);

            setSelectedUser(null);
        }}
      />

      <DeleteUserDialog
         isOpen={Boolean(userToDelete)}
         user={userToDelete}
         onClose={() => setUserToDelete(null)}
         onDeleted={async () => {
            await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ["users"],
            }),
            queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            }),
            ]);

            setUserToDelete(null);
         }}
      />
    </section>
  );
}