import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit2,
  Factory,
  Layers,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BOMItem, WorkOrder } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddBOMItem,
  useAddWorkOrder,
  useGetManufacturingData,
  useRemoveBOMItem,
  useRemoveWorkOrder,
  useUpdateBOMItem,
  useUpdateWorkOrder,
} from "../hooks/useQueries";

interface ManufacturingModulePageProps {
  companyId: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type WorkOrderStatus = "planned" | "in_progress" | "completed" | "cancelled";

const STATUS_CONFIG: Record<
  WorkOrderStatus,
  {
    label: string;
    bg: string;
    color: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  planned: {
    label: "planned",
    bg: "oklch(0.93 0.04 280)",
    color: "oklch(0.35 0.18 280)",
    border: "oklch(0.82 0.1 280)",
    icon: Clock,
  },
  in_progress: {
    label: "Devam Ediyor",
    bg: "oklch(0.94 0.06 75)",
    color: "oklch(0.42 0.14 75)",
    border: "oklch(0.85 0.1 75)",
    icon: Loader2,
  },
  completed: {
    label: "completed",
    bg: "oklch(0.92 0.06 145)",
    color: "oklch(0.38 0.15 145)",
    border: "oklch(0.82 0.1 145)",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "İptal Edildi",
    bg: "oklch(0.94 0.04 25)",
    color: "oklch(0.45 0.18 25)",
    border: "oklch(0.85 0.1 25)",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const cfg = STATUS_CONFIG[status as WorkOrderStatus] ?? {
    label: status,
    bg: "oklch(0.93 0.01 270)",
    color: "oklch(0.5 0.01 270)",
    border: "oklch(0.85 0.01 270)",
    icon: Clock,
  };
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Icon className="h-3 w-3" />
      {t(`erp.manufacturing.${cfg.label}`)}
    </span>
  );
}

const UNITS = ["Adet", "kg", "litre", "metre", "m²", "m³", "kutu", "palet"];

// ─── WorkOrder Form Interface ─────────────────────────────────────────────────
interface WorkOrderFormData {
  id: string;
  productName: string;
  quantity: number;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
  notes: string;
}

// ─── WorkOrder Dialog ─────────────────────────────────────────────────────────
function WorkOrderDialog({
  open,
  onClose,
  onSave,
  initial,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (wo: WorkOrderFormData) => void;
  initial?: WorkOrderFormData;
  saving?: boolean;
}) {
  const { t } = useLanguage();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<WorkOrderFormData>({
    id: "",
    productName: "",
    quantity: 1,
    status: "planned",
    startDate: today,
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          id: "",
          productName: "",
          quantity: 1,
          status: "planned",
          startDate: today,
          endDate: "",
          notes: "",
        },
      );
    }
  }, [open, initial, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) {
      toast.error(t("erp.manufacturing.product"));
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
        data-ocid="manufacturing.workorder.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial?.id
              ? t("erp.common.edit")
              : t("erp.manufacturing.addWorkOrder")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="wo-product">Ürün Adı *</Label>
            <Input
              id="wo-product"
              value={form.productName}
              onChange={(e) =>
                setForm((p) => ({ ...p, productName: e.target.value }))
              }
              placeholder={t("erp.manufacturing.product")}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="manufacturing.workorder.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="wo-qty">Miktar</Label>
              <Input
                id="wo-qty"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, quantity: Number(e.target.value) }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as WorkOrderStatus }))
                }
              >
                <SelectTrigger
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    borderColor: "oklch(0.88 0.01 270)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                  data-ocid="manufacturing.workorder.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="wo-start">Başlangıç Tarihi</Label>
              <Input
                id="wo-start"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wo-end">Bitiş Tarihi</Label>
              <Input
                id="wo-end"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wo-notes">Açıklama / Notlar</Label>
            <Textarea
              id="wo-notes"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              rows={2}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="manufacturing.workorder.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="manufacturing.workorder.cancel_button"
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
              data-ocid="manufacturing.workorder.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.18 25), oklch(0.55 0.16 45))",
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

// ─── BOM Form Interface ───────────────────────────────────────────────────────
interface BOMFormData {
  id: string;
  workOrderId: string;
  materialName: string;
  quantity: number;
  unit: string;
}

// ─── BOM Dialog ───────────────────────────────────────────────────────────────
function BOMDialog({
  open,
  onClose,
  onSave,
  workOrderId,
  initial,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (b: BOMFormData) => void;
  workOrderId: string;
  initial?: BOMFormData;
  saving?: boolean;
}) {
  const [form, setForm] = useState<Omit<BOMFormData, "id" | "workOrderId">>({
    materialName: "",
    quantity: 1,
    unit: "Adet",
  });
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              materialName: initial.materialName,
              quantity: initial.quantity,
              unit: initial.unit,
            }
          : { materialName: "", quantity: 1, unit: "Adet" },
      );
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.materialName.trim()) {
      toast.error(t("erp.manufacturing.material"));
      return;
    }
    onSave({
      ...form,
      id: initial?.id || generateId(),
      workOrderId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-sm"
        style={{
          backgroundColor: "oklch(1 0 0)",
          color: "oklch(0.12 0.012 270)",
        }}
        data-ocid="manufacturing.bom.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial?.id ? "Malzeme Düzenle" : "Malzeme Ekle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="bom-mat">Malzeme Adı *</Label>
            <Input
              id="bom-mat"
              value={form.materialName}
              onChange={(e) =>
                setForm((p) => ({ ...p, materialName: e.target.value }))
              }
              placeholder={t("erp.manufacturing.material")}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="manufacturing.bom.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bom-qty">Miktar</Label>
              <Input
                id="bom-qty"
                type="number"
                min={0}
                step={0.01}
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    quantity: Number(e.target.value),
                  }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Birim</Label>
              <Select
                value={form.unit}
                onValueChange={(v) => setForm((p) => ({ ...p, unit: v }))}
              >
                <SelectTrigger
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    borderColor: "oklch(0.88 0.01 270)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                  data-ocid="manufacturing.bom.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="manufacturing.bom.cancel_button"
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
              data-ocid="manufacturing.bom.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.18 25), oklch(0.55 0.16 45))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {initial?.id ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManufacturingModulePage({
  companyId,
}: ManufacturingModulePageProps) {
  const { data: mfgData, isLoading } = useGetManufacturingData(companyId);
  const { t } = useLanguage();
  const addWorkOrder = useAddWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const removeWorkOrder = useRemoveWorkOrder();
  const addBOMItem = useAddBOMItem();
  const updateBOMItem = useUpdateBOMItem();
  const removeBOMItem = useRemoveBOMItem();

  const workOrders = mfgData?.workOrders ?? [];
  const bomItems = mfgData?.bomItems ?? [];

  const [woDialog, setWODialog] = useState<{
    open: boolean;
    item?: WorkOrderFormData;
  }>({ open: false });
  const [bomDialog, setBOMDialog] = useState<{
    open: boolean;
    item?: BOMFormData;
    workOrderId: string;
  }>({ open: false, workOrderId: "" });
  const [selectedWO, setSelectedWO] = useState<string | null>(null);

  const handleSaveWO = async (formData: WorkOrderFormData) => {
    const woPayload: WorkOrder = {
      id: formData.id,
      companyId,
      productName: formData.productName,
      quantity: BigInt(formData.quantity),
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
    };
    try {
      const isExisting = workOrders.some((w) => w.id === formData.id);
      if (isExisting) {
        await updateWorkOrder.mutateAsync({ companyId, workOrder: woPayload });
        toast.success(t("erp.manufacturing.workOrderAdded"));
      } else {
        await addWorkOrder.mutateAsync({ companyId, workOrder: woPayload });
        toast.success(t("erp.manufacturing.workOrderAdded"));
      }
      setWODialog({ open: false });
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteWO = async (id: string) => {
    try {
      await removeWorkOrder.mutateAsync({ companyId, workOrderId: id });
      if (selectedWO === id) setSelectedWO(null);
      toast.success(t("erp.manufacturing.workOrderAdded"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleSaveBOM = async (formData: BOMFormData) => {
    const bomPayload: BOMItem = {
      id: formData.id,
      companyId,
      workOrderId: formData.workOrderId,
      materialName: formData.materialName,
      quantity: BigInt(Math.round(formData.quantity)),
      unit: formData.unit,
    };
    try {
      const isExisting = bomItems.some((b) => b.id === formData.id);
      if (isExisting) {
        await updateBOMItem.mutateAsync({ companyId, bomItem: bomPayload });
        toast.success(t("erp.manufacturing.bomAdded"));
      } else {
        await addBOMItem.mutateAsync({ companyId, bomItem: bomPayload });
        toast.success("Malzeme eklendi");
      }
      setBOMDialog({ open: false, workOrderId: "" });
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteBOM = async (id: string) => {
    try {
      await removeBOMItem.mutateAsync({ companyId, bomItemId: id });
      toast.success("Malzeme silindi");
    } catch {
      toast.error(t("common.error"));
    }
  };

  const activeWO = selectedWO
    ? workOrders.find((wo) => wo.id === selectedWO)
    : null;
  const activeBOMItems = selectedWO
    ? bomItems.filter((b) => b.workOrderId === selectedWO)
    : [];

  const stats = {
    total: workOrders.length,
    planned: workOrders.filter((w) => w.status === "planned").length,
    inProgress: workOrders.filter((w) => w.status === "in_progress").length,
    completed: workOrders.filter((w) => w.status === "completed").length,
  };

  if (isLoading) {
    return (
      <div
        className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]"
        data-ocid="manufacturing.loading_state"
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
    <div className="p-6 lg:p-8 max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="font-display text-2xl font-bold flex items-center gap-2"
            style={{ color: "oklch(0.12 0.012 270)" }}
          >
            <Factory
              className="w-6 h-6"
              style={{ color: "oklch(0.5 0.18 25)" }}
            />
            {t("erp.manufacturing.title")}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.5 0.01 270)" }}
          >
            İş emirleri ve malzeme listesi yönetimi
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: t("erp.manufacturing.totalOrders"),
            value: stats.total,
            bg: "oklch(0.94 0.04 25)",
            color: "oklch(0.5 0.18 25)",
          },
          {
            label: "planned",
            value: stats.planned,
            bg: "oklch(0.93 0.04 280)",
            color: "oklch(0.35 0.18 280)",
          },
          {
            label: "Devam Ediyor",
            value: stats.inProgress,
            bg: "oklch(0.94 0.06 75)",
            color: "oklch(0.42 0.14 75)",
          },
          {
            label: "completed",
            value: stats.completed,
            bg: "oklch(0.92 0.06 145)",
            color: "oklch(0.38 0.15 145)",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4"
            style={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.01 270)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                color: card.color,
              }}
            >
              {card.value}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.55 0.01 270)" }}
            >
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workorders" className="w-full">
        <TabsList
          className="mb-4"
          style={{
            backgroundColor: "oklch(0.95 0.008 270)",
            border: "1px solid oklch(0.88 0.01 270)",
          }}
        >
          <TabsTrigger
            value="workorders"
            data-ocid="manufacturing.workorders.tab"
            style={{ color: "oklch(0.35 0.01 270)" }}
          >
            {t("erp.manufacturing.workOrders")} ({workOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="bom"
            data-ocid="manufacturing.bom.tab"
            style={{ color: "oklch(0.35 0.01 270)" }}
          >
            {t("erp.manufacturing.bom")}
          </TabsTrigger>
        </TabsList>

        {/* Work Orders Tab */}
        <TabsContent value="workorders">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.01 270)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid oklch(0.88 0.01 270)" }}
            >
              <h2
                className="font-display font-semibold"
                style={{ color: "oklch(0.12 0.012 270)" }}
              >
                {t("erp.manufacturing.workOrders")}
              </h2>
              <Button
                size="sm"
                onClick={() => setWODialog({ open: true })}
                data-ocid="manufacturing.add_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.5 0.18 25), oklch(0.55 0.16 45))",
                  color: "oklch(1 0 0)",
                  border: "none",
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Yeni İş Emri
              </Button>
            </div>
            {workOrders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16"
                style={{ color: "oklch(0.55 0.01 270)" }}
                data-ocid="manufacturing.workorders.empty_state"
              >
                <Factory className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz iş emri bulunmuyor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="manufacturing.workorders.table">
                  <TableHeader>
                    <TableRow
                      style={{ borderBottom: "1px solid oklch(0.88 0.01 270)" }}
                    >
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Ürün
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Miktar
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Durum
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Başlangıç
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Bitiş
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Malzeme
                      </TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((wo, i) => {
                      const bomCount = bomItems.filter(
                        (b) => b.workOrderId === wo.id,
                      ).length;
                      return (
                        <TableRow
                          key={wo.id}
                          data-ocid={`manufacturing.workorders.row.${i + 1}`}
                          style={{
                            borderBottom: "1px solid oklch(0.93 0.005 270)",
                          }}
                          className="hover:bg-[oklch(0.975_0.005_270)] transition-colors"
                        >
                          <TableCell
                            className="font-medium"
                            style={{ color: "oklch(0.12 0.012 270)" }}
                          >
                            {wo.productName}
                          </TableCell>
                          <TableCell
                            className="font-mono"
                            style={{ color: "oklch(0.5 0.18 25)" }}
                          >
                            {Number(wo.quantity)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={wo.status} />
                          </TableCell>
                          <TableCell
                            className="text-sm"
                            style={{ color: "oklch(0.45 0.01 270)" }}
                          >
                            {wo.startDate}
                          </TableCell>
                          <TableCell
                            className="text-sm"
                            style={{ color: "oklch(0.45 0.01 270)" }}
                          >
                            {wo.endDate || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: "oklch(0.94 0.04 25)",
                                color: "oklch(0.5 0.18 25)",
                                border: "1px solid oklch(0.85 0.1 25)",
                              }}
                            >
                              <Layers className="h-3 w-3 mr-1" />
                              {bomCount} malzeme
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setWODialog({
                                    open: true,
                                    item: {
                                      id: wo.id,
                                      productName: wo.productName,
                                      quantity: Number(wo.quantity),
                                      status: wo.status as WorkOrderStatus,
                                      startDate: wo.startDate,
                                      endDate: wo.endDate,
                                      notes: wo.notes,
                                    },
                                  })
                                }
                                className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                                style={{ color: "oklch(0.5 0.01 270)" }}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWO(wo.id)}
                                data-ocid={`manufacturing.workorders.delete_button.${i + 1}`}
                                className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                style={{ color: "oklch(0.5 0.18 25)" }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* BOM Tab */}
        <TabsContent value="bom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Work Order Selector */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.01 270)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="p-4"
                style={{ borderBottom: "1px solid oklch(0.88 0.01 270)" }}
              >
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.12 0.012 270)" }}
                >
                  İş Emri Seç
                </h3>
              </div>
              {workOrders.length === 0 ? (
                <div
                  className="p-6 text-center text-sm"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  Önce bir iş emri oluşturun
                </div>
              ) : (
                <div
                  className="divide-y"
                  style={{ borderColor: "oklch(0.93 0.005 270)" }}
                >
                  {workOrders.map((wo) => (
                    <button
                      key={wo.id}
                      type="button"
                      onClick={() =>
                        setSelectedWO(selectedWO === wo.id ? null : wo.id)
                      }
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-orange-50 transition-colors"
                      style={{
                        backgroundColor:
                          selectedWO === wo.id
                            ? "oklch(0.96 0.04 25)"
                            : undefined,
                        color: "oklch(0.12 0.012 270)",
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium">{wo.productName}</p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.55 0.01 270)" }}
                        >
                          {Number(wo.quantity)} adet
                        </p>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 shrink-0"
                        style={{
                          color:
                            selectedWO === wo.id
                              ? "oklch(0.5 0.18 25)"
                              : "oklch(0.7 0.01 270)",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BOM Table */}
            <div
              className="rounded-xl overflow-hidden lg:col-span-2"
              style={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.01 270)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: "1px solid oklch(0.88 0.01 270)" }}
              >
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.12 0.012 270)" }}
                >
                  {activeWO
                    ? `${activeWO.productName} — Malzeme Listesi`
                    : "Malzeme Listesi"}
                </h3>
                {selectedWO && (
                  <Button
                    size="sm"
                    onClick={() =>
                      setBOMDialog({
                        open: true,
                        workOrderId: selectedWO,
                      })
                    }
                    data-ocid="manufacturing.bom.add_button"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.18 25), oklch(0.55 0.16 45))",
                      color: "oklch(1 0 0)",
                      border: "none",
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Malzeme Ekle
                  </Button>
                )}
              </div>
              {!selectedWO ? (
                <div
                  className="flex flex-col items-center justify-center py-16"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  <Layers className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Sol taraftan bir iş emri seçin</p>
                </div>
              ) : activeBOMItems.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                  data-ocid="manufacturing.bom.empty_state"
                >
                  <Layers className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Bu iş emri için malzeme eklenmedi</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="manufacturing.bom.table">
                    <TableHeader>
                      <TableRow
                        style={{
                          borderBottom: "1px solid oklch(0.88 0.01 270)",
                        }}
                      >
                        <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                          Malzeme
                        </TableHead>
                        <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                          Miktar
                        </TableHead>
                        <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                          Birim
                        </TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBOMItems.map((bom, i) => (
                        <TableRow
                          key={bom.id}
                          data-ocid={`manufacturing.bom.row.${i + 1}`}
                          style={{
                            borderBottom: "1px solid oklch(0.93 0.005 270)",
                          }}
                          className="hover:bg-[oklch(0.975_0.005_270)] transition-colors"
                        >
                          <TableCell
                            className="font-medium"
                            style={{ color: "oklch(0.12 0.012 270)" }}
                          >
                            {bom.materialName}
                          </TableCell>
                          <TableCell
                            className="font-mono"
                            style={{ color: "oklch(0.5 0.18 25)" }}
                          >
                            {Number(bom.quantity)}
                          </TableCell>
                          <TableCell style={{ color: "oklch(0.45 0.01 270)" }}>
                            {bom.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setBOMDialog({
                                    open: true,
                                    item: {
                                      id: bom.id,
                                      workOrderId: bom.workOrderId,
                                      materialName: bom.materialName,
                                      quantity: Number(bom.quantity),
                                      unit: bom.unit,
                                    },
                                    workOrderId: selectedWO,
                                  })
                                }
                                className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                                style={{ color: "oklch(0.5 0.01 270)" }}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBOM(bom.id)}
                                data-ocid={`manufacturing.bom.delete_button.${i + 1}`}
                                className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                style={{ color: "oklch(0.5 0.18 25)" }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <WorkOrderDialog
        open={woDialog.open}
        initial={woDialog.item}
        onClose={() => setWODialog({ open: false })}
        onSave={handleSaveWO}
        saving={addWorkOrder.isPending || updateWorkOrder.isPending}
      />
      <BOMDialog
        open={bomDialog.open}
        initial={bomDialog.item}
        onClose={() => setBOMDialog({ open: false, workOrderId: "" })}
        onSave={handleSaveBOM}
        workOrderId={bomDialog.workOrderId}
        saving={addBOMItem.isPending || updateBOMItem.isPending}
      />
    </div>
  );
}
