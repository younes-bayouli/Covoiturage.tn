import { useEffect, useState, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "../context/authContext";

export const useWebSocket = () => {
	const token = typeof window !== "undefined"
					? localStorage.getItem("token")
					: null;
	const [isConnected, setIsConnected] = useState(false);
	const stompClientRef = useRef<Client | null>(null);
	const subscriptionsRef = useRef<Map<string, any>>(new Map());

	useEffect(() => {
		const client = new Client({
			brokerURL: "ws://localhost:8080/ws/chat",
			debug: (msg) => console.log("[STOMP]", msg),
			reconnectDelay: 5000,
			heartbeatIncoming: 4000,
			heartbeatOutgoing: 4000,
			connectHeaders: {
				// Send JWT token in headers if available
				Authorization: token ? `Bearer ${token}` : "",
			},
			onConnect: () => {
				console.log("✅ Connected to WebSocket");
				setIsConnected(true);
				stompClientRef.current = client;
			},
			onDisconnect: () => {
				console.log("❌ Disconnected from WebSocket");
				setIsConnected(false);
			},
			onStompError: (frame) => {
				console.error("❌ STOMP error:", frame);
				setIsConnected(false);
			},
			onWebSocketError: (error) => {
				console.error("❌ WebSocket error:", error);
				setIsConnected(false);
			},
		});

		client.activate();

		return () => {
			if (client.connected) {
				client.deactivate();
			}
		};
	}, [token]);

	const subscribe = useCallback(
		(destination: string, callback: (message: any) => void) => {
			if (!stompClientRef.current?.connected) {
				console.warn("⚠️ STOMP client not connected, cannot subscribe");
				return null;
			}

			console.log("📍 Subscribing to:", destination);
			const subscription = stompClientRef.current.subscribe(
				destination,
				(message) => {
					try {
						const data = JSON.parse(message.body);
						console.log("📨 Received:", data);
						callback(data);
					} catch (error) {
						console.error("Error parsing message:", error);
					}
				},
			);

			subscriptionsRef.current.set(destination, subscription);
			return subscription;
		},
		[],
	);

	const sendMessage = useCallback((destination: string, message: any) => {
		if (!stompClientRef.current?.connected) {
			console.error("❌ STOMP client not connected");
			return;
		}

		console.log("📤 Sending to:", destination, message);
		stompClientRef.current.publish({
			destination,
			body: JSON.stringify(message),
		});
	}, []);

	const unsubscribe = useCallback((destination: string) => {
		const subscription = subscriptionsRef.current.get(destination);
		if (subscription) {
			subscription.unsubscribe();
			subscriptionsRef.current.delete(destination);
			console.log("✋ Unsubscribed from:", destination);
		}
	}, []);

	return {
		isConnected,
		subscribe,
		sendMessage,
		unsubscribe,
	};
};
