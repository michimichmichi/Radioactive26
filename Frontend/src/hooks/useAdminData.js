import { useCallback, useEffect, useState } from "react";
import API from "../api";

export default function useAdminData(url, { delay = 0, initialData = [] } = {}) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const loading = result?.url !== url || result?.revision !== revision;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await API.get(url, { signal: controller.signal });
        if (active) setResult({ url, revision, data: response.data, error: "" });
      } catch (error) {
        if (active) setResult({
          url, revision, data: null,
          error: error.userMessage || "Unable to load data. Please try again.",
        });
      }
    }, delay);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [url, revision, delay]);

  return {
    data: loading || result.error ? initialData : result.data,
    error: loading ? "" : result.error,
    loading,
    refresh,
  };
}
