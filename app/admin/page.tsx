"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { LicenceData } from "@/app/types";
import { getApiBaseUrl } from "@/app/lib/api";
import { 
  Plus, 
  Search, 
  QrCode, 
  Edit3, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Building2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle2,
  Globe,
  Layers,
  FileText,
  Share2,
  Sparkles
} from "lucide-react";

// Official Demo Fallback Data
const DEMO_FALLBACK: LicenceData = {
  tradeLicenseNumber: "CN-5284014",
  adcciNumber: "8800079945",
  tradeName: "HIGH LIFT LAND TRANSPORT L.L.C",
  licenseType: "Business",
  branch: "Yes",
  issuancePlace: "Abu Dhabi",
  establishmentDate: "24/07/2024",
  registrationDate: "05/06/2026",
  expiryDate: "23/07/2027",
  licenseStatus: "Issued",
  address: "مصفح, مصفح 45, 0 : ~, مبنى, عبدالله بن زايد بن سلطان",
  establishmentVolume: "No SMEs Classification",
  legalForm: "Branch",
  socialMediaAccount: "",
  socialMediaType: "",
  webSiteUrl: "",
  socialEnterpriseMaan: "No",
  licenseActivities: [
    "Cargo Packaging Services (5224005)",
    "Goods Land Transportation (4923001)"
  ],
};

// Date Format Helpers (HTML Date <input> uses YYYY-MM-DD, TAMM uses DD/MM/YYYY)
function toDisplayDate(val?: string): string {
  if (!val) return "";
  if (val.includes("-")) {
    const parts = val.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return val;
}

function toPickerDate(val?: string): string {
  if (!val) return "";
  if (val.includes("/")) {
    const parts = val.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return val;
}

export default function AdminDashboard() {
  const [licenses, setLicenses] = useState<LicenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [siteOrigin, setSiteOrigin] = useState("");
  
  // Modals state
  const [selectedLicenseForQR, setSelectedLicenseForQR] = useState<LicenceData | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<LicenceData | null>(null);
  const [deleteConfirmLicense, setDeleteConfirmLicense] = useState<LicenceData | null>(null);
  
  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State (Blank by default when creating)
  const emptyFormData: Partial<LicenceData> = {
    tradeLicenseNumber: "",
    adcciNumber: "",
    tradeName: "",
    licenseType: "",
    branch: "",
    issuancePlace: "",
    establishmentDate: "",
    registrationDate: "",
    expiryDate: "",
    licenseStatus: "",
    address: "",
    establishmentVolume: "",
    legalForm: "",
    socialMediaAccount: "",
    socialMediaType: "",
    webSiteUrl: "",
    socialEnterpriseMaan: "",
    licenseActivities: [],
  };

  const [formData, setFormData] = useState<Partial<LicenceData>>(emptyFormData);
  const [activitiesInput, setActivitiesInput] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
      // Immediately hydrate from local storage to prevent blank flicker or lost data on refresh
      try {
        const cached = localStorage.getItem("tamm_saved_licenses");
        if (cached) {
          const parsedCached = JSON.parse(cached);
          if (Array.isArray(parsedCached) && parsedCached.length > 0) {
            setLicenses(parsedCached);
            setLoading(false);
          }
        }
      } catch (e) {}
    }
    fetchLicenses();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveToLocalAndState = (newLicenses: LicenceData[]) => {
    setLicenses(newLicenses);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tamm_saved_licenses", JSON.stringify(newLicenses));
      } catch (e) {}
    }
  };

  const fetchLicenses = async () => {
    try {
      const token = Cookies.get("admin_token");
      const apiBase = getApiBaseUrl();
      const res = await axios.get(`${apiBase}/licenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const serverLicenses: LicenceData[] = (res.data || []).map((item: any) => ({
        ...item,
        licenseActivities: Array.isArray(item.licenseActivities)
          ? item.licenseActivities
          : typeof item.licenseActivities === "string"
          ? JSON.parse(item.licenseActivities || "[]")
          : []
      }));

      saveToLocalAndState(serverLicenses);
    } catch (err) {
      console.error("Failed to fetch licenses", err);
    } finally {
      setLoading(false);
    }
  };

  // Open Create: Nothing prefilled, blank inputs
  const openCreateModal = () => {
    setEditingLicense(null);
    setFormData({ ...emptyFormData });
    setActivitiesInput("");
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Open Edit: Pre-populated with license data
  const openEditModal = (license: LicenceData) => {
    setEditingLicense(license);
    setFormData({
      ...license,
      establishmentDate: toPickerDate(license.establishmentDate),
      registrationDate: toPickerDate(license.registrationDate),
      expiryDate: toPickerDate(license.expiryDate),
    });
    setActivitiesInput((license.licenseActivities || []).join("\n"));
    setFormError("");
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const targetLicenseNum = formData.tradeLicenseNumber?.trim();
    if (!targetLicenseNum) {
      setFormError("Trade License Number is required.");
      return;
    }

    setFormSubmitting(true);
    const token = Cookies.get("admin_token");
    const apiBase = getApiBaseUrl();
    
    // Parse activities
    const rawActivities = activitiesInput
      .split("\n")
      .map(a => a.trim())
      .filter(a => a.length > 0);

    // Convert date picker dates (YYYY-MM-DD) to DD/MM/YYYY
    const estDate = formData.establishmentDate 
      ? toDisplayDate(formData.establishmentDate) 
      : "";

    const regDate = formData.registrationDate 
      ? toDisplayDate(formData.registrationDate) 
      : "";

    const expDate = formData.expiryDate 
      ? toDisplayDate(formData.expiryDate) 
      : "";

    const payload: LicenceData = {
      tradeLicenseNumber: targetLicenseNum,
      adcciNumber: formData.adcciNumber?.trim() || "",
      tradeName: formData.tradeName?.trim() || targetLicenseNum,
      licenseType: formData.licenseType?.trim() || "Business",
      branch: formData.branch?.trim() || "No",
      issuancePlace: formData.issuancePlace?.trim() || "Abu Dhabi",
      establishmentDate: estDate,
      registrationDate: regDate,
      expiryDate: expDate,
      licenseStatus: formData.licenseStatus?.trim() || "Issued",
      address: formData.address?.trim() || "",
      establishmentVolume: formData.establishmentVolume?.trim() || "No SMEs Classification",
      legalForm: formData.legalForm?.trim() || "Branch",
      socialMediaAccount: formData.socialMediaAccount?.trim() || "",
      socialMediaType: formData.socialMediaType?.trim() || "",
      webSiteUrl: formData.webSiteUrl?.trim() || "",
      socialEnterpriseMaan: formData.socialEnterpriseMaan?.trim() || "No",
      licenseActivities: rawActivities,
    };

    try {
      if (editingLicense) {
        await axios.put(
          `${apiBase}/licenses/${encodeURIComponent(editingLicense.tradeLicenseNumber)}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast(`License ${editingLicense.tradeLicenseNumber} updated successfully!`);
      } else {
        await axios.post(
          `${apiBase}/licenses`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast(`License ${payload.tradeLicenseNumber} created successfully!`);
      }
      setIsFormModalOpen(false);
      await fetchLicenses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save license on server. Please check inputs.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmLicense) return;
    const targetRef = deleteConfirmLicense.tradeLicenseNumber;
    
    // Immediate optimistic local update
    const filtered = licenses.filter(l => l.tradeLicenseNumber.toLowerCase() !== targetRef.toLowerCase());
    saveToLocalAndState(filtered);
    showToast(`License ${targetRef} deleted.`);
    setDeleteConfirmLicense(null);

    try {
      const token = Cookies.get("admin_token");
      const apiBase = getApiBaseUrl();
      await axios.delete(
        `${apiBase}/licenses/${encodeURIComponent(targetRef)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchLicenses();
    } catch (err) {
      console.error("Delete failed on server", err);
      await fetchLicenses();
    }
  };

  const getVerificationUrl = (ref: string) => {
    const base = siteOrigin || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");
    return `${base}/verify?ref=${ref}`;
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector("#qr-canvas-wrapper canvas") as HTMLCanvasElement;
    if (canvas && selectedLicenseForQR) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR_${selectedLicenseForQR.tradeLicenseNumber}.png`;
      a.click();
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredLicenses = licenses.filter(l => 
    l.tradeLicenseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.adcciNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2.5 sm:space-y-3.5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden button for mobile dock trigger */}
      <button 
        id="mobile-quick-add-btn" 
        onClick={openCreateModal} 
        className="hidden" 
        aria-hidden="true"
      />

      {/* ─── Compact Responsive Top Header ─── */}
      <div className="bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
            <span className="sm:hidden">Licenses</span>
            <span className="hidden sm:inline">Economic Licenses Directory</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
            {licenses.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={fetchLicenses}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Refresh"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-1.5 px-3 rounded-xl shadow-xs active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">Create License</span>
          </button>
        </div>
      </div>

      {/* ─── 2 Slim KPIs ─── */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Licenses</span>
            <p className="text-lg sm:text-xl font-bold text-slate-900 leading-none mt-1">{licenses.length}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 block">Active / Issued</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-600 leading-none mt-1">
              {licenses.filter(l => l.licenseStatus?.toLowerCase() === "issued").length}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* ─── Compact Search Bar ─── */}
      <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reference (CN-5284014) or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200/70 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-teal-500 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main License Content: Maximized Space */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
          <p className="text-xs font-medium">Fetching registered licenses...</p>
        </div>
      ) : filteredLicenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2.5">
          <Building2 className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-800">No licenses found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No records matching "${searchQuery}".` 
              : "There are no economic licenses recorded yet."}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First License</span>
          </button>
        </div>
      ) : (
        <>
          {/* ─── Compact Mobile Card View (< md) ─── */}
          <div className="grid grid-cols-1 gap-2 md:hidden">
            {filteredLicenses.map((l) => {
              const liveUrl = getVerificationUrl(l.tradeLicenseNumber);
              return (
                <div 
                  key={l.tradeLicenseNumber}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="inline-block px-1.5 py-0.5 font-mono text-[11px] font-bold rounded-md bg-teal-50 text-teal-800 border border-teal-200/60">
                        {l.tradeLicenseNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                        {l.tradeName}
                      </h3>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {l.licenseStatus || "Issued"}
                    </span>
                  </div>

                  {/* Compact Live URL Row */}
                  <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono text-teal-700 font-semibold truncate text-[11px]">
                      /verify?ref={l.tradeLicenseNumber}
                    </span>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-500 pt-0.5">
                    <div>
                      <span className="text-slate-400">Type: </span>
                      <span className="font-medium text-slate-700">{l.licenseType || "Business"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Expiry: </span>
                      <span className="font-medium text-slate-700">{l.expiryDate || "N/A"}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-1.5 flex items-center gap-1.5 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedLicenseForQR(l)}
                      className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold py-1.5 px-2 rounded-lg active:scale-95 transition cursor-pointer"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>QR Code</span>
                    </button>
                    <button
                      onClick={() => openEditModal(l)}
                      className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmLicense(l)}
                      className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Compact Desktop Data Table (>= md) ─── */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Reference No.</th>
                    <th className="px-4 py-2.5">Trade Name</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Live Verify URL</th>
                    <th className="px-4 py-2.5">Type / Branch</th>
                    <th className="px-4 py-2.5">Expiry Date</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLicenses.map((l) => {
                    const liveUrl = getVerificationUrl(l.tradeLicenseNumber);
                    return (
                      <tr key={l.tradeLicenseNumber} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/50 font-mono font-bold text-[11px]">
                            {l.tradeLicenseNumber}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900 max-w-xs truncate">
                          {l.tradeName}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {l.licenseStatus || "Issued"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-teal-50 text-teal-700 border border-slate-200 hover:border-teal-300 rounded-lg font-mono text-[11px] font-semibold transition group"
                          >
                            <span className="truncate max-w-[160px]">/verify?ref={l.tradeLicenseNumber}</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                          <div>{l.licenseType || "Business"}</div>
                          <div className="text-[10px] text-slate-400">Branch: {l.branch || "No"}</div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                          {l.expiryDate || "N/A"}
                        </td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLicenseForQR(l)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>QR</span>
                            </button>
                            <button
                              onClick={() => openEditModal(l)}
                              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmLicense(l)}
                              className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── QR Code & Live URL Modal ─── */}
      {selectedLicenseForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Verification QR & Live URL</h3>
                <p className="text-xs text-teal-600 font-mono font-bold">{selectedLicenseForQR.tradeLicenseNumber}</p>
              </div>
              <button
                onClick={() => setSelectedLicenseForQR(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rendered QR Canvas */}
            <div 
              id="qr-canvas-wrapper" 
              className="flex items-center justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
            >
              <QRCodeCanvas 
                value={getVerificationUrl(selectedLicenseForQR.tradeLicenseNumber)}
                size={220}
                includeMargin={true}
                level="M"
              />
            </div>

            {/* Live Verification Target URL Box */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Site Verification Link
                </p>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Live Database Verified
                </span>
              </div>
              <p className="text-xs text-slate-800 break-all font-mono bg-white p-2 rounded-xl border border-slate-200 select-all">
                {getVerificationUrl(selectedLicenseForQR.tradeLicenseNumber)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR</span>
                </button>
                <button
                  onClick={() => handleCopyLink(getVerificationUrl(selectedLicenseForQR.tradeLicenseNumber))}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>

              <a
                href={getVerificationUrl(selectedLicenseForQR.tradeLicenseNumber)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition border border-teal-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Live Verification on Our Site</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create & Edit Modal with Date Pickers & Demo Fallbacks ─── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs overflow-y-auto p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white px-5 sm:px-8 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {editingLicense ? "Edit License Information" : "Create New License"}
                  </h3>
                  {!editingLicense && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-semibold border border-teal-200">
                      <Sparkles className="w-3 h-3" />
                      Auto-fallback enabled
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editingLicense 
                    ? "Update existing record in database" 
                    : "Fill desired fields. Any field left empty will automatically use official demo data."}
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="license-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-left">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ─── Section 1: Identification & Core ─── */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. License Core Identification</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trade License Number
                    </label>
                    <input
                      type="text"
                      placeholder="Default: CN-5284014"
                      value={formData.tradeLicenseNumber || ""}
                      onChange={(e) => setFormData({ ...formData, tradeLicenseNumber: e.target.value })}
                      disabled={!!editingLicense}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ADCCI Number
                    </label>
                    <input
                      type="text"
                      placeholder="Default: 8800079945"
                      value={formData.adcciNumber || ""}
                      onChange={(e) => setFormData({ ...formData, adcciNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trade Name
                  </label>
                  <input
                    type="text"
                    placeholder="Default: HIGH LIFT LAND TRANSPORT L.L.C"
                    value={formData.tradeName || ""}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      License Type
                    </label>
                    <select
                      value={formData.licenseType || ""}
                      onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">Select (Default: Business)</option>
                      <option value="Business">Business</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Professional">Professional</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Tourism">Tourism</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Occupational">Occupational</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Branch
                    </label>
                    <select
                      value={formData.branch || ""}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">Select (Default: Yes)</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Issuance Place
                    </label>
                    <select
                      value={formData.issuancePlace || ""}
                      onChange={(e) => setFormData({ ...formData, issuancePlace: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">Select (Default: Abu Dhabi)</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Al Ain">Al Ain</option>
                      <option value="Al Dhafra">Al Dhafra</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ─── Section 2: Dates & Status (Date Picker Inputs) ─── */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Dates Selection & Status</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      License Status
                    </label>
                    <select
                      value={formData.licenseStatus || ""}
                      onChange={(e) => setFormData({ ...formData, licenseStatus: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-emerald-700"
                    >
                      <option value="">Select (Default: Issued)</option>
                      <option value="Issued">Issued</option>
                      <option value="Expired">Expired</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Under Renewal">Under Renewal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Establishment Date
                    </label>
                    <input
                      type="date"
                      value={formData.establishmentDate || ""}
                      onChange={(e) => setFormData({ ...formData, establishmentDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Default: 24/07/2024</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registration Date
                    </label>
                    <input
                      type="date"
                      value={formData.registrationDate || ""}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Default: 05/06/2026</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate || ""}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-teal-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Default: 23/07/2027</span>
                  </div>
                </div>
              </div>

              {/* ─── Section 3: Legal & Establishment Details ─── */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">3. Legal Form & Classification</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Establishment Volume
                    </label>
                    <select
                      value={formData.establishmentVolume || ""}
                      onChange={(e) => setFormData({ ...formData, establishmentVolume: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">Select (Default: No SMEs Classification)</option>
                      <option value="No SMEs Classification">No SMEs Classification</option>
                      <option value="Micro">Micro</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Legal Form
                    </label>
                    <select
                      value={formData.legalForm || ""}
                      onChange={(e) => setFormData({ ...formData, legalForm: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">Select (Default: Branch)</option>
                      <option value="Branch">Branch</option>
                      <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Civil Company">Civil Company</option>
                      <option value="General Partnership">General Partnership</option>
                      <option value="Public Joint Stock Company">Public Joint Stock Company</option>
                      <option value="Private Joint Stock Company">Private Joint Stock Company</option>
                      <option value="Foreign Branch">Foreign Branch</option>
                      <option value="Freezone Branch">Freezone Branch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Social Enterprise (MAAN)
                    </label>
                    <select
                      value={formData.socialEnterpriseMaan || ""}
                      onChange={(e) => setFormData({ ...formData, socialEnterpriseMaan: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">Select (Default: No)</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Address</span>
                    <span className="text-[10px] text-slate-400">Arabic & English supported</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Default: مصفح, مصفح 45, 0 : ~, مبنى, عبدالله بن زايد بن سلطان"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* ─── Section 4: Online & Social Media ─── */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Share2 className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">4. Online & Social Media</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Social Media Type
                    </label>
                    <select
                      value={formData.socialMediaType || ""}
                      onChange={(e) => setFormData({ ...formData, socialMediaType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">None</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Twitter / X">Twitter / X</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Facebook">Facebook</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Social Media Account
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. @highlift_uae"
                      value={formData.socialMediaAccount || ""}
                      onChange={(e) => setFormData({ ...formData, socialMediaAccount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Web Site URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://highlift.ae"
                      value={formData.webSiteUrl || ""}
                      onChange={(e) => setFormData({ ...formData, webSiteUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Section 5: Licensed Activities ─── */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">5. Licensed Activities (One per line)</h4>
                </div>
                <textarea
                  rows={3}
                  placeholder="Default: Cargo Packaging Services (5224005)&#10;Goods Land Transportation (4923001)"
                  value={activitiesInput}
                  onChange={(e) => setActivitiesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </form>

            {/* Sticky Modal Footer */}
            <div className="sticky bottom-0 bg-white px-5 sm:px-8 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 z-10">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="license-form"
                disabled={formSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 active:scale-95 transition disabled:opacity-60 cursor-pointer"
              >
                {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingLicense ? "Update License" : "Save & Create License"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirmLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Delete License?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">{deleteConfirmLicense.tradeLicenseNumber}</strong> ({deleteConfirmLicense.tradeName})? This record will be permanently deleted from the database.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmLicense(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
