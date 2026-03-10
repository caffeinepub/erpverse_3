import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  ChevronRight,
  FolderKanban,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { Project, ProjectTask } from "../backend";
import StaffNameDisplay from "../components/StaffNameDisplay";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useCreateProject,
  useCreateProjectTask,
  useGetProjectData,
  useRemoveProject,
  useRemoveProjectTask,
  useUpdateProjectTask,
} from "../hooks/useQueries";

interface ProjectManagementModulePageProps {
  companyId: string;
}

const PROJECT_STATUSES = [
  {
    value: "planning",
    label: "planning",
    color: "oklch(0.4 0.01 270)",
    bg: "oklch(0.94 0.005 270)",
    border: "oklch(0.86 0.008 270)",
  },
  {
    value: "active",
    label: "active",
    color: "oklch(0.35 0.18 280)",
    bg: "oklch(0.93 0.04 280)",
    border: "oklch(0.82 0.1 280)",
  },
  {
    value: "completed",
    label: "completed",
    color: "oklch(0.38 0.15 145)",
    bg: "oklch(0.92 0.06 145)",
    border: "oklch(0.8 0.1 145)",
  },
  {
    value: "on-hold",
    label: "onHold2",
    color: "oklch(0.45 0.14 75)",
    bg: "oklch(0.94 0.06 75)",
    border: "oklch(0.85 0.1 75)",
  },
];

const TASK_STATUSES = [
  {
    value: "todo",
    label: "todo2",
    color: "oklch(0.4 0.01 270)",
    bg: "oklch(0.94 0.005 270)",
    border: "oklch(0.86 0.008 270)",
  },
  {
    value: "in-progress",
    label: "inProgress2",
    color: "oklch(0.35 0.18 280)",
    bg: "oklch(0.93 0.04 280)",
    border: "oklch(0.82 0.1 280)",
  },
  {
    value: "done",
    label: "done",
    color: "oklch(0.38 0.15 145)",
    bg: "oklch(0.92 0.06 145)",
    border: "oklch(0.8 0.1 145)",
  },
];

function StatusBadge({
  status,
  list,
}: { status: string; list: typeof PROJECT_STATUSES }) {
  const { t } = useLanguage();
  const s = list.find((x) => x.value === status);
  if (!s) return <span>{status}</span>;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {t(`erp.projects.${s.label}`)}
    </span>
  );
}

const DIALOG_STYLE: React.CSSProperties = {
  backgroundColor: "oklch(1 0 0)",
  color: "oklch(0.12 0.012 270)",
};
const LABEL_STYLE: React.CSSProperties = {
  color: "oklch(0.25 0.012 270)",
  fontWeight: 600,
};
const INPUT_STYLE: React.CSSProperties = {
  backgroundColor: "oklch(1 0 0)",
  color: "oklch(0.12 0.012 270)",
  borderColor: "oklch(0.88 0.01 270)",
};
const BTN_CANCEL_STYLE: React.CSSProperties = {
  color: "oklch(0.35 0.01 270)",
  borderColor: "oklch(0.88 0.01 270)",
  backgroundColor: "oklch(1 0 0)",
};
const BTN_PRIMARY_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
  color: "oklch(1 0 0)",
  border: "none",
};

export default function ProjectManagementModulePage({
  companyId,
}: ProjectManagementModulePageProps) {
  const { data: projectData, isLoading } = useGetProjectData(companyId);
  const { t } = useLanguage();
  const projects = projectData?.projects ?? [];
  const tasks = projectData?.tasks ?? [];

  const createProject = useCreateProject();
  const removeProject = useRemoveProject();
  const createProjectTask = useCreateProjectTask();
  const updateProjectTask = useUpdateProjectTask();
  const removeProjectTask = useRemoveProjectTask();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    deadline: "",
    status: "planning",
  });

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", dueDate: "" });

  const saveProject = async () => {
    if (!projectForm.name) return;
    try {
      await createProject.mutateAsync({
        companyId,
        project: {
          id: "",
          companyId,
          name: projectForm.name,
          description: projectForm.description,
          status: projectForm.status,
          deadline: projectForm.deadline,
          teamMembers: [],
        },
      });
      toast.success(t("erp.projects.projectAdded"));
      setShowProjectDialog(false);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleRemoveProject = async (projectId: string) => {
    try {
      await removeProject.mutateAsync({ companyId, projectId });
      if (selectedProject?.id === projectId) setSelectedProject(null);
      toast.success(t("erp.projects.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const saveTask = async () => {
    if (!taskForm.title || !selectedProject) return;
    try {
      await createProjectTask.mutateAsync({
        companyId,
        task: {
          id: "",
          companyId,
          projectId: selectedProject.id,
          title: taskForm.title,
          dueDate: taskForm.dueDate,
          status: "todo",
        },
      });
      toast.success(t("erp.projects.taskAdded"));
      setShowTaskDialog(false);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const updateTaskStatus = async (task: ProjectTask, status: string) => {
    try {
      await updateProjectTask.mutateAsync({
        companyId,
        task: { ...task, status },
      });
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    try {
      await removeProjectTask.mutateAsync({ companyId, taskId });
      toast.success(t("erp.common.delete"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const projectTasks = selectedProject
    ? tasks.filter((t) => t.projectId === selectedProject.id)
    : [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div>
        <h1
          className="text-2xl font-bold flex items-center gap-2.5"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: "oklch(0.12 0.012 270)",
          }}
        >
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: "oklch(0.92 0.05 220)" }}
          >
            <FolderKanban
              className="w-5 h-5"
              style={{ color: "oklch(0.42 0.18 220)" }}
            />
          </div>
          {t("erp.projects.title")}
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.01 270)" }}>
          {t("erp.projects.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2
              className="font-semibold"
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                color: "oklch(0.12 0.012 270)",
              }}
            >
              {t("erp.projects.projects")}
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setProjectForm({
                  name: "",
                  description: "",
                  deadline: "",
                  status: "planning",
                });
                setShowProjectDialog(true);
              }}
              data-ocid="projects.add_project.button"
              style={{
                color: "oklch(0.35 0.18 280)",
                borderColor: "oklch(0.82 0.08 280)",
                backgroundColor: "oklch(0.96 0.015 280)",
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t("erp.common.new")}
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div
              className="text-center py-8 text-sm rounded-xl"
              data-ocid="projects.empty_state"
              style={{
                color: "oklch(0.6 0.01 270)",
                backgroundColor: "oklch(0.975 0.01 270)",
                border: "1px solid oklch(0.88 0.01 270)",
              }}
            >
              {t("erp.projects.noProjectsShort")}
            </div>
          ) : (
            projects.map((project, i) => (
              <div key={project.id} className="group relative">
                <button
                  type="button"
                  data-ocid={`projects.project.item.${i + 1}`}
                  className="w-full text-left rounded-xl p-4 transition-all"
                  style={{
                    backgroundColor:
                      selectedProject?.id === project.id
                        ? "oklch(0.94 0.025 280)"
                        : "oklch(1 0 0)",
                    border:
                      selectedProject?.id === project.id
                        ? "2px solid oklch(0.45 0.22 280)"
                        : "1px solid oklch(0.88 0.01 270)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onClick={() => setSelectedProject(project)}
                  onMouseEnter={(e) => {
                    if (selectedProject?.id !== project.id) {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "oklch(0.97 0.005 280)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProject?.id !== project.id) {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "oklch(1 0 0)";
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "oklch(0.12 0.012 270)" }}
                      >
                        {project.name}
                      </p>
                      <p
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: "oklch(0.5 0.01 270)" }}
                      >
                        {project.description}
                      </p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "oklch(0.6 0.01 270)" }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <StatusBadge
                      status={project.status}
                      list={PROJECT_STATUSES}
                    />
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: "oklch(0.55 0.01 270)" }}
                    >
                      <Calendar className="w-3 h-3" />
                      {project.deadline}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Users
                      className="w-3 h-3"
                      style={{ color: "oklch(0.55 0.01 270)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.01 270)" }}
                    >
                      {project.teamMembers.length}{" "}
                      {t("erp.projects.membersCount")}
                    </span>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveProject(project.id);
                  }}
                  data-ocid={`projects.project.delete_button.${i + 1}`}
                  disabled={removeProject.isPending}
                  style={{ color: "oklch(0.55 0.2 25)" }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Project Detail */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.01 270)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Project header */}
              <div
                className="p-5"
                style={{
                  borderBottom: "1px solid oklch(0.91 0.005 270)",
                  background:
                    "linear-gradient(135deg, oklch(0.96 0.01 280), oklch(0.97 0.008 270))",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      className="font-bold text-lg"
                      style={{
                        fontFamily: "Bricolage Grotesque, sans-serif",
                        color: "oklch(0.12 0.012 270)",
                      }}
                    >
                      {selectedProject.name}
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "oklch(0.45 0.01 270)" }}
                    >
                      {selectedProject.description}
                    </p>
                  </div>
                  <StatusBadge
                    status={selectedProject.status}
                    list={PROJECT_STATUSES}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm mt-3">
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: "oklch(0.5 0.01 270)" }}
                  >
                    <Calendar className="w-4 h-4" />
                    Son tarih: {selectedProject.deadline}
                  </span>
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: "oklch(0.5 0.01 270)" }}
                  >
                    <Users className="w-4 h-4" />
                    {selectedProject.teamMembers.length}{" "}
                    {t("erp.projects.membersCount")}
                  </span>
                </div>
              </div>

              {/* Tasks – Kanban Board */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="font-semibold flex items-center gap-2"
                    style={{
                      fontFamily: "Bricolage Grotesque, sans-serif",
                      color: "oklch(0.12 0.012 270)",
                    }}
                  >
                    <CheckSquare
                      className="w-4 h-4"
                      style={{ color: "oklch(0.45 0.22 280)" }}
                    />
                    {t("erp.projects.tasks")} ({projectTasks.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedProject(null)}
                      data-ocid="projects.back.button"
                      style={{ color: "oklch(0.5 0.01 270)" }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Geri
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTaskForm({ title: "", dueDate: "" });
                        setShowTaskDialog(true);
                      }}
                      data-ocid="projects.add_task.button"
                      style={{
                        color: "oklch(0.35 0.18 280)",
                        borderColor: "oklch(0.82 0.08 280)",
                        backgroundColor: "oklch(0.96 0.015 280)",
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t("erp.projects.addTask")}
                    </Button>
                  </div>
                </div>
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                  </div>
                ) : projectTasks.length > 0 ? (
                  /* Kanban columns */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TASK_STATUSES.map((col) => {
                      const colTasks = projectTasks.filter(
                        (t) => t.status === col.value,
                      );
                      return (
                        <div
                          key={col.value}
                          className="rounded-xl flex flex-col gap-2 p-3"
                          style={{
                            backgroundColor: col.bg,
                            border: `1px solid ${col.border}`,
                            minHeight: "120px",
                          }}
                        >
                          {/* Column header */}
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color: col.color }}
                            >
                              {col.label}
                            </span>
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.6)",
                                color: col.color,
                              }}
                            >
                              {colTasks.length}
                            </span>
                          </div>
                          {/* Task cards */}
                          {colTasks.length === 0 ? (
                            <p
                              className="text-center text-xs py-4 opacity-50"
                              style={{ color: col.color }}
                            >
                              {t("erp.projects.noTasksShort")}
                            </p>
                          ) : (
                            colTasks.map((task, i) => (
                              <div
                                key={task.id}
                                data-ocid={`projects.task.item.${i + 1}`}
                                className="rounded-lg p-3 flex flex-col gap-2"
                                style={{
                                  backgroundColor: "oklch(1 0 0)",
                                  border: "1px solid oklch(0.91 0.005 270)",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                }}
                              >
                                <p
                                  className="font-semibold text-sm leading-snug"
                                  style={{ color: "oklch(0.12 0.012 270)" }}
                                >
                                  {task.title}
                                </p>
                                {task.assignee && (
                                  <div
                                    className="text-xs"
                                    style={{ color: "oklch(0.5 0.01 270)" }}
                                  >
                                    <StaffNameDisplay
                                      principal={task.assignee}
                                    />
                                  </div>
                                )}
                                {task.dueDate && (
                                  <div
                                    className="flex items-center gap-1 text-xs"
                                    style={{ color: "oklch(0.55 0.01 270)" }}
                                  >
                                    <Calendar className="w-3 h-3" />
                                    {task.dueDate}
                                  </div>
                                )}
                                {/* Status change + delete row */}
                                <div className="flex items-center justify-between gap-1 mt-1">
                                  <Select
                                    value={task.status}
                                    onValueChange={(v) =>
                                      updateTaskStatus(task, v)
                                    }
                                  >
                                    <SelectTrigger
                                      className="h-6 text-xs flex-1 min-w-0"
                                      data-ocid={`projects.task.status.select.${i + 1}`}
                                      style={{
                                        backgroundColor:
                                          "oklch(0.97 0.005 270)",
                                        borderColor: "oklch(0.88 0.01 270)",
                                        color: "oklch(0.4 0.01 270)",
                                        fontSize: "10px",
                                        paddingLeft: "6px",
                                        paddingRight: "4px",
                                      }}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TASK_STATUSES.map((s) => (
                                        <SelectItem
                                          key={s.value}
                                          value={s.value}
                                        >
                                          {s.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveTask(task.id)}
                                    data-ocid={`projects.task.delete_button.${i + 1}`}
                                    disabled={removeProjectTask.isPending}
                                    className="h-6 w-6 shrink-0"
                                    style={{ color: "oklch(0.55 0.2 25)" }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="text-center py-8 text-sm"
                    data-ocid="projects.tasks.empty_state"
                    style={{ color: "oklch(0.6 0.01 270)" }}
                  >
                    {t("erp.projects.noTasksInProject")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-64 rounded-xl"
              style={{
                backgroundColor: "oklch(0.975 0.01 270)",
                border: "1px solid oklch(0.88 0.01 270)",
              }}
            >
              <div className="text-center">
                <FolderKanban
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: "oklch(0.7 0.05 270)" }}
                />
                <p style={{ color: "oklch(0.5 0.01 270)" }}>
                  {t("erp.projects.selectProjectFirst")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={DIALOG_STYLE}
          data-ocid="projects.project.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              {t("erp.projects.addProject")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>
                {t("erp.projects.projectNameLabel")}
              </Label>
              <Input
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t("erp.projects.projectName")}
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>
                {t("erp.projects.descriptionLabel")}
              </Label>
              <Textarea
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder={t("erp.projects.description")}
                rows={2}
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>{t("erp.projects.endDate")}</Label>
              <Input
                type="date"
                value={projectForm.deadline}
                onChange={(e) =>
                  setProjectForm((p) => ({ ...p, deadline: e.target.value }))
                }
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>{t("erp.projects.status")}</Label>
              <Select
                value={projectForm.status}
                onValueChange={(v) =>
                  setProjectForm((p) => ({ ...p, status: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProjectDialog(false)}
              style={BTN_CANCEL_STYLE}
            >
              {t("erp.common.cancel")}
            </Button>
            <Button
              onClick={saveProject}
              disabled={createProject.isPending}
              style={BTN_PRIMARY_STYLE}
            >
              {createProject.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("erp.projects.createBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={DIALOG_STYLE}
          data-ocid="projects.task.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              {t("erp.projects.addTask")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>
                {t("erp.projects.taskTitleLabel")}
              </Label>
              <Input
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder={t("erp.projects.taskName")}
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>{t("erp.projects.endDate")}</Label>
              <Input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                style={INPUT_STYLE}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTaskDialog(false)}
              style={BTN_CANCEL_STYLE}
            >
              {t("erp.common.cancel")}
            </Button>
            <Button
              onClick={saveTask}
              disabled={createProjectTask.isPending}
              style={BTN_PRIMARY_STYLE}
            >
              {createProjectTask.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
