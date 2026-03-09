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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Edit2,
  Handshake,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { CommunicationLog, Customer, SalesOpportunity } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddCommunicationLog,
  useAddCustomer,
  useAddSalesOpportunity,
  useGetCRMData,
  useRemoveCustomer,
  useUpdateCustomer,
  useUpdateSalesOpportunity,
} from "../hooks/useQueries";

interface CRMModulePageProps {
  companyId: string;
}

const STAGES = [
  {
    value: "lead",
    labelKey: "erp.crm.prospect",
    color: "oklch(0.4 0.01 270)",
    bg: "oklch(0.94 0.005 270)",
    border: "oklch(0.86 0.008 270)",
  },
  {
    value: "qualified",
    labelKey: "erp.crm.qualified",
    color: "oklch(0.35 0.18 280)",
    bg: "oklch(0.93 0.04 280)",
    border: "oklch(0.82 0.1 280)",
  },
  {
    value: "proposal",
    labelKey: "erp.crm.proposal",
    color: "oklch(0.45 0.14 75)",
    bg: "oklch(0.94 0.06 75)",
    border: "oklch(0.85 0.1 75)",
  },
  {
    value: "won",
    labelKey: "erp.crm.closed",
    color: "oklch(0.38 0.15 145)",
    bg: "oklch(0.92 0.06 145)",
    border: "oklch(0.8 0.1 145)",
  },
  {
    value: "lost",
    labelKey: "erp.common.rejected",
    color: "oklch(0.45 0.18 25)",
    bg: "oklch(0.95 0.04 25)",
    border: "oklch(0.85 0.1 25)",
  },
];

const LOG_TYPES = [
  { value: "call", label: "Arama", icon: Phone },
  { value: "email", label: "E-posta", icon: Mail },
  { value: "meeting", label: "Toplantı", icon: Users },
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

export default function CRMModulePage({ companyId }: CRMModulePageProps) {
  const { data: crmData, isLoading } = useGetCRMData(companyId);
  const { t } = useLanguage();
  const customers = crmData?.customers ?? [];
  const opportunities = crmData?.opportunities ?? [];
  const logs = crmData?.logs ?? [];

  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const removeCustomer = useRemoveCustomer();
  const addSalesOpportunity = useAddSalesOpportunity();
  const updateSalesOpportunity = useUpdateSalesOpportunity();
  const addCommunicationLog = useAddCommunicationLog();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    contactInfo: "",
    customerCompanyName: "",
  });

  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);
  const [oppForm, setOppForm] = useState({
    estimatedValue: "",
    stage: "lead",
    closeDate: "",
  });

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logForm, setLogForm] = useState({
    note: "",
    type: "call",
  });

  const openAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: "", contactInfo: "", customerCompanyName: "" });
    setShowCustomerDialog(true);
  };

  const openEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      contactInfo: c.contactInfo,
      customerCompanyName: c.customerCompanyName,
    });
    setShowCustomerDialog(true);
  };

  const saveCustomer = async () => {
    if (!customerForm.name) return;
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({
          companyId,
          customer: {
            ...editingCustomer,
            name: customerForm.name,
            contactInfo: customerForm.contactInfo,
            customerCompanyName: customerForm.customerCompanyName,
          },
        });
        if (selectedCustomer?.id === editingCustomer.id) {
          setSelectedCustomer((prev) =>
            prev ? { ...prev, ...customerForm } : null,
          );
        }
        toast.success(t("erp.crm.customerAdded"));
      } else {
        const newCustomer = await addCustomer.mutateAsync({
          companyId,
          customer: {
            id: "",
            companyId,
            name: customerForm.name,
            contactInfo: customerForm.contactInfo,
            customerCompanyName: customerForm.customerCompanyName,
          },
        });
        toast.success(t("erp.crm.customerAdded"));
        setSelectedCustomer(newCustomer);
      }
      setShowCustomerDialog(false);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleRemoveCustomer = async (customerId: string) => {
    try {
      await removeCustomer.mutateAsync({ companyId, customerId });
      if (selectedCustomer?.id === customerId) setSelectedCustomer(null);
      toast.success(t("erp.common.success"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const saveOpportunity = async () => {
    if (!selectedCustomer) return;
    try {
      await addSalesOpportunity.mutateAsync({
        companyId,
        opportunity: {
          id: "",
          companyId,
          customerId: selectedCustomer.id,
          estimatedValue: BigInt(Math.round(Number(oppForm.estimatedValue))),
          stage: oppForm.stage,
          closeDate: oppForm.closeDate,
        },
      });
      toast.success(t("erp.crm.opportunityAdded"));
      setShowOpportunityDialog(false);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const updateOpportunityStage = async (
    opp: SalesOpportunity,
    stage: string,
  ) => {
    try {
      await updateSalesOpportunity.mutateAsync({
        companyId,
        opportunity: { ...opp, stage },
      });
    } catch {
      toast.error(t("common.error"));
    }
  };

  const saveLog = async () => {
    if (!logForm.note || !selectedCustomer) return;
    try {
      await addCommunicationLog.mutateAsync({
        companyId,
        log: {
          id: "",
          companyId,
          customerId: selectedCustomer.id,
          date: new Date().toISOString().split("T")[0],
          note: logForm.note,
          logType: logForm.type,
        },
      });
      toast.success(t("erp.crm.customerAdded"));
      setShowLogDialog(false);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const customerOpportunities = selectedCustomer
    ? opportunities.filter((o) => o.customerId === selectedCustomer.id)
    : [];

  const customerLogs = selectedCustomer
    ? [...logs]
        .filter((l) => l.customerId === selectedCustomer.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const logTypeIcon = (type: string) => {
    const t = LOG_TYPES.find((x) => x.value === type);
    const Icon = t?.icon || MessageSquare;
    return <Icon className="w-3.5 h-3.5" />;
  };

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
            style={{ backgroundColor: "oklch(0.94 0.04 330)" }}
          >
            <Handshake
              className="w-5 h-5"
              style={{ color: "oklch(0.45 0.18 330)" }}
            />
          </div>
          CRM
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.01 270)" }}>
          Müşteri, satış fırsatı ve iletişim yönetimi
        </p>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList
          style={{
            backgroundColor: "oklch(0.95 0.008 270)",
            border: "1px solid oklch(0.88 0.01 270)",
          }}
        >
          <TabsTrigger value="customers" data-ocid="crm.customers.tab">
            {t("erp.crm.customers")}
          </TabsTrigger>
          <TabsTrigger value="pipeline" data-ocid="crm.pipeline.tab">
            {t("erp.crm.pipeline")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer List */}
            <div
              className="lg:col-span-1 rounded-xl overflow-hidden"
              style={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.01 270)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: "1px solid oklch(0.91 0.005 270)" }}
              >
                <h2
                  className="font-semibold text-base"
                  style={{
                    fontFamily: "Bricolage Grotesque, sans-serif",
                    color: "oklch(0.12 0.012 270)",
                  }}
                >
                  {t("erp.crm.customers")}
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openAddCustomer}
                  data-ocid="crm.add_customer.button"
                  style={{
                    color: "oklch(0.35 0.18 280)",
                    borderColor: "oklch(0.82 0.08 280)",
                    backgroundColor: "oklch(0.96 0.015 280)",
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ekle
                </Button>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : customers.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-10 text-center"
                  data-ocid="crm.customers.empty_state"
                  style={{ color: "oklch(0.6 0.01 270)" }}
                >
                  <Handshake className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Henüz müşteri yok</p>
                </div>
              ) : (
                <ScrollArea className="h-[480px]">
                  {customers.map((c, i) => (
                    <div key={c.id} className="relative group">
                      <button
                        type="button"
                        data-ocid={`crm.customer.item.${i + 1}`}
                        className="w-full text-left px-4 py-3 transition-colors"
                        style={{
                          borderBottom: "1px solid oklch(0.93 0.005 270)",
                          backgroundColor:
                            selectedCustomer?.id === c.id
                              ? "oklch(0.94 0.025 280)"
                              : "oklch(1 0 0)",
                          borderLeft:
                            selectedCustomer?.id === c.id
                              ? "3px solid oklch(0.45 0.22 280)"
                              : "3px solid transparent",
                        }}
                        onClick={() => setSelectedCustomer(c)}
                        onMouseEnter={(e) => {
                          if (selectedCustomer?.id !== c.id)
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.backgroundColor = "oklch(0.97 0.005 280)";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedCustomer?.id !== c.id)
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.backgroundColor = "oklch(1 0 0)";
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p
                              className="font-semibold text-sm truncate"
                              style={{ color: "oklch(0.12 0.012 270)" }}
                            >
                              {c.name}
                            </p>
                            <p
                              className="text-xs mt-0.5 truncate"
                              style={{ color: "oklch(0.45 0.12 280)" }}
                            >
                              {c.customerCompanyName}
                            </p>
                            <p
                              className="text-xs mt-0.5 truncate"
                              style={{ color: "oklch(0.55 0.01 270)" }}
                            >
                              {c.contactInfo}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditCustomer(c);
                            }}
                            style={{ color: "oklch(0.5 0.12 280)" }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomer(c.id);
                        }}
                        data-ocid={`crm.customer.delete_button.${i + 1}`}
                        style={{ color: "oklch(0.55 0.2 25)" }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>

            {/* Customer Detail */}
            <div className="lg:col-span-2 space-y-4">
              {selectedCustomer ? (
                <>
                  {/* Opportunities */}
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
                      style={{
                        borderBottom: "1px solid oklch(0.91 0.005 270)",
                      }}
                    >
                      <div>
                        <h2
                          className="font-semibold text-base flex items-center gap-2"
                          style={{
                            fontFamily: "Bricolage Grotesque, sans-serif",
                            color: "oklch(0.12 0.012 270)",
                          }}
                        >
                          <TrendingUp
                            className="w-4 h-4"
                            style={{ color: "oklch(0.45 0.22 280)" }}
                          />
                          {t("erp.crm.opportunities")}
                        </h2>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(0.55 0.01 270)" }}
                        >
                          {selectedCustomer.name} için fırsatlar
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOppForm({
                            estimatedValue: "",
                            stage: "lead",
                            closeDate: "",
                          });
                          setShowOpportunityDialog(true);
                        }}
                        data-ocid="crm.add_opportunity.button"
                        style={{
                          color: "oklch(0.35 0.18 280)",
                          borderColor: "oklch(0.82 0.08 280)",
                          backgroundColor: "oklch(0.96 0.015 280)",
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {t("erp.crm.addOpportunity")}
                      </Button>
                    </div>
                    {customerOpportunities.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow
                            style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                          >
                            {["Tahmini Değer", "Kapanış", "Aşama"].map((h) => (
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
                          {customerOpportunities.map((opp, i) => (
                            <TableRow
                              key={opp.id}
                              data-ocid={`crm.opportunity.item.${i + 1}`}
                              style={{ backgroundColor: "oklch(1 0 0)" }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLTableRowElement
                                ).style.backgroundColor =
                                  "oklch(0.97 0.005 280)";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLTableRowElement
                                ).style.backgroundColor = "oklch(1 0 0)";
                              }}
                            >
                              <TableCell
                                style={{
                                  color: "oklch(0.35 0.01 270)",
                                  fontWeight: 600,
                                }}
                              >
                                {Number(opp.estimatedValue).toLocaleString(
                                  "tr-TR",
                                )}{" "}
                                ₺
                              </TableCell>
                              <TableCell
                                style={{ color: "oklch(0.5 0.01 270)" }}
                              >
                                {opp.closeDate}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={opp.stage}
                                  onValueChange={(v) =>
                                    updateOpportunityStage(opp, v)
                                  }
                                >
                                  <SelectTrigger
                                    className="w-32 h-7 text-xs"
                                    data-ocid={`crm.opportunity.stage.select.${i + 1}`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STAGES.map((s) => (
                                      <SelectItem key={s.value} value={s.value}>
                                        {t(s.labelKey)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div
                        className="flex items-center justify-center py-10"
                        data-ocid="crm.opportunities.empty_state"
                        style={{ color: "oklch(0.6 0.01 270)" }}
                      >
                        <p className="text-sm">
                          {t("erp.crm.noOpportunities")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Communication Log */}
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
                      style={{
                        borderBottom: "1px solid oklch(0.91 0.005 270)",
                      }}
                    >
                      <h2
                        className="font-semibold text-base flex items-center gap-2"
                        style={{
                          fontFamily: "Bricolage Grotesque, sans-serif",
                          color: "oklch(0.12 0.012 270)",
                        }}
                      >
                        <MessageSquare
                          className="w-4 h-4"
                          style={{ color: "oklch(0.45 0.22 280)" }}
                        />
                        İletişim Geçmişi
                      </h2>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setLogForm({ note: "", type: "call" });
                          setShowLogDialog(true);
                        }}
                        data-ocid="crm.add_log.button"
                        style={{
                          color: "oklch(0.35 0.18 280)",
                          borderColor: "oklch(0.82 0.08 280)",
                          backgroundColor: "oklch(0.96 0.015 280)",
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Not Ekle
                      </Button>
                    </div>
                    <div className="p-4">
                      {customerLogs.length > 0 ? (
                        <div className="space-y-3">
                          {customerLogs.map((log, i) => (
                            <div
                              key={log.id}
                              data-ocid={`crm.log.item.${i + 1}`}
                              className="flex gap-3 p-3 rounded-lg"
                              style={{
                                backgroundColor: "oklch(0.96 0.01 280)",
                                border: "1px solid oklch(0.9 0.02 280)",
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: "oklch(0.88 0.06 280)",
                                  color: "oklch(0.35 0.18 280)",
                                }}
                              >
                                {logTypeIcon(log.logType)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                                    style={{
                                      backgroundColor: "oklch(0.88 0.06 280)",
                                      color: "oklch(0.35 0.18 280)",
                                      border: "1px solid oklch(0.82 0.1 280)",
                                    }}
                                  >
                                    {LOG_TYPES.find(
                                      (t) => t.value === log.logType,
                                    )?.label ?? log.logType}
                                  </span>
                                  <span
                                    className="text-xs"
                                    style={{ color: "oklch(0.55 0.01 270)" }}
                                  >
                                    {log.date}
                                  </span>
                                </div>
                                <p
                                  className="text-sm"
                                  style={{ color: "oklch(0.2 0.01 270)" }}
                                >
                                  {log.note}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p
                          className="text-center text-sm py-6"
                          data-ocid="crm.logs.empty_state"
                          style={{ color: "oklch(0.6 0.01 270)" }}
                        >
                          {t("erp.common.noData")}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="flex items-center justify-center h-64 rounded-xl"
                  style={{
                    backgroundColor: "oklch(0.975 0.01 270)",
                    border: "1px solid oklch(0.88 0.01 270)",
                  }}
                >
                  <div className="text-center">
                    <Handshake
                      className="w-12 h-12 mx-auto mb-3"
                      style={{ color: "oklch(0.7 0.05 270)" }}
                    />
                    <p style={{ color: "oklch(0.5 0.01 270)" }}>
                      Detayları görmek için bir müşteri seçin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STAGES.map((stage) => {
                const stageOpps = opportunities.filter(
                  (o) => o.stage === stage.value,
                );
                const totalValue = stageOpps.reduce(
                  (sum, o) => sum + Number(o.estimatedValue),
                  0,
                );
                return (
                  <div
                    key={stage.value}
                    className="rounded-xl flex flex-col"
                    data-ocid={`crm.pipeline.${stage.value}.panel`}
                    style={{
                      backgroundColor: stage.bg,
                      border: `1px solid ${stage.border}`,
                      minHeight: "200px",
                    }}
                  >
                    {/* Column header */}
                    <div
                      className="px-3 py-3 rounded-t-xl"
                      style={{
                        borderBottom: `1px solid ${stage.border}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: stage.color }}
                        >
                          {t(stage.labelKey)}
                        </span>
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.6)",
                            color: stage.color,
                          }}
                        >
                          {stageOpps.length}
                        </span>
                      </div>
                      {totalValue > 0 && (
                        <p
                          className="text-xs font-semibold"
                          style={{ color: stage.color }}
                        >
                          ₺{totalValue.toLocaleString("tr-TR")}
                        </p>
                      )}
                    </div>
                    {/* Opportunities */}
                    <div className="p-2 flex flex-col gap-2 flex-1">
                      {stageOpps.length === 0 ? (
                        <p
                          className="text-center text-xs py-6 opacity-50"
                          style={{ color: stage.color }}
                        >
                          Fırsat yok
                        </p>
                      ) : (
                        stageOpps.map((opp, i) => {
                          const customer = customers.find(
                            (c) => c.id === opp.customerId,
                          );
                          return (
                            <div
                              key={opp.id}
                              data-ocid={`crm.pipeline.opportunity.item.${i + 1}`}
                              className="rounded-lg p-2.5"
                              style={{
                                backgroundColor: "oklch(1 0 0)",
                                border: "1px solid oklch(0.91 0.005 270)",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                              }}
                            >
                              <p
                                className="font-semibold text-xs leading-snug mb-1"
                                style={{ color: "oklch(0.12 0.012 270)" }}
                              >
                                {customer?.name ?? "—"}
                              </p>
                              {customer?.customerCompanyName && (
                                <p
                                  className="text-xs mb-1 truncate"
                                  style={{ color: "oklch(0.5 0.01 270)" }}
                                >
                                  {customer.customerCompanyName}
                                </p>
                              )}
                              <p
                                className="text-xs font-bold"
                                style={{ color: stage.color }}
                              >
                                ₺
                                {Number(opp.estimatedValue).toLocaleString(
                                  "tr-TR",
                                )}
                              </p>
                              {opp.closeDate && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: "oklch(0.55 0.01 270)" }}
                                >
                                  {opp.closeDate}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={DIALOG_STYLE}
          data-ocid="crm.customer.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              {editingCustomer
                ? t("erp.common.edit")
                : t("erp.crm.addCustomer")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Ad Soyad</Label>
              <Input
                value={customerForm.name}
                onChange={(e) =>
                  setCustomerForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t("erp.crm.customerName")}
                style={INPUT_STYLE}
                data-ocid="crm.customer.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Şirket Adı</Label>
              <Input
                value={customerForm.customerCompanyName}
                onChange={(e) =>
                  setCustomerForm((p) => ({
                    ...p,
                    customerCompanyName: e.target.value,
                  }))
                }
                placeholder={t("erp.common.company")}
                style={INPUT_STYLE}
                data-ocid="crm.customer.company.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>İletişim Bilgisi</Label>
              <Input
                value={customerForm.contactInfo}
                onChange={(e) =>
                  setCustomerForm((p) => ({
                    ...p,
                    contactInfo: e.target.value,
                  }))
                }
                placeholder="E-posta veya telefon"
                style={INPUT_STYLE}
                data-ocid="crm.customer.contact.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomerDialog(false)}
              style={BTN_CANCEL_STYLE}
            >
              {t("erp.common.cancel")}
            </Button>
            <Button
              onClick={saveCustomer}
              disabled={addCustomer.isPending || updateCustomer.isPending}
              style={BTN_PRIMARY_STYLE}
              data-ocid="crm.customer.save.button"
            >
              {addCustomer.isPending || updateCustomer.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("erp.common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opportunity Dialog */}
      <Dialog
        open={showOpportunityDialog}
        onOpenChange={setShowOpportunityDialog}
      >
        <DialogContent
          className="sm:max-w-md"
          style={DIALOG_STYLE}
          data-ocid="crm.opportunity.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              Yeni Satış Fırsatı
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Tahmini Değer (₺)</Label>
              <Input
                type="number"
                value={oppForm.estimatedValue}
                onChange={(e) =>
                  setOppForm((p) => ({ ...p, estimatedValue: e.target.value }))
                }
                placeholder="0"
                style={INPUT_STYLE}
                data-ocid="crm.opportunity.value.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Aşama</Label>
              <Select
                value={oppForm.stage}
                onValueChange={(v) => setOppForm((p) => ({ ...p, stage: v }))}
              >
                <SelectTrigger data-ocid="crm.opportunity.stage.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {t(s.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Tahmini Kapanış Tarihi</Label>
              <Input
                type="date"
                value={oppForm.closeDate}
                onChange={(e) =>
                  setOppForm((p) => ({ ...p, closeDate: e.target.value }))
                }
                style={INPUT_STYLE}
                data-ocid="crm.opportunity.closedate.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOpportunityDialog(false)}
              style={BTN_CANCEL_STYLE}
            >
              {t("erp.common.cancel")}
            </Button>
            <Button
              onClick={saveOpportunity}
              disabled={addSalesOpportunity.isPending}
              style={BTN_PRIMARY_STYLE}
              data-ocid="crm.opportunity.save.button"
            >
              {addSalesOpportunity.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={DIALOG_STYLE}
          data-ocid="crm.log.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              İletişim Notu Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>İletişim Türü</Label>
              <Select
                value={logForm.type}
                onValueChange={(v) => setLogForm((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger data-ocid="crm.log.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label style={LABEL_STYLE}>Not</Label>
              <Textarea
                value={logForm.note}
                onChange={(e) =>
                  setLogForm((p) => ({ ...p, note: e.target.value }))
                }
                placeholder={t("erp.common.notes")}
                rows={3}
                style={INPUT_STYLE}
                data-ocid="crm.log.note.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogDialog(false)}
              style={BTN_CANCEL_STYLE}
            >
              {t("erp.common.cancel")}
            </Button>
            <Button
              onClick={saveLog}
              disabled={addCommunicationLog.isPending}
              style={BTN_PRIMARY_STYLE}
              data-ocid="crm.log.save.button"
            >
              {addCommunicationLog.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("erp.common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
