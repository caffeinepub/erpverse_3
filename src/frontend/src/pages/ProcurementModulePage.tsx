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

interface ProcurementModulePageProps {
  companyId: string;
}

interface Supplier {
  id: string;
  name: string;
  contactInfo: string;
  category: string;
  email: string;
  phone: string;
}

interface OrderItem {
  description: string;
  qty: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "approved" | "delivered" | "cancelled";
  orderDate: string;
  expectedDelivery: string;
  notes: string;
}

interface ProcurementData {
  suppliers: Supplier[];
  orders: PurchaseOrder[];
}

function loadData(companyId: string): ProcurementData {
  try {
    const raw = localStorage.getItem(`erpverse_procurement_${companyId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { suppliers: [], orders: [] };
}

function saveData(companyId: string, data: ProcurementData) {
  localStorage.setItem(
    `erpverse_procurement_${companyId}`,
    JSON.stringify(data),
  );
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const STATUS_CONFIG: Record<
  PurchaseOrder["status"],
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

function StatusBadge({ status }: { status: PurchaseOrder["status"] }) {
  const cfg = STATUS_CONFIG[status];
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
function SupplierDialog({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: Supplier) => void;
  initial?: Supplier;
}) {
  const [form, setForm] = useState<Supplier>(
    initial ?? {
      id: "",
      name: "",
      contactInfo: "",
      category: "Diğer",
      email: "",
      phone: "",
    },
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          id: "",
          name: "",
          contactInfo: "",
          category: "Diğer",
          email: "",
          phone: "",
        },
      );
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tedarikçi adı zorunludur");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave({ ...form, id: form.id || generateId() });
    setSaving(false);
    onClose();
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
            {initial ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sup-email">E-posta</Label>
              <Input
                id="sup-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="ornek@sirket.com"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sup-phone">Telefon</Label>
              <Input
                id="sup-phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+90 5XX XXX XX XX"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  borderColor: "oklch(0.88 0.01 270)",
                  color: "oklch(0.12 0.012 270)",
                }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sup-contact">İletişim Bilgisi</Label>
            <Textarea
              id="sup-contact"
              value={form.contactInfo}
              onChange={(e) =>
                setForm((p) => ({ ...p, contactInfo: e.target.value }))
              }
              placeholder="Adres ve ek bilgiler..."
              rows={2}
              style={{
                backgroundColor: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.01 270)",
                color: "oklch(0.12 0.012 270)",
              }}
              data-ocid="procurement.supplier.textarea"
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
              {initial ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order Dialog ─────────────────────────────────────────────────────────────
function OrderDialog({
  open,
  onClose,
  onSave,
  initial,
  suppliers,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (o: PurchaseOrder) => void;
  initial?: PurchaseOrder;
  suppliers: Supplier[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<Omit<PurchaseOrder, "id" | "total">>({
    supplierId: "",
    items: [{ description: "", qty: 1, unitPrice: 0 }],
    status: "pending",
    orderDate: today,
    expectedDelivery: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              supplierId: initial.supplierId,
              items: initial.items,
              status: initial.status,
              orderDate: initial.orderDate,
              expectedDelivery: initial.expectedDelivery,
              notes: initial.notes,
            }
          : {
              supplierId: "",
              items: [{ description: "", qty: 1, unitPrice: 0 }],
              status: "pending",
              orderDate: today,
              expectedDelivery: "",
              notes: "",
            },
      );
    }
  }, [open, initial, today]);

  const calcTotal = (items: OrderItem[]) =>
    items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  const updateItem = (
    idx: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setForm((p) => {
      const items = [...p.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...p, items };
    });
  };

  const addItem = () =>
    setForm((p) => ({
      ...p,
      items: [...p.items, { description: "", qty: 1, unitPrice: 0 }],
    }));

  const removeItem = (idx: number) =>
    setForm((p) => ({
      ...p,
      items: p.items.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId) {
      toast.error("Tedarikçi seçiniz");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave({
      ...form,
      id: initial?.id || generateId(),
      total: calcTotal(form.items),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "oklch(1 0 0)",
          color: "oklch(0.12 0.012 270)",
        }}
        data-ocid="procurement.order.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Sipariş Düzenle" : "Yeni Sipariş"}
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
                    status: v as PurchaseOrder["status"],
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

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sipariş Kalemleri</Label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs flex items-center gap-1 font-medium"
                style={{ color: "oklch(0.45 0.18 190)" }}
              >
                <Plus className="h-3.5 w-3.5" /> Kalem Ekle
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: order items are positional
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Açıklama"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, "description", e.target.value)
                    }
                    className="flex-1"
                    style={{
                      backgroundColor: "oklch(1 0 0)",
                      borderColor: "oklch(0.88 0.01 270)",
                      color: "oklch(0.12 0.012 270)",
                    }}
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(idx, "qty", Number(e.target.value))
                    }
                    placeholder="Adet"
                    className="w-20"
                    style={{
                      backgroundColor: "oklch(1 0 0)",
                      borderColor: "oklch(0.88 0.01 270)",
                      color: "oklch(0.12 0.012 270)",
                    }}
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(idx, "unitPrice", Number(e.target.value))
                    }
                    placeholder="Birim fiyat"
                    className="w-28"
                    style={{
                      backgroundColor: "oklch(1 0 0)",
                      borderColor: "oklch(0.88 0.01 270)",
                      color: "oklch(0.12 0.012 270)",
                    }}
                  />
                  <span
                    className="text-xs font-mono w-20 text-right shrink-0"
                    style={{ color: "oklch(0.45 0.18 190)" }}
                  >
                    {(item.qty * item.unitPrice).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  {form.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded hover:bg-red-50"
                      style={{ color: "oklch(0.5 0.18 25)" }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div
              className="flex justify-end pt-2 font-semibold text-sm"
              style={{ color: "oklch(0.45 0.18 190)" }}
            >
              Toplam: ₺
              {calcTotal(form.items).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ord-notes">Notlar</Label>
            <Textarea
              id="ord-notes"
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
              {initial ? "Güncelle" : "Oluştur"}
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
  const [data, setData] = useState<ProcurementData>(() => loadData(companyId));
  const [supplierDialog, setSupplierDialog] = useState<{
    open: boolean;
    item?: Supplier;
  }>({ open: false });
  const [orderDialog, setOrderDialog] = useState<{
    open: boolean;
    item?: PurchaseOrder;
  }>({ open: false });

  const persist = (next: ProcurementData) => {
    setData(next);
    saveData(companyId, next);
  };

  const saveSupplier = (s: Supplier) => {
    const exists = data.suppliers.find((x) => x.id === s.id);
    const suppliers = exists
      ? data.suppliers.map((x) => (x.id === s.id ? s : x))
      : [...data.suppliers, s];
    persist({ ...data, suppliers });
    toast.success(exists ? "Tedarikçi güncellendi" : "Tedarikçi eklendi");
  };

  const deleteSupplier = (id: string) => {
    persist({ ...data, suppliers: data.suppliers.filter((x) => x.id !== id) });
    toast.success("Tedarikçi silindi");
  };

  const saveOrder = (o: PurchaseOrder) => {
    const exists = data.orders.find((x) => x.id === o.id);
    const orders = exists
      ? data.orders.map((x) => (x.id === o.id ? o : x))
      : [...data.orders, o];
    persist({ ...data, orders });
    toast.success(exists ? "Sipariş güncellendi" : "Sipariş oluşturuldu");
  };

  const deleteOrder = (id: string) => {
    persist({ ...data, orders: data.orders.filter((x) => x.id !== id) });
    toast.success("Sipariş silindi");
  };

  const getSupplierName = (id: string) =>
    data.suppliers.find((s) => s.id === id)?.name ?? "—";

  const stats = {
    total: data.orders.length,
    pending: data.orders.filter((o) => o.status === "pending").length,
    approved: data.orders.filter((o) => o.status === "approved").length,
    delivered: data.orders.filter((o) => o.status === "delivered").length,
    totalValue: data.orders.reduce((s, o) => s + o.total, 0),
  };

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
            Siparişler ({data.orders.length})
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            data-ocid="procurement.suppliers.tab"
            style={{ color: "oklch(0.35 0.01 270)" }}
          >
            Tedarikçiler ({data.suppliers.length})
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
            {data.orders.length === 0 ? (
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
                    {data.orders.map((order, i) => (
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
                          {order.total.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setOrderDialog({ open: true, item: order })
                              }
                              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                              style={{ color: "oklch(0.5 0.01 270)" }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteOrder(order.id)}
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
            {data.suppliers.length === 0 ? (
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
                        E-posta
                      </TableHead>
                      <TableHead style={{ color: "oklch(0.5 0.01 270)" }}>
                        Telefon
                      </TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.suppliers.map((sup, i) => (
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
                          className="text-sm"
                          style={{ color: "oklch(0.45 0.01 270)" }}
                        >
                          {sup.email || "—"}
                        </TableCell>
                        <TableCell
                          className="text-sm"
                          style={{ color: "oklch(0.45 0.01 270)" }}
                        >
                          {sup.phone || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setSupplierDialog({ open: true, item: sup })
                              }
                              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                              style={{ color: "oklch(0.5 0.01 270)" }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSupplier(sup.id)}
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
        onSave={saveSupplier}
      />
      <OrderDialog
        open={orderDialog.open}
        initial={orderDialog.item}
        onClose={() => setOrderDialog({ open: false })}
        onSave={saveOrder}
        suppliers={data.suppliers}
      />
    </div>
  );
}
