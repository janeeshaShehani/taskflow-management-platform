"use client";

import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { Trash2, UserPlus, X } from "lucide-react";

import {
  addProjectMember,
  getProjectById,
  removeProjectMember,
} from "@/services/project.service";
import { getUsers } from "@/services/user.service";
import type { Project } from "@/types/project";

interface ManageProjectMembersModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onMembersChanged: () => void;
}

export default function ManageProjectMembersModal({
  isOpen,
  project,
  onClose,
  onMembersChanged,
}: ManageProjectMembersModalProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] =
    useState("");

  const projectDetailsQuery = useQuery({
    queryKey: [
      "project-details",
      project?.id,
    ],
    queryFn: () =>
      getProjectById(project!.id),
    enabled: isOpen && Boolean(project),
  });

  const usersQuery = useQuery({
    queryKey: ["available-team-members"],
    queryFn: () =>
      getUsers({
        page: 1,
        limit: 100,
        role: "TEAM_MEMBER",
        isActive: true,
      }),
    enabled: isOpen,
  });

  const addMutation = useMutation({
        mutationFn: () =>
            addProjectMember(project!.id, {
            userId: selectedUserId,
            }),

        onSuccess: async () => {
            setSelectedUserId("");

            await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ["project-details", project?.id],
            }),
            queryClient.invalidateQueries({
                queryKey: ["task-project-members"],
            }),
            queryClient.invalidateQueries({
                queryKey: ["edit-task-project-members"],
            }),
            queryClient.invalidateQueries({
                queryKey: ["projects"],
            }),
            ]);

            onMembersChanged();
        },
 });

    const removeMutation = useMutation({
    mutationFn: (userId: string) =>
        removeProjectMember(project!.id, userId),

    onSuccess: async () => {
        await Promise.all([
        queryClient.invalidateQueries({
            queryKey: ["project-details", project?.id],
        }),
        queryClient.invalidateQueries({
            queryKey: ["task-project-members"],
        }),
        queryClient.invalidateQueries({
            queryKey: ["edit-task-project-members"],
        }),
        queryClient.invalidateQueries({
            queryKey: ["projects"],
        }),
        ]);

        onMembersChanged();
    },
    });

  if (!isOpen || !project) {
    return null;
  }

  const currentMemberIds = new Set(
    projectDetailsQuery.data?.members.map(
      (member) => member.user.id,
    ) ?? [],
  );

  const availableUsers =
    usersQuery.data?.users.filter(
      (user) =>
        !currentMemberIds.has(user.id),
    ) ?? [];

  const addError = axios.isAxiosError(
    addMutation.error,
  )
    ? addMutation.error.response?.data
        ?.message
    : null;

  const removeError = axios.isAxiosError(
    removeMutation.error,
  )
    ? removeMutation.error.response?.data
        ?.message
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Manage Project Members
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              {project.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-background"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label
              htmlFor="project-member"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Add team member
            </label>

            <div className="flex gap-3">
              <select
                id="project-member"
                value={selectedUserId}
                onChange={(event) =>
                  setSelectedUserId(
                    event.target.value,
                  )
                }
                disabled={
                  usersQuery.isPending ||
                  addMutation.isPending
                }
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">
                  {usersQuery.isPending
                    ? "Loading team members..."
                    : "Select a team member"}
                </option>

                {availableUsers.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.firstName}{" "}
                    {user.lastName} —{" "}
                    {user.email}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={
                  !selectedUserId ||
                  addMutation.isPending
                }
                onClick={() =>
                  addMutation.mutate()
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus size={17} />
                Add
              </button>
            </div>

            {availableUsers.length === 0 &&
              !usersQuery.isPending && (
                <p className="mt-2 text-xs text-text-secondary">
                  No additional active team members are available.
                </p>
              )}

            {addMutation.isError && (
              <p className="mt-2 text-sm text-danger">
                {addError ||
                  "Unable to add project member."}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Current members
            </h3>

            {projectDetailsQuery.isPending && (
              <div className="mt-3 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-lg bg-background"
                  />
                ))}
              </div>
            )}

            {projectDetailsQuery.isError && (
              <p className="mt-3 text-sm text-danger">
                Unable to load project members.
              </p>
            )}

            {projectDetailsQuery.data && (
              <div className="mt-3 space-y-3">
                {projectDetailsQuery.data.members.map(
                  (member) => {
                    const isManager =
                      member.user.id ===
                      projectDetailsQuery.data
                        .manager?.id;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                      >
                        <div>
                          <p className="font-semibold text-text-primary">
                            {
                              member.user
                                .firstName
                            }{" "}
                            {
                              member.user
                                .lastName
                            }
                          </p>

                          <p className="mt-1 text-xs text-text-secondary">
                            {member.user.email}
                          </p>

                          <p className="mt-1 text-xs font-medium text-primary">
                            {isManager
                              ? "Project Manager"
                              : member.user.role.replaceAll(
                                  "_",
                                  " ",
                                )}
                          </p>
                        </div>

                        {!isManager && (
                          <button
                            type="button"
                            title="Remove member"
                            disabled={
                              removeMutation.isPending
                            }
                            onClick={() =>
                              removeMutation.mutate(
                                member.user.id,
                              )
                            }
                            className="rounded-lg border border-border p-2 text-text-secondary hover:border-danger hover:bg-red-50 hover:text-danger disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}

            {removeMutation.isError && (
              <p className="mt-3 text-sm text-danger">
                {removeError ||
                  "Unable to remove project member."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}