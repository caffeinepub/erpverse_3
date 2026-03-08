import type { Staff } from "@/backend";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useGetStaffForCompany,
  useGrantModuleAccess,
  useRevokeModuleAccess,
} from "@/hooks/useQueries";
import { CheckCircle, Loader2, Shield, XCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface ModulePermissionsPageProps {
  companyId: string;
}

const ERP_MODULES = [
  { name: "HR", label: "İnsan Kaynakları" },
  { name: "Accounting", label: "Muhasebe" },
  { name: "ProjectManagement", label: "Proje Yönetimi" },
  { name: "Inventory", label: "Stok/Envanter" },
  { name: "CRM", label: "CRM" },
];

const ROLE_LABELS: Record<number, string> = {
  1: "Şirket Sahibi",
  2: "Yönetici",
  3: "Yönetici Asistanı",
  4: "Personel",
};

export default function ModulePermissionsPage({
  companyId,
}: ModulePermissionsPageProps) {
  const { data: staffList, isLoading } = useGetStaffForCompany(companyId);
  const grantMutation = useGrantModuleAccess();
  const revokeMutation = useRevokeModuleAccess();

  // Track pending toggles
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  const handleToggle = async (
    staff: Staff,
    moduleName: string,
    currentlyGranted: boolean,
  ) => {
    const key = `${staff.principal.toString()}-${moduleName}`;
    if (pendingToggles.has(key)) return;

    setPendingToggles((prev) => new Set(prev).add(key));

    try {
      if (currentlyGranted) {
        await revokeMutation.mutateAsync({
          companyId,
          staffPrincipal: staff.principal,
          moduleName,
        });
        toast.success(`${moduleName} erişimi kaldırıldı`);
      } else {
        await grantMutation.mutateAsync({
          companyId,
          staffPrincipal: staff.principal,
          moduleName,
        });
        toast.success(`${moduleName} erişimi verildi`);
      }
    } catch {
      toast.error("İşlem başarısız oldu");
    } finally {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Filter out owners and managers (they always have full access)
  const managedStaff = (staffList || []).filter((s) => Number(s.roleCode) >= 3);
  const privilegedStaff = (staffList || []).filter(
    (s) => Number(s.roleCode) < 3,
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Modül İzinleri
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Personelin hangi ERP modüllerine erişebileceğini yönetin
        </p>
      </div>

      {/* Privileged staff notice */}
      {privilegedStaff.length > 0 && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-indigo-700 font-medium mb-2">
              Tam Erişimli Kullanıcılar
            </p>
            <div className="flex flex-wrap gap-2">
              {privilegedStaff.map((s) => (
                <div
                  key={s.principal.toString()}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-indigo-200 rounded-full"
                >
                  <CheckCircle className="w-3 h-3 text-indigo-600" />
                  <span className="text-xs font-medium text-gray-800">
                    {s.name}
                  </span>
                  <Badge className="text-xs h-4 px-1 bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {ROLE_LABELS[Number(s.roleCode)] || "Bilinmiyor"}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-indigo-500 mt-2">
              Şirket Sahibi ve Yöneticiler tüm modüllere otomatik olarak
              erişebilir.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Staff permissions table */}
      <Card>
        <CardHeader>
          <CardTitle>Personel Modül Erişimleri</CardTitle>
          <CardDescription>
            Her personel için modül erişimlerini açıp kapatın
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : managedStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">İzin yönetilecek personel bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground w-48">
                      Personel
                    </th>
                    {ERP_MODULES.map((m) => (
                      <th
                        key={m.name}
                        className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground min-w-[100px]"
                      >
                        {m.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {managedStaff.map((staff) => (
                    <tr
                      key={staff.principal.toString()}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-sm">{staff.name}</p>
                          <Badge variant="secondary" className="text-xs mt-0.5">
                            {ROLE_LABELS[Number(staff.roleCode)] || "Personel"}
                          </Badge>
                        </div>
                      </td>
                      {ERP_MODULES.map((m) => {
                        const granted = staff.grantedModules.includes(m.name);
                        const key = `${staff.principal.toString()}-${m.name}`;
                        const isPending = pendingToggles.has(key);
                        return (
                          <td key={m.name} className="py-3 px-2 text-center">
                            {isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={granted}
                                onCheckedChange={() =>
                                  handleToggle(staff, m.name, granted)
                                }
                                className="mx-auto"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
