import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to track if a component is currently mounted
 *
 * This hook helps prevent memory leaks and React warnings by providing
 * a way to check if a component is still mounted before updating state
 * after async operations.
 *
 * @returns An object with:
 *   - isMounted: A function that returns true if the component is mounted
 *   - cleanup: A cleanup function to be called in useEffect return
 *
 * @example
 * ```tsx
 * const { isMounted, cleanup } = useMounted();
 *
 * useEffect(() => {
 *   const fetchData = async () => {
 *     const data = await api.getData();
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   };
 *
 *   fetchData();
 *   return cleanup;
 * }, []);
 * ```
 */
export function useMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isMounted = useCallback(() => isMountedRef.current, []);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  return { isMounted,
    cleanup };
}
