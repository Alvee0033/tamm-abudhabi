"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Save, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Server, 
  Globe, 
  Sparkles,
  Check
} from "lucide-react";
import { getApiBaseUrl } from "@/app/lib/api";

export default function AdminSettingsPage() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  
  // Profile Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // System Origin
  const [siteOrigin, setSiteOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setProfileLoading(true);
    // Instant hydration from localStorage
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("tamm_admin_profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.name) setName(parsed.name);
          if (parsed.username) setUsername(parsed.username);
          if (parsed.email) setEmail(parsed.email);
        }
      } catch (e) {}
    }

    try {
      const token = Cookies.get("admin_token");
      const apiBase = getApiBaseUrl();
      const res = await axios.get(`${apiBase}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setName(res.data.name || "Administrator");
        setUsername(res.data.username || "admin");
        setEmail(res.data.email || "admin@tamm.abudhabi");
        if (typeof window !== "undefined") {
          localStorage.setItem("tamm_admin_profile", JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.error("Failed to load profile from server", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSubmitting(true);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "tamm_admin_profile",
          JSON.stringify({ name, username, email })
        );
      } catch (e) {}
    }

    try {
      const token = Cookies.get("admin_token");
      const apiBase = getApiBaseUrl();
      const res = await axios.put(
        `${apiBase}/auth/profile`,
        { name, username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.access_token) {
        Cookies.set("admin_token", res.data.access_token, { expires: 1 });
      }

      setProfileMessage({ type: "success", text: "Profile and email updated successfully!" });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 3) {
      setPasswordMessage({ type: "error", text: "New password must be at least 3 characters long." });
      return;
    }

    setPasswordSubmitting(true);
    try {
      const token = Cookies.get("admin_token");
      const apiBase = getApiBaseUrl();
      await axios.put(
        `${apiBase}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("tamm_custom_password", newPassword);
        } catch (e) {}
      }

      setPasswordMessage({ type: "success", text: "Password changed successfully! Keep it safe." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(null), 4000);
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err.response?.data?.message || "Incorrect current password. Please try again.",
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 max-w-4xl pb-8">
      {/* Top Header */}
      <div className="bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Admin Settings & Credentials
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-500">
          Manage your email and update password
        </p>
      </div>

      {profileLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
          <p className="text-xs font-medium">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* ─── Card 1: Profile & Email Settings ─── */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Profile & Email</h3>
                <p className="text-[10px] text-slate-400">Change username and notification email</p>
              </div>
            </div>

            {profileMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  profileMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {profileMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Administrator"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tamm.abudhabi"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
                >
                  {profileSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Profile & Email</span>
                </button>
              </div>
            </form>
          </div>

          {/* ─── Card 2: Password & Security Settings ─── */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Change Password</h3>
                <p className="text-[11px] text-slate-400">Update your account login password</p>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md shadow-slate-900/20 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
                >
                  {passwordSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
