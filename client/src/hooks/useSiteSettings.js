import { useEffect, useState } from "react";
import { api } from "../api/axios";

// Every home-page section reads its own slice from one shared bundle, so
// mounting 10+ components on the same page still fires a single request —
// later callers just reuse the same in-flight/resolved promise.
let cachedSettings = null;
let inflightPromise = null;

const fetchSettings = () => {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (inflightPromise) return inflightPromise;

  inflightPromise = api
    .get("/api/site/settings")
    .then(({ data }) => {
      cachedSettings = data?.data || null;
      return cachedSettings;
    })
    .catch(() => null)
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchSettings().then((result) => {
      if (!cancelled) {
        setSettings(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
};

export default useSiteSettings;
