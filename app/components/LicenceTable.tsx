import { LicenceData } from "@/app/types";

interface LicenceTableProps {
  data: LicenceData;
}

export default function LicenceTable({ data }: LicenceTableProps) {
  const rows: { label: string; value: string; rtl?: boolean }[] = [
    { label: "Trade License Number", value: data.tradeLicenseNumber },
    { label: "ADCCI Number",          value: data.adcciNumber },
    { label: "Trade Name",            value: data.tradeName },
    { label: "License Type",          value: data.licenseType },
    { label: "Branch",                value: data.branch },
    { label: "Issuance Place",        value: data.issuancePlace },
    { label: "Establishment Date",    value: data.establishmentDate },
    { label: "Registration Date",     value: data.registrationDate },
    { label: "Expiry Date",           value: data.expiryDate },
    { label: "License Status",        value: data.licenseStatus },
    { label: "Address",               value: data.address, rtl: true },
    { label: "Establishment Volume",  value: data.establishmentVolume },
    { label: "Legal Form",            value: data.legalForm },
    { label: "Social Media Account",  value: data.socialMediaAccount },
    { label: "Social Media Type",     value: data.socialMediaType },
    { label: "Web Site URL",          value: data.webSiteUrl },
    { label: "Social Enterprise (MAAN)", value: data.socialEnterpriseMaan },
  ];

  // Parse activities into a clean array of strings
  let activities: string[] = [];
  if (Array.isArray(data.licenseActivities)) {
    activities = data.licenseActivities;
  } else if (typeof data.licenseActivities === "string") {
    try {
      const parsed = JSON.parse(data.licenseActivities);
      if (Array.isArray(parsed)) {
        activities = parsed;
      } else {
        activities = [data.licenseActivities];
      }
    } catch {
      const strVal: string = data.licenseActivities;
      activities = strVal.split("\n").map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return (
    <>
      {/* ─── License Details Box ─── */}
      <div className="section-box">
        <div className="section-title">License Details</div>
        <table className="details-table">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                {row.rtl ? (
                  <td dir="rtl" style={{ textAlign: "right", fontFamily: "sans-serif, Arial" }}>
                    {row.value}
                  </td>
                ) : (
                  <td>{row.value}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── License Activities Box (Each activity on its own line) ─── */}
      {activities && activities.length > 0 && (
        <div className="section-box">
          <div className="section-title">License Activities</div>
          <div className="activities-box" style={{ padding: "16px 20px" }}>
            {activities.map((activity, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: "8px 0", 
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#333",
                  display: "block",
                  width: "100%"
                }}
              >
                {activity}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
