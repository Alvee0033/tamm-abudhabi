"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LicenceTable from "@/app/components/LicenceTable";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { LicenceData } from "@/app/types";
import { getApiBaseUrl } from "@/app/lib/api";

export default function VerifyPage() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";

  const [data, setData] = useState<LicenceData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLicense = async () => {
      const cleanRef = ref.trim().toUpperCase();
      if (!cleanRef) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const apiBase = getApiBaseUrl();
        const response = await axios.get(`${apiBase}/licenses/${encodeURIComponent(cleanRef)}`);
        if (response.data && response.data.tradeLicenseNumber) {
          setData(response.data);
          setNotFound(false);
        } else {
          setData(null);
          setNotFound(true);
        }
      } catch (err: any) {
        setData(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLicense();
  }, [ref]);

  return (
    <>
      <LoadingOverlay visible={loading} />

      <Header title="Verify Economic Licence" backHref="/" />

      {!loading && (
        <div className="container">
          <h1 className="verify-h1">Economic Licence Enquiry - TAHAQAQ</h1>
          <p className="verify-p">
            Ensure that the facility you are dealing with is licenced by ADDED
            and whether it is a micro, small or medium enterprise by using
            TAHAQAQ tool.
          </p>
          <p className="verify-p">
            You have used the reference <strong>{ref}</strong> for the search.
          </p>

          {notFound && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#666",
                marginBottom: "25px",
              }}
            >
              No licence found for reference <strong>{ref}</strong>.
            </div>
          )}

          {data && <LicenceTable data={data} />}

          <Link href="/" className="btn-back">
            {"< Back"}
          </Link>

          <Footer />
        </div>
      )}
    </>
  );
}
