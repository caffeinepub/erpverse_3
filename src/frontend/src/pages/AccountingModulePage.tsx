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
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Invoice, Transaction } from "../backend";
import {
  useAddInvoice,
  useAddTransaction,
  useGetAccountingData,
  useGetFinancialSummary,
  useRemoveTransaction,
  useUpdateInvoice,
} from "../hooks/useQueries";

interface AccountingModulePageProps {
  companyId: string;
}

const INCOME_CATEGORIES = [
  "Satış Geliri",
  "Hizmet Geliri",
  "Kira Geliri",
  "Faiz Geliri",
  "Diğer Gelir",
];
const EXPENSE_CATEGORIES = [
  "Personel Gideri",
  "Kira Gideri",
  "Malzeme Gideri",
  "Pazarlama",
  "Vergi",
  "Diğer Gider",
];

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    draft: {
      backgroundColor: "oklch(0.94 0.005 270)",
      color: "oklch(0.4 0.01 270)",
      border: "1px solid oklch(0.86 0.008 270)",
    },
    sent: {
      backgroundColor: "oklch(0.94 0.06 75)",
      color: "oklch(0.45 0.14 75)",
      border: "1px solid oklch(0.85 0.1 75)",
    },
    paid: {
      backgroundColor: "oklch(0.92 0.06 145)",
      color: "oklch(0.38 0.15 145)",
      border: "1px solid oklch(0.8 0.1 145)",
    },
  };
  const labels: Record<string, string> = {
    draft: "Taslak",
    sent: "Gönderildi",
    paid: "Ödendi",
  };
  const style = styles[status] ?? styles.draft;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={style}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default function AccountingModulePage({
  companyId,
}: AccountingModulePageProps) {
  const { data: accountingData, isLoading } = useGetAccountingData(companyId);
  const { data: financialSummary } = useGetFinancialSummary(companyId);
  const transactions = accountingData?.transactions ?? [];
  const invoices = accountingData?.invoices ?? [];

  const addTransaction = useAddTransaction();
  const removeTransaction = useRemoveTransaction();
  const addInvoice = useAddInvoice();
  const updateInvoice = useUpdateInvoice();

  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txForm, setTxForm] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    category: "",
    date: "",
    description: "",
  });

  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    client: "",
    description: "",
    quantity: "1",
    unitPrice: "",
    date: "",
  });

  const summary = useMemo(() => {
    // Prefer backend financial summary when available
    if (financialSummary) {
      const netBalance = Number(financialSummary.netBalance); // Can be negative (bigint/Int)
      return {
        totalIncome: Number(financialSummary.totalIncome),
        totalExpenses: Number(financialSummary.totalExpenses),
        netBalance,
        invoiceCount: Number(financialSummary.invoiceCount),
        paidInvoiceCount: Number(financialSummary.paidInvoiceCount),
        fromBackend: true,
      };
    }
    // Fallback: local calculation from transaction list
    const totalIncome = transactions
      .filter((t) => t.transactionType === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter((t) => t.transactionType === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      invoiceCount: invoices.length,
      paidInvoiceCount: invoices.filter((inv) => inv.status === "paid").length,
      fromBackend: false,
    };
  }, [transactions, invoices, financialSummary]);

  const saveTransaction = async () => {
    if (!txForm.amount || !txForm.category || !txForm.date) return;
    try {
      await addTransaction.mutateAsync({
        companyId,
        tx: {
          id: "",
          companyId,
          transactionType: txForm.type,
          amount: BigInt(Math.round(Number(txForm.amount))),
          category: txForm.category,
          date: txForm.date,
          description: txForm.description,
        },
      });
      toast.success("İşlem eklendi");
      setShowTxDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const handleRemoveTransaction = async (txId: string) => {
    try {
      await removeTransaction.mutateAsync({ companyId, txId });
      toast.success("İşlem silindi");
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const saveInvoice = async () => {
    if (!invoiceForm.client || !invoiceForm.unitPrice) return;
    const total = Number(invoiceForm.quantity) * Number(invoiceForm.unitPrice);
    try {
      await addInvoice.mutateAsync({
        companyId,
        invoice: {
          id: "",
          companyId,
          client: invoiceForm.client,
          lineItems: [
            {
              description: invoiceForm.description,
              quantity: BigInt(Number(invoiceForm.quantity)),
              unitPrice: BigInt(Math.round(Number(invoiceForm.unitPrice))),
            },
          ],
          total: BigInt(Math.round(total)),
          status: "draft",
          date: invoiceForm.date || new Date().toISOString().split("T")[0],
        },
      });
      toast.success("Fatura oluşturuldu");
      setShowInvoiceDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const updateInvoiceStatus = async (invoice: Invoice, status: string) => {
    try {
      await updateInvoice.mutateAsync({
        companyId,
        invoice: { ...invoice, status },
      });
      toast.success("Fatura güncellendi");
    } catch {
      toast.error("Güncelleme başarısız");
    }
  };

  const fmt = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;

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
            style={{ backgroundColor: "oklch(0.92 0.06 145)" }}
          >
            <DollarSign
              className="w-5 h-5"
              style={{ color: "oklch(0.42 0.16 145)" }}
            />
          </div>
          Muhasebe
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.01 270)" }}>
          Gelir, gider ve fatura yönetimi
        </p>
      </div>

      {/* Financial Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: "oklch(0.96 0.025 145)",
              border: "1px solid oklch(0.85 0.08 145)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.42 0.14 145)" }}
                >
                  Toplam Gelir
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{
                    fontFamily: "Bricolage Grotesque, sans-serif",
                    color: "oklch(0.38 0.16 145)",
                  }}
                >
                  {fmt(summary.totalIncome)}
                </p>
              </div>
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: "oklch(0.88 0.1 145)" }}
              >
                <TrendingUp
                  className="w-6 h-6"
                  style={{ color: "oklch(0.42 0.16 145)" }}
                />
              </div>
            </div>
          </div>
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: "oklch(0.96 0.02 25)",
              border: "1px solid oklch(0.87 0.07 25)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.42 0.16 25)" }}
                >
                  Toplam Gider
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{
                    fontFamily: "Bricolage Grotesque, sans-serif",
                    color: "oklch(0.42 0.18 25)",
                  }}
                >
                  {fmt(summary.totalExpenses)}
                </p>
              </div>
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: "oklch(0.9 0.08 25)" }}
              >
                <TrendingDown
                  className="w-6 h-6"
                  style={{ color: "oklch(0.45 0.16 25)" }}
                />
              </div>
            </div>
          </div>
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor:
                summary.netBalance >= 0
                  ? "oklch(0.94 0.025 280)"
                  : "oklch(0.96 0.02 25)",
              border:
                summary.netBalance >= 0
                  ? "1px solid oklch(0.82 0.08 280)"
                  : "1px solid oklch(0.87 0.07 25)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color:
                      summary.netBalance >= 0
                        ? "oklch(0.38 0.18 280)"
                        : "oklch(0.42 0.16 25)",
                  }}
                >
                  Net Bakiye
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{
                    fontFamily: "Bricolage Grotesque, sans-serif",
                    color:
                      summary.netBalance >= 0
                        ? "oklch(0.38 0.18 280)"
                        : "oklch(0.42 0.18 25)",
                  }}
                >
                  {summary.netBalance >= 0 ? "+" : ""}
                  {fmt(summary.netBalance)}
                </p>
              </div>
              <div
                className="p-2.5 rounded-xl"
                style={{
                  backgroundColor:
                    summary.netBalance >= 0
                      ? "oklch(0.88 0.1 280)"
                      : "oklch(0.9 0.08 25)",
                }}
              >
                <DollarSign
                  className="w-6 h-6"
                  style={{
                    color:
                      summary.netBalance >= 0
                        ? "oklch(0.42 0.2 280)"
                        : "oklch(0.45 0.16 25)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="transactions">
        <TabsList
          style={{
            backgroundColor: "oklch(0.95 0.008 270)",
            border: "1px solid oklch(0.88 0.01 270)",
          }}
        >
          <TabsTrigger
            value="transactions"
            data-ocid="accounting.transactions.tab"
          >
            İşlemler
          </TabsTrigger>
          <TabsTrigger value="invoices" data-ocid="accounting.invoices.tab">
            Faturalar
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-4">
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
                  İşlem Geçmişi
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  {transactions.length} işlem kayıtlı
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setTxForm({
                    type: "income",
                    amount: "",
                    category: "",
                    date: "",
                    description: "",
                  });
                  setShowTxDialog(true);
                }}
                data-ocid="accounting.add_transaction.button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                  color: "oklch(1 0 0)",
                  border: "none",
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                İşlem Ekle
              </Button>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="accounting.transactions.empty_state"
                style={{ color: "oklch(0.6 0.01 270)" }}
              >
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz işlem kaydı yok</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                  >
                    {[
                      "Tür",
                      "Kategori",
                      "Tutar",
                      "Tarih",
                      "Açıklama",
                      "actions",
                    ].map((h) => (
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
                  {transactions.map((tx, i) => (
                    <TableRow
                      key={tx.id}
                      data-ocid={`accounting.transaction.item.${i + 1}`}
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
                        {tx.transactionType === "income" ? (
                          <span
                            className="flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: "oklch(0.42 0.16 145)" }}
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                            Gelir
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: "oklch(0.45 0.18 25)" }}
                          >
                            <ArrowDownCircle className="w-4 h-4" />
                            Gider
                          </span>
                        )}
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
                          {tx.category}
                        </span>
                      </TableCell>
                      <TableCell
                        className="font-semibold"
                        style={{
                          color:
                            tx.transactionType === "income"
                              ? "oklch(0.42 0.16 145)"
                              : "oklch(0.45 0.18 25)",
                        }}
                      >
                        {tx.transactionType === "income" ? "+" : "-"}
                        {fmt(Number(tx.amount))}
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.5 0.01 270)" }}>
                        {tx.date}
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{ color: "oklch(0.5 0.01 270)" }}
                      >
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTransaction(tx.id)}
                          data-ocid={`accounting.transaction.delete_button.${i + 1}`}
                          disabled={removeTransaction.isPending}
                          style={{ color: "oklch(0.55 0.2 25)" }}
                        >
                          {removeTransaction.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-4">
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
                  Faturalar
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  {invoices.length} fatura kayıtlı
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setInvoiceForm({
                    client: "",
                    description: "",
                    quantity: "1",
                    unitPrice: "",
                    date: "",
                  });
                  setShowInvoiceDialog(true);
                }}
                data-ocid="accounting.add_invoice.button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                  color: "oklch(1 0 0)",
                  border: "none",
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Fatura Oluştur
              </Button>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="accounting.invoices.empty_state"
                style={{ color: "oklch(0.6 0.01 270)" }}
              >
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz fatura kaydı yok</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                  >
                    {[
                      "Müşteri",
                      "Toplam",
                      "Tarih",
                      "Durum",
                      "Durum Güncelle",
                    ].map((h, i) => (
                      <TableHead
                        key={h}
                        className={i === 4 ? "text-right" : ""}
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
                  {invoices.map((inv, i) => (
                    <TableRow
                      key={inv.id}
                      data-ocid={`accounting.invoice.item.${i + 1}`}
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
                      <TableCell
                        className="font-semibold"
                        style={{ color: "oklch(0.12 0.012 270)" }}
                      >
                        {inv.client}
                      </TableCell>
                      <TableCell
                        className="font-semibold"
                        style={{ color: "oklch(0.12 0.012 270)" }}
                      >
                        {fmt(Number(inv.total))}
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.5 0.01 270)" }}>
                        {inv.date}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={inv.status}
                          onValueChange={(v) => updateInvoiceStatus(inv, v)}
                        >
                          <SelectTrigger
                            className="w-32 h-8 text-xs"
                            data-ocid={`accounting.invoice.status.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Taslak</SelectItem>
                            <SelectItem value="sent">Gönderildi</SelectItem>
                            <SelectItem value="paid">Ödendi</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Dialog */}
      <Dialog open={showTxDialog} onOpenChange={setShowTxDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: "oklch(1 0 0)",
            color: "oklch(0.12 0.012 270)",
          }}
          data-ocid="accounting.transaction.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              Yeni İşlem Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                İşlem Türü
              </Label>
              <Select
                value={txForm.type}
                onValueChange={(v) =>
                  setTxForm((p) => ({
                    ...p,
                    type: v as "income" | "expense",
                    category: "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Kategori
              </Label>
              <Select
                value={txForm.category}
                onValueChange={(v) => setTxForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {(txForm.type === "income"
                    ? INCOME_CATEGORIES
                    : EXPENSE_CATEGORIES
                  ).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Tutar (₺)
              </Label>
              <Input
                type="number"
                value={txForm.amount}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Tarih
              </Label>
              <Input
                type="date"
                value={txForm.date}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, date: e.target.value }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Açıklama
              </Label>
              <Textarea
                value={txForm.description}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="İşlem açıklaması..."
                rows={2}
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTxDialog(false)}
              style={{
                color: "oklch(0.35 0.01 270)",
                borderColor: "oklch(0.88 0.01 270)",
                backgroundColor: "oklch(1 0 0)",
              }}
            >
              İptal
            </Button>
            <Button
              onClick={saveTransaction}
              disabled={addTransaction.isPending}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {addTransaction.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: "oklch(1 0 0)",
            color: "oklch(0.12 0.012 270)",
          }}
          data-ocid="accounting.invoice.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              Yeni Fatura Oluştur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Müşteri Adı
              </Label>
              <Input
                value={invoiceForm.client}
                onChange={(e) =>
                  setInvoiceForm((p) => ({ ...p, client: e.target.value }))
                }
                placeholder="Müşteri adı"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Hizmet/Ürün Açıklaması
              </Label>
              <Input
                value={invoiceForm.description}
                onChange={(e) =>
                  setInvoiceForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Açıklama"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
                >
                  Miktar
                </Label>
                <Input
                  type="number"
                  value={invoiceForm.quantity}
                  onChange={(e) =>
                    setInvoiceForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                    borderColor: "oklch(0.88 0.01 270)",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
                >
                  Birim Fiyat (₺)
                </Label>
                <Input
                  type="number"
                  value={invoiceForm.unitPrice}
                  onChange={(e) =>
                    setInvoiceForm((p) => ({ ...p, unitPrice: e.target.value }))
                  }
                  placeholder="0"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                    borderColor: "oklch(0.88 0.01 270)",
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Tarih
              </Label>
              <Input
                type="date"
                value={invoiceForm.date}
                onChange={(e) =>
                  setInvoiceForm((p) => ({ ...p, date: e.target.value }))
                }
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>
            {invoiceForm.quantity && invoiceForm.unitPrice && (
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "oklch(0.95 0.015 280)",
                  border: "1px solid oklch(0.87 0.05 280)",
                }}
              >
                <p className="text-sm" style={{ color: "oklch(0.4 0.12 280)" }}>
                  Toplam:{" "}
                  <span
                    className="font-bold"
                    style={{ color: "oklch(0.35 0.18 280)" }}
                  >
                    {fmt(
                      Number(invoiceForm.quantity) *
                        Number(invoiceForm.unitPrice),
                    )}
                  </span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInvoiceDialog(false)}
              style={{
                color: "oklch(0.35 0.01 270)",
                borderColor: "oklch(0.88 0.01 270)",
                backgroundColor: "oklch(1 0 0)",
              }}
            >
              İptal
            </Button>
            <Button
              onClick={saveInvoice}
              disabled={addInvoice.isPending}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {addInvoice.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
