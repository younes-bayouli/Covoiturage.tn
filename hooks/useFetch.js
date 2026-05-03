import { useState, useEffect, useCallback, useRef } from "react";
const memoryCache = new Map();

export default function useFetch(url, options = {}, config = {}) {
	const {
		immediate = true,
		cache = false,
		retries = 0,
		retryDelay = 1000,
		healthCheck = true, // enable health check
		fakeData = null, // fake data to return if backend is down
	} = config;

	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [backendUp, setBackendUp] = useState(true);

	const abortRef = useRef(null);
	const optionsRef = useRef(options);
	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	// Check if backend is reachable
	const checkHealth = useCallback(async () => {
		if (!healthCheck) return true;
		try {
			const res = await fetch("http://localhost:8080/api/health", {
				method: "GET",
			}); // ← ping the main URL
			const isUp = res.status !== 0;
			setBackendUp(isUp);

			if (!isUp) {
				console.warn(
					`[useFetch] Backend unreachable — status: ${res.status}. Falling back to fake data.`,
				);
			}

			return isUp;
		} catch (err) {
			setBackendUp(false);
			console.warn(
				`[useFetch] Backend unreachable — ${err.message}. Falling back to fake data.`,
			);
			return false;
		}
	}, [healthCheck, url]); 

	const getAuthHeaders = () => {
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("token")
				: null;
		const headers = { ...options.headers };

		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		return headers;
	};

	const fetchData = useCallback(
		async (attempt = 0, bustCache = false) => {
			if (!url) return;

			// Health check before fetching
			const isUp = await checkHealth();
			if (!isUp) {
				// Backend is down — return fake data or empty
				setData(fakeData ?? null);
				setError(new Error("Backend is unreachable."));
				setLoading(false);
				return;
			}
       		if (bustCache) memoryCache.delete(url);

			if (cache && memoryCache.has(url)) {
				setData(memoryCache.get(url));
				setError(null);
				return;
			}

			if (abortRef.current) abortRef.current.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			setLoading(true);
			setError(null);

			try {
				const response = await fetch(url, {
					...optionsRef.current,
					signal: controller.signal,
					headers: getAuthHeaders(),
				});

				if (!response.ok) {
					throw new Error(
						`HTTP ${response.status}: ${response.statusText}`,
					);
				}

				const contentType = response.headers.get("content-type") || "";
				const result = contentType.includes("application/json")
					? await response.json()
					: await response.text();

				if (cache) memoryCache.set(url, result);

				setData(result);
				setError(null);
			} catch (err) {
				if (err.name === "AbortError") return;

				if (attempt < retries) {
					setTimeout(
						() => fetchData(attempt + 1),
						retryDelay * 2 ** attempt,
					);
					return;
				}

				setError(err);
				setData(fakeData ?? null); // fallback to fake data on error too
			} finally {
				setLoading(false);
			}
		},
		[url, cache, retries, retryDelay, checkHealth, fakeData],
	);

	const abort = useCallback(() => {
		if (abortRef.current) abortRef.current.abort();
	}, []);
	
	const refetch = useCallback(() => fetchData(0, true), [fetchData]);

	useEffect(() => {
		if (immediate) fetchData();
		return () => abort();
	}, [immediate, fetchData, abort]);

	return {
		data,
		loading,
		error,
		backendUp, // expose so UI can show a banner etc.
		refetch,
		abort,
	};
}
