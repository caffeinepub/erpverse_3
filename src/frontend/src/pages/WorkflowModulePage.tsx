import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  ChevronDown,
  Flame,
  Loader2,
  Plus,
  Tag,
  Workflow,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { WorkflowTask } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddWorkflowTask,
  useGetWorkflowData,
  useRemoveWorkflowTask,
  useUpdateWorkflowTask,
} from "../hooks/useQueries";

interface WorkflowModulePageProps {
  companyId: string;
}

type TaskStatus = "backlog" | "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const OTHER_STATUSES = (current: TaskStatus) =>
  COLUMNS.filter((c) => c.id !== current);

function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useLanguage();
  const cfg =
    PRIORITY_CONFIG[priority as TaskPriority] ?? PRIORITY_CONFIG.medium;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Icon className="h-2.5 w-2.5" />
      {t(`erp.workflow.${cfg.label}`)}
    </span>
  );
}

// ─── Task Form Interface ──────────────────────────────────────────────────────
interface TaskFormData {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  tags: string[];
}

// ─── Task Dialog ──────────────────────────────────────────────────────────────
function TaskDialog({
  open,
  onClose,
  onSave,
  initial,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (t: TaskFormData) => void;
  initial?: TaskFormData;
  saving?: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<TaskFormData>({
    id: "",
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          id: "",
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          dueDate: "",
          tags: [],
        },
      );
      setTagInput("");
    }
  }, [open, initial]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((p) => ({ ...p, tags: [...p.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(t("erp.workflow.noTasks"));
      return;
    }
    onSave({ ...form, id: form.id || generateId() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-lg"
        style={{
          backgroundColor: "oklch(1 0 0)",
          color: "oklch(0.12 0.012 270)",
        }}
        data-ocid="workflow.task.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial?.id ? "Görevi Düzenle" : "Yeni Görev"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Başlık *</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder={t("erp.workflow.taskName")}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="workflow.task.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Açıklama</Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="workflow.task.textarea"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Öncelik</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, priority: v as TaskPriority }))
                }
              >
                <SelectTrigger
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    borderColor: "oklch(0.88 0.01 270)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                  data-ocid="workflow.task.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sütun</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as TaskStatus }))
                }
              >
                <SelectTrigger
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    borderColor: "oklch(0.88 0.01 270)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  {COLUMNS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">{t("erp.workflow.dueDate")}</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
          </div>
          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Etiketler</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Etiket gir + Enter"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                style={{
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.4 0.01 270)",
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer"
                    style={{
                      backgroundColor: "oklch(0.93 0.04 300)",
                      color: "oklch(0.38 0.16 300)",
                      border: "1px solid oklch(0.82 0.1 300)",
                    }}
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="workflow.task.cancel_button"
              style={{
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.4 0.01 270)",
              }}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              data-ocid="workflow.task.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.18 300), oklch(0.5 0.16 320))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {initial?.id ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
}: {
  task: WorkflowTask;
  onEdit: (t: WorkflowTask) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}) {
  const { t } = useLanguage();
  const others = OTHER_STATUSES(task.status as TaskStatus);
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2 group"
      style={{
        backgroundColor: "oklch(1 0 0)",
        border: "1px solid oklch(0.88 0.01 270)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-sm font-medium leading-snug flex-1"
          style={{ color: "oklch(0.15 0.012 270)" }}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1 rounded hover:bg-secondary transition-colors text-xs"
            style={{ color: "oklch(0.5 0.01 270)" }}
            title="Düzenle"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1 rounded hover:bg-red-50 transition-colors text-xs"
            style={{ color: "oklch(0.55 0.18 25)" }}
            title="Sil"
          >
            ×
          </button>
        </div>
      </div>

      {task.description && (
        <p
          className="text-xs line-clamp-2"
          style={{ color: "oklch(0.55 0.01 270)" }}
        >
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span
            className="text-[10px] flex items-center gap-0.5 font-medium"
            style={{
              color: isOverdue ? "oklch(0.45 0.18 25)" : "oklch(0.55 0.01 270)",
            }}
          >
            <Calendar className="h-2.5 w-2.5" />
            {task.dueDate}
          </span>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: "oklch(0.93 0.04 300)",
                color: "oklch(0.38 0.16 300)",
                border: "1px solid oklch(0.86 0.08 300)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Move Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-1 py-1 rounded text-xs font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: "oklch(0.95 0.02 300)",
              color: "oklch(0.42 0.16 300)",
              border: "1px solid oklch(0.88 0.06 300)",
            }}
            data-ocid="workflow.task.toggle"
          >
            <ArrowRight className="h-3 w-3" /> Taşı
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          style={{
            backgroundColor: "oklch(1 0 0)",
            color: "oklch(0.12 0.012 270)",
            border: "1px solid oklch(0.88 0.01 270)",
          }}
          data-ocid="workflow.task.dropdown_menu"
        >
          {others.map((col) => (
            <DropdownMenuItem
              key={col.id}
              onClick={() => onMove(task.id, col.id)}
              style={{ color: col.color }}
            >
              → {t(`erp.workflow.${col.label}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    label: string;
    bg: string;
    color: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  low: {
    label: "low",
    bg: "oklch(0.95 0.01 270)",
    color: "oklch(0.5 0.01 270)",
    border: "oklch(0.86 0.008 270)",
    icon: Tag,
  },
  medium: {
    label: "medium",
    bg: "oklch(0.94 0.06 75)",
    color: "oklch(0.42 0.14 75)",
    border: "oklch(0.85 0.1 75)",
    icon: AlertCircle,
  },
  high: {
    label: "high",
    bg: "oklch(0.93 0.04 280)",
    color: "oklch(0.35 0.18 280)",
    border: "oklch(0.82 0.1 280)",
    icon: Flame,
  },
  urgent: {
    label: "urgent",
    bg: "oklch(0.94 0.04 25)",
    color: "oklch(0.45 0.18 25)",
    border: "oklch(0.85 0.1 25)",
    icon: Flame,
  },
};

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string }[] =
  [
    {
      id: "backlog",
      label: "backlog",
      color: "oklch(0.5 0.01 270)",
      bg: "oklch(0.95 0.005 270)",
    },
    {
      id: "todo",
      label: "todo",
      color: "oklch(0.42 0.14 75)",
      bg: "oklch(0.97 0.03 75)",
    },
    {
      id: "in_progress",
      label: "inProgress",
      color: "oklch(0.35 0.18 280)",
      bg: "oklch(0.97 0.02 280)",
    },
    {
      id: "done",
      label: "completed",
      color: "oklch(0.38 0.15 145)",
      bg: "oklch(0.97 0.03 145)",
    },
  ];

export default function WorkflowModulePage({
  companyId,
}: WorkflowModulePageProps) {
  const { data: workflowData, isLoading } = useGetWorkflowData(companyId);
  const { t } = useLanguage();

  const addTask = useAddWorkflowTask();
  const updateTask = useUpdateWorkflowTask();
  const removeTask = useRemoveWorkflowTask();

  const tasks = workflowData?.tasks ?? [];

  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    item?: TaskFormData;
  }>({ open: false });

  const handleSaveTask = async (formData: TaskFormData) => {
    const taskPayload: WorkflowTask = {
      id: formData.id,
      companyId,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      tags: formData.tags,
      assignee: undefined,
    };
    try {
      const isExisting = tasks.some((t) => t.id === formData.id);
      if (isExisting) {
        await updateTask.mutateAsync({ companyId, task: taskPayload });
        toast.success(t("erp.workflow.taskUpdated"));
      } else {
        await addTask.mutateAsync({ companyId, task: taskPayload });
        toast.success(t("erp.workflow.taskAdded"));
      }
      setTaskDialog({ open: false });
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await removeTask.mutateAsync({ companyId, taskId: id });
      toast.success(t("erp.workflow.taskAdded"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleMoveTask = async (id: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedTask: WorkflowTask = { ...task, status };
    try {
      await updateTask.mutateAsync({ companyId, task: updatedTask });
      toast.success(
        `Görev "${COLUMNS.find((c) => c.id === status)?.label}" sütununa taşındı`,
      );
    } catch {
      toast.error(t("common.error"));
    }
  };

  const countByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).length;

  if (isLoading) {
    return (
      <div
        className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]"
        data-ocid="workflow.loading_state"
      >
        <div
          className="flex items-center gap-2"
          style={{ color: "oklch(0.5 0.01 270)" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Veriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-full flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="font-display text-2xl font-bold flex items-center gap-2"
            style={{ color: "oklch(0.12 0.012 270)" }}
          >
            <Workflow
              className="w-6 h-6"
              style={{ color: "oklch(0.45 0.18 300)" }}
            />
            {t("erp.workflow.title")}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.5 0.01 270)" }}
          >
            Kanban board — görevi sütunlar arasında taşıyın
          </p>
        </div>
        <Button
          onClick={() => setTaskDialog({ open: true })}
          data-ocid="workflow.add_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.18 300), oklch(0.5 0.16 320))",
            color: "oklch(1 0 0)",
            border: "none",
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" /> {t("erp.workflow.addTask")}
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column Header */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: col.bg,
                  border: `1px solid ${col.color}20`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: col.color }}
                  >
                    {t(`erp.workflow.${col.label}`)}
                  </span>
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: col.color,
                      color: "oklch(1 0 0)",
                    }}
                  >
                    {countByStatus(col.id)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTaskDialog({
                      open: true,
                      item: {
                        id: "",
                        title: "",
                        description: "",
                        priority: "medium",
                        status: col.id,
                        dueDate: "",
                        tags: [],
                      },
                    })
                  }
                  className="p-1 rounded hover:bg-white/50 transition-colors"
                  style={{ color: col.color }}
                  title={`${t(`erp.workflow.${col.label}`)}'a ekle`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 min-h-[200px]">
                {colTasks.length === 0 ? (
                  <div
                    className="flex items-center justify-center py-8 rounded-lg border-2 border-dashed text-xs"
                    style={{
                      borderColor: `${col.color}30`,
                      color: "oklch(0.65 0.01 270)",
                    }}
                    data-ocid={`workflow.${col.id}.empty_state`}
                  >
                    Görev yok
                  </div>
                ) : (
                  colTasks.map((task, i) => (
                    <div
                      key={task.id}
                      data-ocid={`workflow.${col.id}.item.${i + 1}`}
                    >
                      <TaskCard
                        task={task}
                        onEdit={(t) =>
                          setTaskDialog({
                            open: true,
                            item: {
                              id: t.id,
                              title: t.title,
                              description: t.description,
                              priority: t.priority as TaskPriority,
                              status: t.status as TaskStatus,
                              dueDate: t.dueDate,
                              tags: t.tags,
                            },
                          })
                        }
                        onDelete={handleDeleteTask}
                        onMove={handleMoveTask}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialog.open}
        initial={taskDialog.item}
        onClose={() => setTaskDialog({ open: false })}
        onSave={handleSaveTask}
        saving={addTask.isPending || updateTask.isPending}
      />
    </div>
  );
}
