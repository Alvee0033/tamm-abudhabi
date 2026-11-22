"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingOverlay from "./components/LoadingOverlay";
import Link from "next/link";

export default function HomePage() {
  const [refNum, setRefNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = refNum.trim();
    if (!trimmed) {
      setError("Please enter a reference number.");
      inputRef.current?.focus();
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/verify?ref=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <LoadingOverlay visible={loading} />

      <Header title="Verify Economic Licence" backHref="/" />

      <div className="container">
        <h1>Economic Licence Enquiry - TAHAQAQ</h1>
        <p>
          Ensure that the facility you are dealing with is licenced by ADDED and
          whether it is a micro, small or medium enterprise by using TAHAQAQ
          tool.
        </p>

        <h3>Enter Reference Number</h3>
        <p style={{ fontSize: "14px", color: "#555" }}>
          Please enter the respective reference number (i.e. License Number,
          Permit Number, E-Commerce Number, Memorandum of Association Number).
        </p>

        <form onSubmit={handleSubmit} id="verifyForm">
          <div className="form-group">
            <label>
              Reference Number<span>*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              name="referenceNumber"
              required
              value={refNum}
              onChange={(e) => setRefNum(e.target.value)}
            />
          </div>
          
          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn-view" disabled={loading}>
            View
          </button>
          
          <Link href="/services" className="btn-exit" onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}>
            Exit Service
          </Link>
        </form>

        <Footer />
      </div>
    </>
  );
}
