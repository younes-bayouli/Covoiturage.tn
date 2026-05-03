/**
 * Fetch wrapper with health check, retries, and fallback support
 * @param {string} url - The endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {object} config - Configuration (retries, healthCheck, fakeData, etc.)
 * @returns {Promise} - Resolves with response data or fakeData if backend is down
 */
export async function Fetch(url, options = {}, config = {}) {
	const {
		retries = 0,
		retryDelay = 1000,
		healthCheck = true,
		fakeData = null,
		timeout = 10000,
	} = config;

	// Health check before fetching
	const checkHealth = async () => {
		if (!healthCheck) return true;
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			const res = await fetch("http://localhost:8080/api/health", {
				method: "GET",
				signal: controller.signal,
			});

			clearTimeout(timeoutId);
			const isUp = res.ok || res.status === 200;

			if (!isUp) {
				console.warn(
					`[Fetch] Backend health check failed — status: ${res.status}. Using fallback data.`,
				);
			}

			return isUp;
		} catch (err) {
			console.warn(
				`[Fetch] Backend unreachable — ${err.message}. Using fallback data.`,
			);
			return false;
		}
	};

	// Get authorization token from localStorage
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

	// Main fetch with retries
	const performFetch = async (attempt = 0) => {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			const response = await fetch(url, {
				...options,
				headers: getAuthHeaders(),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${response.statusText}`,
				);
			}

			const contentType = response.headers.get("content-type") || "";
			const data = contentType.includes("application/json")
				? await response.json()
				: await response.text();

			return { success: true, data, backendUp: true };
		} catch (err) {
			if (err.name === "AbortError") {
				throw new Error("Request timeout");
			}

			// Retry logic
			if (attempt < retries) {
				const delay = retryDelay * Math.pow(2, attempt);
				console.warn(
					`[Fetch] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
				return performFetch(attempt + 1);
			}

			// All retries exhausted
			console.error(`[Fetch] All retries exhausted for ${url}:`, err);
			return { success: false, error: err, backendUp: false };
		}
	};

	// Check health first
	const isUp = await checkHealth();

	if (!isUp) {
		// Backend is down — return fake data
		if (fakeData) {
			return { success: true, data: fakeData, backendUp: false };
		}
		throw new Error(
			"Backend is unreachable and no fallback data provided.",
		);
	}

	// Perform the actual fetch
	return performFetch();
}
