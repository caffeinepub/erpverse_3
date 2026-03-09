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
  Edit2,
  Loader2,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PurchaseOrder, Supplier } from "../backend";
import {
  useAddPurchaseOrder,
  useAddSupplier,
  useGetProcurementData,
  useRemovePurchaseOrder,
  useRemoveSupplier,
  useUpdatePurchaseOrder,
  useUpdateSupplier,
} from "../hooks/useQueries";

interface ProcurementModulePageProps {
  companyId: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const ORDER_STATUSES = [
  "pending",
  "approved",
  "delivered",
  "cancelled",
] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  pending: {
    label: "Beklemede",
    bg: "oklch(0.94 0.06 75)",
    color: "oklch(0.42 0.14 75)",
    border: "oklch(0.85 0.1 75)",
  },
  approved: {
    label: "Onaylandı",
    bg: "oklch(0.93 0.04 280)",
    color: "oklch(0.35 0.18 280)",
    border: "oklch(0.82 0.1 280)",
  },
  delivered: {
    label: "Teslim Edildi",
    bg: "oklch(0.92 0.06 145)",
    color: "oklch(0.38 0.15 145)",
    border: "oklch(0.82 0.1 145)",
  },
  cancelled: {
    label: "İptal Edildi",
    bg: "oklch(0.94 0.04 25)",
    color: "oklch(0.45 0.18 25)",
    border: "oklch(0.85 0.1 25)",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? {
    label: status,
    bg: "oklch(0.93 0.01 270)",
    color: "oklch(0.5 0.01 270)",
    border: "oklch(0.85 0.01 270)",
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

const SUPPLIER_CATEGORIES = [
  "Hammadde",
  "Yazılım",
  "Donanım",
  "Hizmet",
  "Lojistik",
  "Ofis Malzemeleri",
  "Diğer",
];

// ─── Supplier Dialog ──────────────────────────────────────────────────────────
interface SupplierFormData {
  id: string;
  name: string;
  contactInfo: string;
  category: string;
  rating: number;
}

function SupplierDialog({
  open,
  onClose,
  onSave,
  initial,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: SupplierFormData) => void;
  initial?: SupplierFormData;
  saving?: boolean;
}) {
  const [form, setForm] = useState<SupplierFormData>(
    initial ?? {
      id: "",
      name: "",
      contactInfo: "",
      category: "Diğer",
      rating: 0,
    },
  );

  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          id: "",
          name: "",
          contactInfo: "",
          category: "Diğer",
          rating: 0,
        },
      );
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tedarikçi adı zorunludur");
      return;
    }
    onSave({ ...form, id: form.id || generateId() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          backgroundColor: "oklch(1 0 0)",
          color: "oklch(0.12 0.012 270)",
        }}
        data-ocid="procurement.supplier.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial?.id ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sup-name">Tedarikçi Adı *</Label>
            <Input
              id="sup-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Tedarikçi adı"
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="procurement.supplier.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sup-cat">Kategori</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger
                id="sup-cat"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
                data-ocid="procurement.supplier.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                }}
              >
                {SUPPLIER_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sup-contact">İletişim Bilgisi</Label>
            <Textarea
              id="sup-contact"
              value={form.contactInfo}
              onChange={(e) =>
                setForm((p) => ({ ...p, contactInfo: e.target.value }))
              }
              placeholder="Adres, telefon ve ek bilgiler..."
              rows={2}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="procurement.supplier.textarea"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sup-rating">Puan (0-5)</Label>
            <Input
              id="sup-rating"
              type="number"
              min={0}
              max={5}
              value={form.rating}
              onChange={(e) =>
                setForm((p) => ({ ...p, rating: Number(e.target.value) }))
              }
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="procurement.supplier.cancel_button"
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
              data-ocid="procurement.supplier.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.18 190), oklch(0.5 0.16 210))",
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

// ─── Order Dialog ─────────────────────────────────────────────────────────────
interface OrderFormData {
  id: string;
  supplierId: string;
  itemsDescription: string;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  expectedDelivery: string;
}

function OrderDialog({
  open,
  onClose,
  onSave,
  initial,
  suppliers,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (o: OrderFormData) => void;
  initial?: OrderFormData;
  suppliers: Supplier[];
  saving?: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<OrderFormData>({
    id: "",
    supplierId: "",
    itemsDescription: "",
    totalAmount: 0,
    status: "pending",
    orderDate: today,
    expectedDelivery: "",
  });

  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          id: "",
          supplierId: "",
          itemsDescription: "",
          totalAmount: 0,
          status: "pending",
          orderDate: today,
          expectedDelivery: "",
        },
      );
    }
  }, [open, initial, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId) {
      toast.error("Tedarikçi seçiniz");
      return;
    }
    onSave({ ...form, id: form.id || generateId() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "oklch(1 0 0)",
          color: "oklch(0.12 0.012 270)",
        }}
        data-ocid="procurement.order.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial?.id ? "Sipariş Düzenle" : "Yeni Sipariş"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tedarikçi *</Label>
              <Select
                value={form.supplierId}
                onValueChange={(v) => setForm((p) => ({ ...p, supplierId: v }))}
              >
                <SelectTrigger
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    borderColor: "oklch(0.88 0.01 270)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                  data-ocid="procurement.order.select"
                >
                  <SelectValue placeholder="Tedarikçi seç..." />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    status: v as OrderStatus,
                  }))
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
              <Label htmlFor="ord-date">Sipariş Tarihi</Label>
              <Input
                id="ord-date"
                type="date"
                value={form.orderDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, orderDate: e.target.value }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ord-exp">Tahmini Teslimat</Label>
              <Input
                id="ord-exp"
                type="date"
                value={form.expectedDelivery}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expectedDelivery: e.target.value }))
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
            <Label htmlFor="ord-total">Toplam Tutar (₺)</Label>
            <Input
              id="ord-total"
              type="number"
              min={0}
              step={0.01}
              value={form.totalAmount}
              onChange={(e) =>
                setForm((p) => ({ ...p, totalAmount: Number(e.target.value) }))
              }
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ord-items">Sipariş Kalemleri / Notlar</Label>
            <Textarea
              id="ord-items"
              value={form.itemsDescription}
              onChange={(e) =>
                setForm((p) => ({ ...p, itemsDescription: e.target.value }))
              }
              placeholder="Sipariş detayları, ürün listesi..."
              rows={3}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="procurement.order.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="procurement.order.cancel_button"
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
              data-ocid="procurement.order.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.18 190), oklch(0.5 0.16 210))",
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProcurementModulePage({
  companyId,
}: ProcurementModulePageProps) {
  const { data: procData, isLoading } = useGetProcurementData(companyId);
  const addSupplier = useAddSupplier();
  const updateSupplier = useUpdateSupplier();
  const removeSupplier = useRemoveSupplier();
  const addOrder = useAddPurchaseOrder();
  const updateOrder = useUpdatePurchaseOrder();
  const removeOrder = useRemovePurchaseOrder();

  const suppliers = procData?.suppliers ?? [];
  const orders = procData?.orders ?? [];

  const [supplierDialog, setSupplierDialog] = useState<{
    open: boolean;
    item?: SupplierFormData;
  }>({ open: false });
  const [orderDialog, setOrderDialog] = useState<{
    open: boolean;
    item?: OrderFormData;
  }>({ open: false });

  const handleSaveSupplier = async (formData: SupplierFormData) => {
    const supplierPayload: Supplier = {
      id: formData.id,
      companyId,
      name: formData.name,
      contactInfo: formData.contactInfo,
      category: formData.category,
      rating: BigInt(formData.rating),
    };
    try {
      const isExisting = suppliers.some((s) => s.id === formData.id);
      if (isExisting) {
        await updateSupplier.mutateAsync({
          companyId,
          supplier: supplierPayload,
        });
        toast.success("Tedarikçi güncellendi");
      } else {
        await addSupplier.mutateAsync({ companyId, supplier: supplierPayload });
        toast.success("Tedarikçi eklendi");
      }
      setSupplierDialog({ open: false });
    } catch {
      toast.error("İşlem başarısız oldu");
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await removeSupplier.mutateAsync({ companyId, supplierId: id });
      toast.success("Tedarikçi silindi");
    } catch {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleSaveOrder = async (formData: OrderFormData) => {
    const orderPayload: PurchaseOrder = {
      id: formData.id,
      companyId,
      supplierId: formData.supplierId,
      items: formData.itemsDescription,
      totalAmount: BigInt(Math.round(formData.totalAmount)),
      status: formData.status,
      orderDate: formData.orderDate,
      expectedDelivery: formData.expectedDelivery,
    };
    try {
      const isExisting = orders.some((o) => o.id === formData.id);
      if (isExisting) {
        await updateOrder.mutateAsync({ companyId, order: orderPayload });
        toast.success("Sipariş güncellendi");
      } else {
        await addOrder.mutateAsync({ companyId, order: orderPayload });
        toast.success("Sipariş oluşturuldu");
      }
      setOrderDialog({ open: false });
    } catch {
      toast.error("İşlem başarısız oldu");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await removeOrder.mutateAsync({ companyId, orderId: id });
      toast.success("Sipariş silindi");
    } catch {
      toast.error("Silme işlemi başarısız");
    }
  };

  const getSupplierName = (id: string) =>
    suppliers.find((s) => s.id === id)?.name ?? "—";

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    approved: orders.filter((o) => o.status === "approved").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalValue: orders.reduce((s, o) => s + Number(o.totalAmount), 0),
  };

  const isMutating =
    addSupplier.isPending ||
    updateSupplier.isPending ||
    addOrder.isPending ||
    updateOrder.isPending;

  if (isLoading) {
    return (
      <div
        className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]"
        data-ocid="procurement.loading_state"
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
            <ShoppingCart
              className="w-6 h-6"
              style={{ color: "oklch(0.45 0.18 190)" }}
            />
            Satın Alma & Tedarik
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.5 0.01 270)" }}
          >
            Tedarikçi ve sipariş yönetimi
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Toplam Sipariş",
            value: stats.total,
            icon: ShoppingCart,
            bg: "oklch(0.93 0.04 190)",
            color: "oklch(0.45 0.18 190)",
          },
          {
            label: "Bekleyen",
            value: stats.pending,
            icon: Loader2,
            bg: "oklch(0.94 0.06 75)",
            color: "oklch(0.42 0.14 75)",
          },
          {
            label: "Onaylı",
            value: stats.approved,
            icon: Package,
            bg: "oklch(0.93 0.04 280)",
            color: "oklch(0.35 0.18 280)",
          },
          {
            label: "Teslim Edildi",
            value: stats.delivered,
            icon: Truck,
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
            <div
              className="p-1.5 rounded-lg w-fit mb-2"
              style={{ backgroundColor: card.bg }}
            >
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
            </div>
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
      <Tabs defaultValue="orders" className="w-full">
        <TabsList
          className="mb-4"
          style={{
            backgroundColor: "oklch(0.95 0.008 270)",
            border: "1px solid oklch(0.88 0.01 270)",
          }}
        >
          <TabsTrigger
            value="orders"
            data-ocid="procurement.orders.tab"
            style={{ color: "oklch(0.35 0.01 270)" }}
          >
            Siparişler ({orders.length})
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            data-ocid="procurement.suppliers.tab"
            style={{ color: "oklch(0.35 0.01 270)" }}
          >
            Tedarikçiler ({suppliers.length})
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
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
                Satın Alma Siparişleri
              </h2>
              <Button
                size="sm"
                onClick={() => setOrderDialog({ open: true })}
                data-ocid="procurement.add_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.18 190), oklch(0.5 0.16 210))",
                  color: "oklch(1 0 0)",
                  border: "none",
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Yeni Sipariş
              </Button>
            </div>
            {orders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16"
                style={{ color: "oklch(0.55 0.01 270)" }}
                data-ocid="procurement.orders.empty_state"
              >
                <ShoppingCart className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz sipariş bulunmuyor</p>
                <p className="text-xs mt-1 opacity-70">
                  Yukarıdaki butonu kullanarak yeni sipariş ekleyin
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="procurement.orders.table">
                  <TableHeader>
                    <TableRow
                      style={{ borderBottom: "1px solid oklch(0.88 0.01 270)" }}
                    >
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Tedarikçi
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Durum
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Sipariş Tarihi
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Tahmini Teslimat
                      </TableHead>
                      <TableHead
                        className="text-right"
                        style={{ color: "oklch(0.5 0.01 270)" }}
                      >
                        Toplam
                      </TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, i) => (
                      <TableRow
                        key={order.id}
                        data-ocid={`procurement.orders.row.${i + 1}`}
                        style={{
                          borderBottom: "1px solid oklch(0.93 0.005 270)",
                        }}
                        className="hover:bg-[oklch(0.975_0.005_270)] transition-colors"
                      >
                        <TableCell
                          className="font-medium"
                          style={{ color: "oklch(0.12 0.012 270)" }}
                        >
                          {getSupplierName(order.supplierId)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell
                          style={{ color: "oklch(0.45 0.01 270)" }}
                          className="text-sm"
                        >
                          {order.orderDate}
                        </TableCell>
                        <TableCell
                          style={{ color: "oklch(0.45 0.01 270)" }}
                          className="text-sm"
                        >
                          {order.expectedDelivery || "—"}
                        </TableCell>
                        <TableCell
                          className="text-right font-mono font-semibold text-sm"
                          style={{ color: "oklch(0.45 0.18 190)" }}
                        >
                          ₺
                          {Number(order.totalAmount).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setOrderDialog({
                                  open: true,
                                  item: {
                                    id: order.id,
                                    supplierId: order.supplierId,
                                    itemsDescription: order.items,
                                    totalAmount: Number(order.totalAmount),
                                    status: order.status as OrderStatus,
                                    orderDate: order.orderDate,
                                    expectedDelivery: order.expectedDelivery,
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
                              onClick={() => handleDeleteOrder(order.id)}
                              data-ocid={`procurement.orders.delete_button.${i + 1}`}
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
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
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
                Tedarikçiler
              </h2>
              <Button
                size="sm"
                onClick={() => setSupplierDialog({ open: true })}
                data-ocid="procurement.suppliers.add_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.18 190), oklch(0.5 0.16 210))",
                  color: "oklch(1 0 0)",
                  border: "none",
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Yeni Tedarikçi
              </Button>
            </div>
            {suppliers.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16"
                style={{ color: "oklch(0.55 0.01 270)" }}
                data-ocid="procurement.suppliers.empty_state"
              >
                <Truck className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz tedarikçi bulunmuyor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="procurement.suppliers.table">
                  <TableHeader>
                    <TableRow
                      style={{ borderBottom: "1px solid oklch(0.88 0.01 270)" }}
                    >
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Ad
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Kategori
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        İletişim
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Puan
                      </TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((sup, i) => (
                      <TableRow
                        key={sup.id}
                        data-ocid={`procurement.suppliers.row.${i + 1}`}
                        style={{
                          borderBottom: "1px solid oklch(0.93 0.005 270)",
                        }}
                        className="hover:bg-[oklch(0.975_0.005_270)] transition-colors"
                      >
                        <TableCell
                          className="font-medium"
                          style={{ color: "oklch(0.12 0.012 270)" }}
                        >
                          {sup.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: "oklch(0.93 0.04 190)",
                              color: "oklch(0.38 0.16 190)",
                              border: "1px solid oklch(0.85 0.08 190)",
                            }}
                          >
                            {sup.category}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-sm max-w-[200px] truncate"
                          style={{ color: "oklch(0.45 0.01 270)" }}
                        >
                          {sup.contactInfo || "—"}
                        </TableCell>
                        <TableCell
                          className="text-sm font-mono"
                          style={{ color: "oklch(0.45 0.18 75)" }}
                        >
                          {"★".repeat(Number(sup.rating))}
                          {"☆".repeat(Math.max(0, 5 - Number(sup.rating)))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setSupplierDialog({
                                  open: true,
                                  item: {
                                    id: sup.id,
                                    name: sup.name,
                                    contactInfo: sup.contactInfo,
                                    category: sup.category,
                                    rating: Number(sup.rating),
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
                              onClick={() => handleDeleteSupplier(sup.id)}
                              data-ocid={`procurement.suppliers.delete_button.${i + 1}`}
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
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SupplierDialog
        open={supplierDialog.open}
        initial={supplierDialog.item}
        onClose={() => setSupplierDialog({ open: false })}
        onSave={handleSaveSupplier}
        saving={addSupplier.isPending || updateSupplier.isPending}
      />
      <OrderDialog
        open={orderDialog.open}
        initial={orderDialog.item}
        onClose={() => setOrderDialog({ open: false })}
        onSave={handleSaveOrder}
        suppliers={suppliers}
        saving={addOrder.isPending || updateOrder.isPending || isMutating}
      />
    </div>
  );
}
