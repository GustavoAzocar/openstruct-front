import { useEffect, useState } from 'react';
import { loadGithubActivity } from '../lib/github-client';
import type { GithubLoadResult } from '../lib/github-client';

export function useGithubActivity() {
  const [result, setResult] = useState<GithubLoadResult>();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [retryAt, setRetryAt] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    void loadGithubActivity()
      .then((value) => {
        if (active) setResult(value);
      })
      .catch(() => {
        if (active)
          setResult((last) =>
            last?.snapshot
              ? { ...last, source: 'cache', stale: true }
              : { snapshot: null, source: 'unavailable', stale: true },
          );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRetryAt(Date.now() + 5 * 60_000);
          setNow(Date.now());
        }
      });
    return () => {
      active = false;
    };
  }, [request]);
  const canRefresh = !loading && now >= retryAt;
  return {
    result,
    loading,
    now,
    retryAt,
    canRefresh,
    refresh: () => {
      if (!canRefresh) return;
      setLoading(true);
      setRequest((value) => value + 1);
    },
  };
}
