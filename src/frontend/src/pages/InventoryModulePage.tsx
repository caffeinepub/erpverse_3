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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Edit2,
  History,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product, StockMovement } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddProduct,
  useAddStockMovement,
  useGetInventoryData,
  useRemoveProduct,
  useUpdateProduct,
} from "../hooks/useQueries";

interface InventoryModulePageProps {
  companyId: string;
}

const CATEGORIES = [
  "Elektronik",
  "Ofis Malzemesi",
  "Hammadde",
  "Yarı Mamul",
  "Bitmiş Ürün",
  "Diğer",
];

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

// Stock level thresholds
const CRITICAL_STOCK_THRESHOLD = 5;
const LOW_STOCK_THRESHOLD = 20;

type StockLevel = "critical" | "low" | "normal";

function getStockLevel(qty: bigint): StockLevel {
  const n = Number(qty);
  if (n < CRITICAL_STOCK_THRESHOLD) return "critical";
  if (n < LOW_STOCK_THRESHOLD) return "low";
  return "normal";
}

const STOCK_LEVEL_CONFIG = {
  critical: {
    label: "Kritik",
    bg: "oklch(0.95 0.04 25)",
    color: "oklch(0.45 0.18 25)",
    border: "oklch(0.85 0.1 25)",
    rowBg: "oklch(0.98 0.015 25)",
    rowBgHover: "oklch(0.96 0.02 25)",
  },
  low: {
    label: "Düşük",
    bg: "oklch(0.94 0.07 65)",
    color: "oklch(0.42 0.16 50)",
    border: "oklch(0.84 0.1 65)",
    rowBg: "oklch(0.985 0.01 65)",
    rowBgHover: "oklch(0.97 0.015 65)",
  },
  normal: {
    label: "normal",
    bg: "oklch(0.92 0.06 145)",
    color: "oklch(0.38 0.15 145)",
    border: "oklch(0.8 0.1 145)",
    rowBg: "oklch(1 0 0)",
    rowBgHover: "oklch(0.97 0.005 280)",
  },
};

export default function InventoryModulePage({
  companyId,
}: InventoryModulePageProps) {
  const { data: inventoryData, isLoading } = useGetInventoryData(companyId);
  const { t } = useLanguage();
  const products = inventoryData?.products ?? [];
  const movements = inventoryData?.movements ?? [];

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const removeProduct = useRemoveProduct();
  const addStockMovement = useAddStockMovement();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    quantityOnHand: "",
  });

  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [movementForm, setMovementForm] = useState({
    productId: "",
    type: "in" as "in" | "out",
    quantity: "",
    reason: "",
  });

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      sku: "",
      category: "",
      unitPrice: "",
      quantityOnHand: "",
    });
    setShowProductDialog(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: String(Number(p.unitPrice)),
      quantityOnHand: String(Number(p.quantityOnHand)),
    });
    setShowProductDialog(true);
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.sku) return;
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          companyId,
          product: {
            ...editingProduct,
            name: productForm.name,
            sku: productForm.sku,
            category: productForm.category,
            unitPrice: BigInt(Math.round(Number(productForm.unitPrice))),
            quantityOnHand: BigInt(
              Math.round(Number(productForm.quantityOnHand)),
            ),
          },
        });
        toast.success("Ürün güncellendi");
      } else {
        await addProduct.mutateAsync({
          companyId,
          product: {
            id: "",
            companyId,
            name: productForm.name,
            sku: productForm.sku,
            category: productForm.category,
            unitPrice: BigInt(Math.round(Number(productForm.unitPrice))),
            quantityOnHand: BigInt(
              Math.round(Number(productForm.quantityOnHand)),
            ),
          },
        });
        toast.success("Ürün eklendi");
      }
      setShowProductDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeProduct.mutateAsync({ companyId, productId });
      toast.success("Ürün silindi");
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const saveMovement = async () => {
    if (!movementForm.productId || !movementForm.quantity) return;
    try {
      await addStockMovement.mutateAsync({
        companyId,
        movement: {
          id: "",
          companyId,
          productId: movementForm.productId,
          movementType: movementForm.type,
          quantity: BigInt(Math.round(Number(movementForm.quantity))),
          date: new Date().toISOString().split("T")[0],
          reason: movementForm.reason,
        },
      });
      toast.success("Stok hareketi kaydedildi");
      setShowMovementDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const isLowStock = (p: Product) =>
    getStockLevel(p.quantityOnHand) !== "normal";
  const lowStockCount = products.filter(isLowStock).length;
  const filteredMovements = selectedProductId
    ? movements.filter((m) => m.productId === selectedProductId)
    : movements;

  const getProductName = (productId: string) =>
    products.find((p) => p.id === productId)?.name ?? productId;

  const totalStockValue = products.reduce(
    (s, p) => s + Number(p.unitPrice) * Number(p.quantityOnHand),
    0,
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
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
              style={{ backgroundColor: "oklch(0.94 0.06 65)" }}
            >
              <Package
                className="w-5 h-5"
                style={{ color: "oklch(0.45 0.16 50)" }}
              />
            </div>
            Stok / Envanter
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.01 270)" }}>
            Ürün ve stok hareketi yönetimi
          </p>
        </div>
        {lowStockCount > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              backgroundColor: "oklch(0.95 0.04 25)",
              border: "1px solid oklch(0.85 0.1 25)",
            }}
          >
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: "oklch(0.45 0.18 25)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.42 0.18 25)" }}
            >
              {lowStockCount} ürün düşük stokta
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Ürün",
              value: products.length,
              accent: "oklch(0.45 0.22 280)",
            },
            {
              label: t("erp.inventory.lowStock"),
              value: lowStockCount,
              accent: "oklch(0.45 0.18 25)",
            },
            {
              label: "Toplam Hareket",
              value: movements.length,
              accent: "oklch(0.5 0.16 145)",
            },
            {
              label: "Toplam Stok Değeri",
              value: `₺${totalStockValue.toLocaleString("tr-TR")}`,
              accent: "oklch(0.45 0.16 50)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.01 270)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "oklch(0.55 0.01 270)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{
                  fontFamily: "Bricolage Grotesque, sans-serif",
                  color: stat.accent,
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="products">
        <TabsList
          style={{
            backgroundColor: "oklch(0.95 0.008 270)",
            border: "1px solid oklch(0.88 0.01 270)",
          }}
        >
          <TabsTrigger value="products" data-ocid="inventory.products.tab">
            Ürünler
          </TabsTrigger>
          <TabsTrigger value="movements" data-ocid="inventory.movements.tab">
            Stok Hareketleri
          </TabsTrigger>
        </TabsList>

        {/* Products */}
        <TabsContent value="products" className="mt-4">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.01 270)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid oklch(0.91 0.005 270)" }}
            >
              <div>
                <h2
                  className="font-semibold text-base"
                  style={{
                    fontFamily: "Bricolage Grotesque, sans-serif",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  Ürün Listesi
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  {products.length} ürün kayıtlı
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMovementForm({
                      productId: "",
                      type: "in",
                      quantity: "",
                      reason: "",
                    });
                    setShowMovementDialog(true);
                  }}
                  data-ocid="inventory.add_movement.button"
                  style={{
                    color: "oklch(0.35 0.18 280)",
                    borderColor: "oklch(0.82 0.08 280)",
                    backgroundColor: "oklch(0.96 0.015 280)",
                  }}
                >
                  <History className="w-4 h-4 mr-1" />
                  Stok Hareketi
                </Button>
                <Button
                  size="sm"
                  onClick={openAddProduct}
                  data-ocid="inventory.add_product.button"
                  style={BTN_PRIMARY_STYLE}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ürün Ekle
                </Button>
              </div>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="inventory.products.empty_state"
                style={{ color: "oklch(0.6 0.01 270)" }}
              >
                <Package className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz ürün kaydı yok</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                  >
                    {[
                      "Ürün Adı",
                      "SKU",
                      "Kategori",
                      "Birim Fiyat",
                      "Stok",
                      "Seviye",
                      "İşlem",
                    ].map((h, i) => (
                      <TableHead
                        key={h}
                        className={i === 6 ? "text-right" : ""}
                        style={{
                          color: "oklch(0.45 0.01 270)",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, i) => {
                    const level = getStockLevel(p.quantityOnHand);
                    const levelCfg = STOCK_LEVEL_CONFIG[level];
                    return (
                      <TableRow
                        key={p.id}
                        data-ocid={`inventory.product.item.${i + 1}`}
                        style={{
                          backgroundColor: levelCfg.rowBg,
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = levelCfg.rowBgHover;
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = levelCfg.rowBg;
                        }}
                      >
                        <TableCell
                          className="font-semibold"
                          style={{ color: "oklch(0.12 0.012 270)" }}
                        >
                          <div className="flex items-center gap-2">
                            {p.name}
                            {level === "critical" && (
                              <AlertTriangle
                                className="w-3.5 h-3.5"
                                style={{ color: "oklch(0.45 0.18 25)" }}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="font-mono text-sm"
                          style={{ color: "oklch(0.5 0.01 270)" }}
                        >
                          {p.sku}
                        </TableCell>
                        <TableCell>
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: "oklch(0.93 0.025 280)",
                              color: "oklch(0.35 0.18 280)",
                              border: "1px solid oklch(0.82 0.08 280)",
                            }}
                          >
                            {p.category}
                          </span>
                        </TableCell>
                        <TableCell
                          style={{
                            color: "oklch(0.25 0.01 270)",
                            fontWeight: 600,
                          }}
                        >
                          {Number(p.unitPrice).toLocaleString("tr-TR")} ₺
                        </TableCell>
                        <TableCell>
                          <span
                            className="font-bold"
                            style={{ color: levelCfg.color }}
                          >
                            {String(p.quantityOnHand)}
                          </span>
                        </TableCell>
                        {/* Stock level badge */}
                        <TableCell>
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: levelCfg.bg,
                              color: levelCfg.color,
                              border: `1px solid ${levelCfg.border}`,
                            }}
                          >
                            {t(`erp.inventory.${levelCfg.label}Stock`)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditProduct(p)}
                              data-ocid={`inventory.product.edit_button.${i + 1}`}
                              style={{ color: "oklch(0.45 0.22 280)" }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(p.id)}
                              data-ocid={`inventory.product.delete_button.${i + 1}`}
                              disabled={removeProduct.isPending}
                              style={{ color: "oklch(0.55 0.2 25)" }}
                            >
                              {removeProduct.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Movements */}
        <TabsContent value="movements" className="mt-4">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.01 270)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid oklch(0.91 0.005 270)" }}
            >
              <div>
                <h2
                  className="font-semibold text-base"
                  style={{
                    fontFamily: "Bricolage Grotesque, sans-serif",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  Stok Hareketleri
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  Giriş ve çıkış kayıtları
                </p>
              </div>
              <Select
                value={selectedProductId || "all"}
                onValueChange={(v) =>
                  setSelectedProductId(v === "all" ? null : v)
                }
              >
                <SelectTrigger
                  className="w-48"
                  data-ocid="inventory.movements.filter.select"
                >
                  <SelectValue placeholder="Tüm ürünler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm ürünler</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredMovements.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="inventory.movements.empty_state"
                style={{ color: "oklch(0.6 0.01 270)" }}
              >
                <History className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz stok hareketi yok</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                  >
                    {["Tür", "Ürün", "Miktar", "Tarih", "Neden"].map((h) => (
                      <TableHead
                        key={h}
                        style={{
                          color: "oklch(0.45 0.01 270)",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((m, i) => (
                    <TableRow
                      key={m.id}
                      data-ocid={`inventory.movement.item.${i + 1}`}
                      style={{ backgroundColor: "oklch(1 0 0)" }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.backgroundColor = "oklch(0.97 0.005 280)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.backgroundColor = "oklch(1 0 0)";
                      }}
                    >
                      <TableCell>
                        {m.movementType === "in" ? (
                          <span
                            className="flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: "oklch(0.42 0.16 145)" }}
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                            Giriş
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: "oklch(0.45 0.18 25)" }}
                          >
                            <ArrowDownCircle className="w-4 h-4" />
                            Çıkış
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="font-semibold"
                        style={{ color: "oklch(0.12 0.012 270)" }}
                      >
                        {getProductName(m.productId)}
                      </TableCell>
                      <TableCell
                        className="font-bold"
                        style={{
                          color:
                            m.movementType === "in"
                              ? "oklch(0.42 0.16 145)"
                              : "oklch(0.45 0.18 25)",
                        }}
                      >
                        {m.movementType === "in" ? "+" : "-"}
                        {String(m.quantity)}
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.5 0.01 270)" }}>
                        {m.date}
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.5 0.01 270)" }}>
                        {m.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={DIALOG_STYLE}
          data-ocid="inventory.product.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label style={LABEL_STYLE}>Ürün Adı</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Ürün adı"
                  style={INPUT_STYLE}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={LABEL_STYLE}>SKU</Label>
                <Input
                  value={productForm.sku}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, sku: e.target.value }))
                  }
                  placeholder="SKU kodu"
                  style={INPUT_STYLE}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Kategori</Label>
              <Select
                value={productForm.category}
                onValueChange={(v) =>
                  setProductForm((p) => ({ ...p, category: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label style={LABEL_STYLE}>Birim Fiyat (₺)</Label>
                <Input
                  type="number"
                  value={productForm.unitPrice}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, unitPrice: e.target.value }))
                  }
                  placeholder="0"
                  style={INPUT_STYLE}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={LABEL_STYLE}>Stok Miktarı</Label>
                <Input
                  type="number"
                  value={productForm.quantityOnHand}
                  onChange={(e) =>
                    setProductForm((p) => ({
                      ...p,
                      quantityOnHand: e.target.value,
                    }))
                  }
                  placeholder="0"
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProductDialog(false)}
              style={BTN_CANCEL_STYLE}
            >
              İptal
            </Button>
            <Button
              onClick={saveProduct}
              disabled={addProduct.isPending || updateProduct.isPending}
              style={BTN_PRIMARY_STYLE}
            >
              {addProduct.isPending || updateProduct.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={DIALOG_STYLE}
          data-ocid="inventory.movement.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              Stok Hareketi Kaydet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Ürün</Label>
              <Select
                value={movementForm.productId}
                onValueChange={(v) =>
                  setMovementForm((p) => ({ ...p, productId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ürün seçin" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Hareket Türü</Label>
              <Select
                value={movementForm.type}
                onValueChange={(v) =>
                  setMovementForm((p) => ({ ...p, type: v as "in" | "out" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stok Girişi</SelectItem>
                  <SelectItem value="out">Stok Çıkışı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Miktar</Label>
              <Input
                type="number"
                value={movementForm.quantity}
                onChange={(e) =>
                  setMovementForm((p) => ({ ...p, quantity: e.target.value }))
                }
                placeholder="0"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Neden</Label>
              <Input
                value={movementForm.reason}
                onChange={(e) =>
                  setMovementForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="Hareket nedeni"
                style={INPUT_STYLE}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMovementDialog(false)}
              style={BTN_CANCEL_STYLE}
            >
              İptal
            </Button>
            <Button
              onClick={saveMovement}
              disabled={addStockMovement.isPending}
              style={BTN_PRIMARY_STYLE}
            >
              {addStockMovement.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
