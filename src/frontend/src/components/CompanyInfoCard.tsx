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
  Briefcase,
  Building2,
  Calendar,
  Edit2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import { useUpdateCompany } from "../hooks/useQueries";

const SECTORS = [
  "Teknoloji",
  "Finans",
  "Sağlık",
  "Eğitim",
  "Perakende",
  "İmalat",
  "İnşaat",
  "Lojistik",
  "Turizm",
  "Enerji",
  "Tarım",
  "Medya",
  "Hukuk",
  "Danışmanlık",
  "Diğer",
];

interface CompanyInfoCardProps {
  company: Company;
  companyId?: string;
  isOwner?: boolean;
}

export default function CompanyInfoCard({
  company,
  companyId,
  isOwner,
}: CompanyInfoCardProps) {
  const { t } = useLanguage();
  const updateCompany = useUpdateCompany();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    name: company.name,
    taxNumber: company.taxNumber,
    sector: company.sector,
    address: company.address,
    countryCode: company.phone.countryCode,
    phoneNumber: company.phone.number,
    email: company.email,
    authorizedPerson: company.authorizedPerson,
    employeeCount: company.employeeCount.toString(),
    foundingYear: company.foundingYear.toString(),
  });

  const openEdit = () => {
    setForm({
      name: company.name,
      taxNumber: company.taxNumber,
      sector: company.sector,
      address: company.address,
      countryCode: company.phone.countryCode,
      phoneNumber: company.phone.number,
      email: company.email,
      authorizedPerson: company.authorizedPerson,
      employeeCount: company.employeeCount.toString(),
      foundingYear: company.foundingYear.toString(),
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    const id = companyId ?? company.id;
    if (!id) return;
    try {
      await updateCompany.mutateAsync({
        id,
        profile: {
          name: form.name,
          taxNumber: form.taxNumber,
          sector: form.sector,
          address: form.address,
          phone: { countryCode: form.countryCode, number: form.phoneNumber },
          email: form.email,
          authorizedPerson: form.authorizedPerson,
          employeeCount: BigInt(Number(form.employeeCount) || 0),
          foundingYear: BigInt(Number(form.foundingYear) || 0),
        },
      });
      toast.success("Şirket bilgileri güncellendi");
      setShowEdit(false);
    } catch {
      toast.error("Güncelleme başarısız oldu");
    }
  };

  const fields = [
    {
      icon: Hash,
      label: t("dashboard.owner.taxNumber"),
      value: company.taxNumber,
    },
    {
      icon: Briefcase,
      label: t("dashboard.owner.sector"),
      value: company.sector,
    },
    {
      icon: Calendar,
      label: t("dashboard.owner.founded"),
      value: company.foundingYear.toString(),
    },
    {
      icon: User,
      label: t("dashboard.owner.authorizedPerson"),
      value: company.authorizedPerson,
    },
    {
      icon: Users,
      label: t("dashboard.owner.employeeCount"),
      value: company.employeeCount.toString(),
    },
    { icon: Mail, label: t("dashboard.owner.email"), value: company.email },
    {
      icon: Phone,
      label: t("dashboard.owner.phone"),
      value: `${company.phone.countryCode} ${company.phone.number}`,
    },
    {
      icon: MapPin,
      label: t("dashboard.owner.address"),
      value: company.address,
    },
  ];

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "oklch(1 0 0)",
          border: "1px solid oklch(0.88 0.01 270)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 p-5"
          style={{
            borderBottom: "1px solid oklch(0.88 0.01 270)",
            background:
              "linear-gradient(135deg, oklch(0.93 0.025 280), oklch(0.95 0.015 300))",
          }}
        >
          <div
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: "oklch(0.45 0.22 280)" }}
          >
            <Building2 className="h-5 w-5" style={{ color: "oklch(1 0 0)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base"
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                color: "oklch(0.15 0.015 270)",
              }}
            >
              {company.name}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.5 0.08 280)" }}
            >
              {t("dashboard.owner.companyId")}: {company.id}
            </p>
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={openEdit}
              data-ocid="company.edit_button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: "oklch(0.88 0.06 280)",
                color: "oklch(0.35 0.18 280)",
                border: "1px solid oklch(0.78 0.1 280)",
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Düzenle
            </button>
          )}
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {fields.map(({ icon: Icon, label, value }, index) => (
            <div
              key={label}
              className="flex items-start gap-3 p-4"
              style={{
                borderBottom:
                  index < fields.length - 1
                    ? "1px solid oklch(0.92 0.005 270)"
                    : undefined,
                ...(index % 2 === 0 && index < fields.length - 1
                  ? { borderRight: "1px solid oklch(0.92 0.005 270)" }
                  : {}),
              }}
            >
              <div
                className="p-1.5 rounded-md flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "oklch(0.95 0.01 280)" }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: "oklch(0.45 0.22 280)" }}
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs mb-0.5 font-medium"
                  style={{ color: "oklch(0.55 0.01 270)" }}
                >
                  {label}
                </p>
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "oklch(0.15 0.012 270)" }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="company.edit.dialog"
          style={{
            backgroundColor: "oklch(1 0 0)",
            color: "oklch(0.12 0.012 270)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "oklch(0.12 0.012 270)" }}>
              Şirket Bilgilerini Düzenle
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Company Name */}
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Şirket Adı
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Şirket adı"
                data-ocid="company.edit.name.input"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>

            {/* Tax Number (readonly) */}
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Vergi No
              </Label>
              <Input
                value={form.taxNumber}
                readOnly
                disabled
                placeholder="Vergi numarası"
                style={{
                  backgroundColor: "oklch(0.96 0.005 270)",
                  color: "oklch(0.5 0.01 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Sektör
              </Label>
              <Select
                value={form.sector}
                onValueChange={(v) => setForm((p) => ({ ...p, sector: v }))}
              >
                <SelectTrigger
                  data-ocid="company.edit.sector.select"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                    borderColor: "oklch(0.88 0.01 270)",
                  }}
                >
                  <SelectValue placeholder="Sektör seçin" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                    border: "1px solid oklch(0.88 0.01 270)",
                  }}
                >
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Adres
              </Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Şirket adresi"
                data-ocid="company.edit.address.input"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Telefon
              </Label>
              <div className="flex gap-2">
                <Input
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, countryCode: e.target.value }))
                  }
                  placeholder="+90"
                  className="w-24"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                    borderColor: "oklch(0.88 0.01 270)",
                  }}
                />
                <Input
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  placeholder="5XX XXX XXXX"
                  className="flex-1"
                  data-ocid="company.edit.phone.input"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    color: "oklch(0.12 0.012 270)",
                    borderColor: "oklch(0.88 0.01 270)",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                E-posta
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="info@sirket.com"
                data-ocid="company.edit.email.input"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>

            {/* Authorized Person */}
            <div className="space-y-1.5">
              <Label
                style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
              >
                Yetkili Kişi
              </Label>
              <Input
                value={form.authorizedPerson}
                onChange={(e) =>
                  setForm((p) => ({ ...p, authorizedPerson: e.target.value }))
                }
                placeholder="Yetkili kişi adı"
                data-ocid="company.edit.authorized_person.input"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  color: "oklch(0.12 0.012 270)",
                  borderColor: "oklch(0.88 0.01 270)",
                }}
              />
            </div>

            {/* Employee Count + Founding Year */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  style={{ color: "oklch(0.25 0.012 270)", fontWeight: 600 }}
                >
                  Çalışan Sayısı
                </Label>
                <Input
                  type="number"
                  value={form.employeeCount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, employeeCount: e.target.value }))
                  }
                  placeholder="0"
                  data-ocid="company.edit.employee_count.input"
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
                  Kuruluş Yılı
                </Label>
                <Input
                  type="number"
                  value={form.foundingYear}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, foundingYear: e.target.value }))
                  }
                  placeholder="2020"
                  data-ocid="company.edit.founding_year.input"
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
              onClick={() => setShowEdit(false)}
              data-ocid="company.edit.cancel_button"
              style={{
                color: "oklch(0.35 0.01 270)",
                borderColor: "oklch(0.88 0.01 270)",
                backgroundColor: "oklch(1 0 0)",
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateCompany.isPending}
              data-ocid="company.edit.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                color: "oklch(1 0 0)",
                border: "none",
              }}
            >
              {updateCompany.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
