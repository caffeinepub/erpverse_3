import type { Principal } from "@dfinity/principal";
import { useGetStaffName } from "../hooks/useQueries";

interface StaffNameDisplayProps {
  principal: Principal | undefined;
  fallback?: string;
}

/**
 * Displays the name of a staff member by their Principal.
 * Fetches the name from the backend via useGetStaffName hook.
 * Shows "..." while loading, and fallback ("—") if not found.
 */
export default function StaffNameDisplay({
  principal,
  fallback = "—",
}: StaffNameDisplayProps) {
  const { data: name, isLoading } = useGetStaffName(principal);

  if (!principal) {
    return <span style={{ color: "oklch(0.6 0.01 270)" }}>{fallback}</span>;
  }

  if (isLoading) {
    return (
      <span style={{ color: "oklch(0.6 0.01 270)" }} aria-label="Yükleniyor">
        ...
      </span>
    );
  }

  if (!name) {
    return (
      <span
        title={principal.toString()}
        style={{
          color: "oklch(0.55 0.01 270)",
          fontFamily: "monospace",
          fontSize: "0.75rem",
        }}
      >
        {principal.toString().slice(0, 8)}…
      </span>
    );
  }

  return <span style={{ color: "oklch(0.12 0.012 270)" }}>{name}</span>;
}
