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
  CheckCircle,
  Clock,
  DollarSign,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { EmployeeRecord, LeaveRequest, SalaryInfo } from "../backend";
import {
  useAddEmployee,
  useAddLeaveRequest,
  useAddSalaryInfo,
  useGetHRData,
  useRemoveEmployee,
  useUpdateEmployee,
  useUpdateLeaveRequest,
} from "../hooks/useQueries";

interface HRModulePageProps {
  companyId: string;
  isOwnerOrManager: boolean;
}

const DEPARTMENTS = [
  "Mühendislik",
  "Pazarlama",
  "Satış",
  "İK",
  "Finans",
  "Operasyon",
];
const LEAVE_TYPES = [
  "Yıllık İzin",
  "Hastalık İzni",
  "Mazeret İzni",
  "Ücretsiz İzin",
];
const CURRENCIES = ["TRY", "USD", "EUR"];

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: "oklch(0.92 0.06 145)",
          color: "oklch(0.38 0.15 145)",
          border: "1px solid oklch(0.8 0.1 145)",
        }}
      >
        <CheckCircle className="w-3 h-3" />
        Onaylandı
      </span>
    );
  if (status === "rejected")
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: "oklch(0.95 0.04 25)",
          color: "oklch(0.45 0.18 25)",
          border: "1px solid oklch(0.85 0.1 25)",
        }}
      >
        <XCircle className="w-3 h-3" />
        Reddedildi
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: "oklch(0.94 0.06 75)",
        color: "oklch(0.45 0.14 75)",
        border: "1px solid oklch(0.85 0.1 75)",
      }}
    >
      <Clock className="w-3 h-3" />
      Bekliyor
    </span>
  );
}

function DeptBadge({ dept }: { dept: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{
        backgroundColor: "oklch(0.93 0.025 280)",
        color: "oklch(0.35 0.18 280)",
        border: "1px solid oklch(0.82 0.08 280)",
      }}
    >
      {dept}
    </span>
  );
}

export default function HRModulePage({
  companyId,
  isOwnerOrManager,
}: HRModulePageProps) {
  const { data: hrData, isLoading } = useGetHRData(companyId);
  const employees = hrData?.employees ?? [];
  const leaveRequests = hrData?.leaveRequests ?? [];
  const salaries = hrData?.salaries ?? [];

  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const removeEmployee = useRemoveEmployee();
  const addLeaveRequest = useAddLeaveRequest();
  const updateLeaveRequest = useUpdateLeaveRequest();
  const addSalaryInfo = useAddSalaryInfo();

  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(
    null,
  );
  const [empForm, setEmpForm] = useState({
    name: "",
    title: "",
    department: "",
    hireDate: "",
  });

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
  });

  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    employeeId: "",
    baseSalary: "",
    currency: "TRY",
  });

  const openAddEmployee = () => {
    setEditingEmployee(null);
    setEmpForm({ name: "", title: "", department: "", hireDate: "" });
    setShowEmployeeDialog(true);
  };

  const openEditEmployee = (emp: EmployeeRecord) => {
    setEditingEmployee(emp);
    setEmpForm({
      name: emp.name,
      title: emp.title,
      department: emp.department,
      hireDate: emp.hireDate,
    });
    setShowEmployeeDialog(true);
  };

  const saveEmployee = async () => {
    if (!empForm.name || !empForm.title) return;
    try {
      if (editingEmployee) {
        await updateEmployee.mutateAsync({
          companyId,
          employee: {
            ...editingEmployee,
            ...empForm,
          },
        });
        toast.success("Personel güncellendi");
      } else {
        await addEmployee.mutateAsync({
          companyId,
          employee: {
            id: "",
            companyId,
            name: empForm.name,
            title: empForm.title,
            department: empForm.department,
            hireDate: empForm.hireDate,
          },
        });
        toast.success("Personel eklendi");
      }
      setShowEmployeeDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      await removeEmployee.mutateAsync({ companyId, employeeId });
      toast.success("Personel silindi");
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const handleLeaveAction = async (
    req: LeaveRequest,
    action: "approved" | "rejected",
  ) => {
    try {
      await updateLeaveRequest.mutateAsync({
        companyId,
        request: { ...req, status: action },
      });
      toast.success(
        action === "approved" ? "İzin onaylandı" : "İzin reddedildi",
      );
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const saveLeaveRequest = async () => {
    if (
      !leaveForm.employeeId ||
      !leaveForm.leaveType ||
      !leaveForm.startDate ||
      !leaveForm.endDate
    )
      return;
    try {
      await addLeaveRequest.mutateAsync({
        companyId,
        request: {
          id: "",
          companyId,
          employeeId: leaveForm.employeeId,
          leaveType: leaveForm.leaveType,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          status: "pending",
        },
      });
      toast.success("İzin talebi oluşturuldu");
      setShowLeaveDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const saveSalary = async () => {
    if (!salaryForm.employeeId || !salaryForm.baseSalary) return;
    try {
      await addSalaryInfo.mutateAsync({
        companyId,
        salary: {
          id: "",
          companyId,
          employeeId: salaryForm.employeeId,
          baseSalary: BigInt(Math.round(Number(salaryForm.baseSalary))),
          currency: salaryForm.currency,
        },
      });
      toast.success("Maaş bilgisi kaydedildi");
      setShowSalaryDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name ?? employeeId;
  };

  const isSaving =
    addEmployee.isPending ||
    updateEmployee.isPending ||
    addLeaveRequest.isPending ||
    addSalaryInfo.isPending;

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
              style={{ backgroundColor: "oklch(0.92 0.04 280)" }}
            >
              <Users
                className="w-5 h-5"
                style={{ color: "oklch(0.45 0.22 280)" }}
              />
            </div>
            İnsan Kaynakları
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.01 270)" }}>
            Personel, izin ve maaş yönetimi
          </p>
        </div>
      </div>

      {/* Stats row */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Personel",
              value: employees.length,
              accent: "oklch(0.45 0.22 280)",
            },
            {
              label: "Bekleyen İzin",
              value: leaveRequests.filter((r) => r.status === "pending").length,
              accent: "oklch(0.6 0.17 50)",
            },
            {
              label: "Onaylanan İzin",
              value: leaveRequests.filter((r) => r.status === "approved")
                .length,
              accent: "oklch(0.5 0.16 145)",
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
                className="text-3xl font-bold mt-1"
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

      <Tabs defaultValue="employees">
        <TabsList
          className="mb-1"
          style={{
            backgroundColor: "oklch(0.95 0.008 270)",
            border: "1px solid oklch(0.88 0.01 270)",
          }}
        >
          <TabsTrigger value="employees" data-ocid="hr.employees.tab">
            Personel
          </TabsTrigger>
          <TabsTrigger value="leaves" data-ocid="hr.leaves.tab">
            İzin Talepleri
          </TabsTrigger>
          {isOwnerOrManager && (
            <TabsTrigger value="salaries" data-ocid="hr.salaries.tab">
              Maaş Bilgileri
            </TabsTrigger>
          )}
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="mt-4">
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
                  Personel Listesi
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  {employees.length} personel kayıtlı
                </p>
              </div>
              {isOwnerOrManager && (
                <Button
                  size="sm"
                  onClick={openAddEmployee}
                  data-ocid="hr.add_employee.button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                    color: "oklch(1 0 0)",
                    border: "none",
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Personel Ekle
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="hr.employees.empty_state"
                style={{ color: "oklch(0.6 0.01 270)" }}
              >
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz personel kaydı yok</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                  >
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      Ad Soyad
                    </TableHead>
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      Unvan
                    </TableHead>
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      Departman
                    </TableHead>
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      İşe Giriş
                    </TableHead>
                    {isOwnerOrManager && (
                      <TableHead
                        className="text-right"
                        style={{
                          color: "oklch(0.45 0.01 270)",
                          fontWeight: 600,
                        }}
                      >
                        İşlem
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp, i) => (
                    <TableRow
                      key={emp.id}
                      data-ocid={`hr.employee.item.${i + 1}`}
                      className="transition-colors"
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
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                              color: "oklch(1 0 0)",
                            }}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          {emp.name}
                        </div>
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.35 0.01 270)" }}>
                        {emp.title}
                      </TableCell>
                      <TableCell>
                        <DeptBadge dept={emp.department} />
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.5 0.01 270)" }}>
                        {emp.hireDate}
                      </TableCell>
                      {isOwnerOrManager && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditEmployee(emp)}
                              data-ocid={`hr.employee.edit_button.${i + 1}`}
                              style={{ color: "oklch(0.45 0.22 280)" }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveEmployee(emp.id)}
                              data-ocid={`hr.employee.delete_button.${i + 1}`}
                              disabled={removeEmployee.isPending}
                              style={{ color: "oklch(0.55 0.2 25)" }}
                            >
                              {removeEmployee.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Leave Requests Tab */}
        <TabsContent value="leaves" className="mt-4">
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
                  İzin Talepleri
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  Personel izin talepleri ve durumları
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setLeaveForm({
                    employeeId: "",
                    leaveType: "",
                    startDate: "",
                    endDate: "",
                  });
                  setShowLeaveDialog(true);
                }}
                data-ocid="hr.add_leave.button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                  color: "oklch(1 0 0)",
                  border: "none",
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                İzin Talebi Ekle
              </Button>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : leaveRequests.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="hr.leaves.empty_state"
                style={{ color: "oklch(0.6 0.01 270)" }}
              >
                <Clock className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Henüz izin talebi yok</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                  >
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      Personel
                    </TableHead>
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      İzin Türü
                    </TableHead>
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      Başlangıç
                    </TableHead>
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      Bitiş
                    </TableHead>
                    <TableHead
                      style={{ color: "oklch(0.45 0.01 270)", fontWeight: 600 }}
                    >
                      Durum
                    </TableHead>
                    {isOwnerOrManager && (
                      <TableHead
                        className="text-right"
                        style={{
                          color: "oklch(0.45 0.01 270)",
                          fontWeight: 600,
                        }}
                      >
                        İşlem
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((req, i) => (
                    <TableRow
                      key={req.id}
                      data-ocid={`hr.leave.item.${i + 1}`}
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
                        {getEmployeeName(req.employeeId)}
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.35 0.01 270)" }}>
                        {req.leaveType}
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.5 0.01 270)" }}>
                        {req.startDate}
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.5 0.01 270)" }}>
                        {req.endDate}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      {isOwnerOrManager && (
                        <TableCell className="text-right">
                          {req.status === "pending" && (
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleLeaveAction(req, "approved")
                                }
                                data-ocid={`hr.leave.approve.button.${i + 1}`}
                                style={{ color: "oklch(0.5 0.16 145)" }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleLeaveAction(req, "rejected")
                                }
                                data-ocid={`hr.leave.reject.button.${i + 1}`}
                                style={{ color: "oklch(0.5 0.2 25)" }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Salaries Tab */}
        {isOwnerOrManager && (
          <TabsContent value="salaries" className="mt-4">
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
                    Maaş Bilgileri
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.55 0.01 270)" }}
                  >
                    Personel maaş kayıtları (gizli)
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSalaryForm({
                      employeeId: "",
                      baseSalary: "",
                      currency: "TRY",
                    });
                    setShowSalaryDialog(true);
                  }}
                  data-ocid="hr.salary.add_button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.5 0.16 155), oklch(0.55 0.18 145))",
                    color: "oklch(1 0 0)",
                    border: "none",
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Maaş Ekle
                </Button>
              </div>
              {isLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : salaries.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="hr.salaries.empty_state"
                  style={{ color: "oklch(0.6 0.01 270)" }}
                >
                  <DollarSign className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Henüz maaş kaydı yok</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{ backgroundColor: "oklch(0.97 0.005 270)" }}
                    >
                      <TableHead
                        style={{
                          color: "oklch(0.45 0.01 270)",
                          fontWeight: 600,
                        }}
                      >
                        Personel
                      </TableHead>
                      <TableHead
                        style={{
                          color: "oklch(0.45 0.01 270)",
                          fontWeight: 600,
                        }}
                      >
                        Temel Maaş
                      </TableHead>
                      <TableHead
                        style={{
                          color: "oklch(0.45 0.01 270)",
                          fontWeight: 600,
                        }}
                      >
                        Para Birimi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaries.map((sal, i) => (
                      <TableRow
                        key={sal.id}
                        data-ocid={`hr.salary.item.${i + 1}`}
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
                          {getEmployeeName(sal.employeeId)}
                        </TableCell>
                        <TableCell
                          className="font-semibold"
                          style={{ color: "oklch(0.38 0.15 145)" }}
                        >
                          {Number(sal.baseSalary).toLocaleString("tr-TR")} ₺
                        </TableCell>
                        <TableCell>
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{
                              backgroundColor: "oklch(0.93 0.005 270)",
                              color: "oklch(0.35 0.01 270)",
                              border: "1px solid oklch(0.86 0.008 270)",
                            }}
                          >
                            {sal.currency}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Employee Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: "oklch(1 0 0)",
            color: "oklch(0.12 0.012 270)",
          }}
          data-ocid="hr.employee.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              {editingEmployee ? "Personel Düzenle" : "Yeni Personel Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Ad Soyad
              </Label>
              <Input
                value={empForm.name}
                onChange={(e) =>
                  setEmpForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ad Soyad"
                data-ocid="hr.employee.name.input"
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
                Unvan
              </Label>
              <Input
                value={empForm.title}
                onChange={(e) =>
                  setEmpForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Unvan"
                data-ocid="hr.employee.title.input"
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
                Departman
              </Label>
              <Select
                value={empForm.department}
                onValueChange={(v) =>
                  setEmpForm((p) => ({ ...p, department: v }))
                }
              >
                <SelectTrigger data-ocid="hr.employee.department.select">
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                İşe Giriş Tarihi
              </Label>
              <Input
                type="date"
                value={empForm.hireDate}
                onChange={(e) =>
                  setEmpForm((p) => ({ ...p, hireDate: e.target.value }))
                }
                data-ocid="hr.employee.hiredate.input"
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
              onClick={() => setShowEmployeeDialog(false)}
              data-ocid="hr.employee.cancel.button"
              style={{
                color: "oklch(0.35 0.01 270)",
                borderColor: "oklch(0.88 0.01 270)",
                backgroundColor: "oklch(1 0 0)",
              }}
            >
              İptal
            </Button>
            <Button
              onClick={saveEmployee}
              disabled={isSaving}
              data-ocid="hr.employee.save.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Request Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: "oklch(1 0 0)",
            color: "oklch(0.12 0.012 270)",
          }}
          data-ocid="hr.leave.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              İzin Talebi Oluştur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Personel
              </Label>
              <Select
                value={leaveForm.employeeId}
                onValueChange={(v) =>
                  setLeaveForm((p) => ({ ...p, employeeId: v }))
                }
              >
                <SelectTrigger data-ocid="hr.leave.employee.select">
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                İzin Türü
              </Label>
              <Select
                value={leaveForm.leaveType}
                onValueChange={(v) =>
                  setLeaveForm((p) => ({ ...p, leaveType: v }))
                }
              >
                <SelectTrigger data-ocid="hr.leave.type.select">
                  <SelectValue placeholder="İzin türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
                >
                  Başlangıç
                </Label>
                <Input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                  data-ocid="hr.leave.startdate.input"
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
                  Bitiş
                </Label>
                <Input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                  data-ocid="hr.leave.enddate.input"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                    borderColor: "oklch(0.88 0.01 270)",
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              data-ocid="hr.leave.cancel.button"
              style={{
                color: "oklch(0.35 0.01 270)",
                borderColor: "oklch(0.88 0.01 270)",
                backgroundColor: "oklch(1 0 0)",
              }}
            >
              İptal
            </Button>
            <Button
              onClick={saveLeaveRequest}
              disabled={addLeaveRequest.isPending}
              data-ocid="hr.leave.save.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {addLeaveRequest.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Dialog */}
      <Dialog open={showSalaryDialog} onOpenChange={setShowSalaryDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: "oklch(1 0 0)",
            color: "oklch(0.12 0.012 270)",
          }}
          data-ocid="hr.salary.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              Maaş Bilgisi Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Personel
              </Label>
              <Select
                value={salaryForm.employeeId}
                onValueChange={(v) =>
                  setSalaryForm((p) => ({ ...p, employeeId: v }))
                }
              >
                <SelectTrigger data-ocid="hr.salary.employee.select">
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Temel Maaş
              </Label>
              <Input
                type="number"
                value={salaryForm.baseSalary}
                onChange={(e) =>
                  setSalaryForm((p) => ({ ...p, baseSalary: e.target.value }))
                }
                placeholder="0"
                data-ocid="hr.salary.amount.input"
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
                Para Birimi
              </Label>
              <Select
                value={salaryForm.currency}
                onValueChange={(v) =>
                  setSalaryForm((p) => ({ ...p, currency: v }))
                }
              >
                <SelectTrigger data-ocid="hr.salary.currency.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSalaryDialog(false)}
              data-ocid="hr.salary.cancel.button"
              style={{
                color: "oklch(0.35 0.01 270)",
                borderColor: "oklch(0.88 0.01 270)",
                backgroundColor: "oklch(1 0 0)",
              }}
            >
              İptal
            </Button>
            <Button
              onClick={saveSalary}
              disabled={addSalaryInfo.isPending}
              data-ocid="hr.salary.save.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {addSalaryInfo.isPending ? (
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
