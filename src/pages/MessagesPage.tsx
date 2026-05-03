"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Search } from "lucide-react";
import { useAuth } from "../context/authContext";
// @ts-ignore
import useFetch from "@/hooks/useFetch";
import { useWebSocket } from "../hooks/useWebSocket";

const AVATAR_COLORS = [
	{ bg: "#E6F1FB", text: "#185FA5" },
	{ bg: "#EAF3DE", text: "#3B6D11" },
	{ bg: "#FAEEDA", text: "#633806" },
	{ bg: "#EEEDFE", text: "#3C3489" },
	{ bg: "#FAECE7", text: "#712B13" },
];

const getAvatarColor = (participants: any[], utilisateur: any) => {
	const reciever = participants.filter((e: any) => e.userId !== utilisateur?.id); // Handle "Last, First" format
	const name = reciever[0]?.nom || "Unknown";
	return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
};

const getInitials = (participants: any[],utilisateur:any) =>{
	const reciever = participants.filter((e: any) => e.userId !== utilisateur?.id); // Handle "Last, First" format
	const name = reciever[0]?.nom || "Unknown";
	return name.split(" ")
		.map((n:any) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}
const fmtTime = (dateStr: string) =>
	new Date(dateStr).toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});

const fmtDate = (dateStr: string) => {
	const date = new Date(dateStr);
	const today = new Date();
	const diff = today.getDate() - date.getDate();
	if (diff === 0) return fmtTime(dateStr);
	if (diff === 1) return "Hier";
	return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

export function MessagesPage() {
	const { utilisateur } = useAuth();
	const { subscribe, sendMessage, isConnected } = useWebSocket();

	const { data: conversations, refetch } = useFetch(
		`http://localhost:8080/conversations?userId=${utilisateur?.id}`,
		{},
		{
			cache: false,
			retries: 0,
		},
	);

	const [search, setSearch] = useState("");
	const [activeId, setActiveId] = useState<number | null>(null);
	const [localConvos, setLocalConvos] = useState<any[]>([]);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const socketRef = useRef<any>(null);

	// Initialize conversations
	useEffect(() => {
		if (conversations) {
			setLocalConvos(conversations);
			if (!activeId && conversations.length > 0) {
				setActiveId(conversations[0]?.id ?? null);
			}
		}
	}, [conversations]);

	// Connect to WebSocket and subscribe to active conversation
	useEffect(() => {
		if (isConnected && activeId && utilisateur?.id) {
			socketRef.current = subscribe(
				`/topic/conversation/${activeId}`,
				(message: any) => {
					console.log("Message received:", message);
					setLocalConvos((prev) =>
						prev.map((c) =>
							c.id === activeId
								? {
										...c,
										messages: [
											...(c.messages || []),
											message,
										],
										lastMessage: message.content,
										lastMessageAt: message.sentAt,
									}
								: c,
						),
					);
				},
			);
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.unsubscribe();
			}
		};
	}, [isConnected, activeId, utilisateur?.id, subscribe]);

	// Auto-scroll to latest message
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [activeId, localConvos]);

	const filtered = localConvos;

	const active = localConvos.find((c) => c.id === activeId) ?? null;
	useEffect(() => {
		if (active) {
			console.log("Active conversation:", active);
		}
	}, [active]);
	const handleSend = async () => {
		if (!input.trim() || !active || !isConnected) return;
		setSending(true);

		const newMsg = {
			conversationId: active.id,
			content: input.trim(),
			senderId: utilisateur?.id,
		};

		// Optimistic update
		const tempMessage = {
			id: Date.now(),
			senderId: utilisateur?.id,
			content: newMsg.content,
			sentAt: new Date().toISOString(),
		};

		setLocalConvos((prev) =>
			prev.map((c) =>
				c.id === active.id
					? {
							...c,
							messages: [...(c.messages || []), tempMessage],
							lastMessage: newMsg.content,
							lastMessageAt: new Date().toISOString(),
						}
					: c,
			),
		);
		setInput("");

		try {
			// Send via WebSocket
			sendMessage(`/app/chat/${active.id}`, newMsg);
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSelect = (id: number) => {
		setActiveId(id);
		setLocalConvos((prev) =>
			prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
		);
	};

	return (
		<main className="min-h-[calc(100vh-73px)] bg-background">
			<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
				<div
					className="overflow-hidden rounded-xl border border-border bg-card"
					style={{
						height: "calc(100vh - 160px)",
						display: "grid",
						gridTemplateColumns: "280px 1fr",
					}}
				>
					{/* ── Left panel: conversation list ── */}
					<div className="flex flex-col border-r border-border">
						{/* Search */}
						<div className="border-b border-border p-4">
							<h1 className="mb-3 text-base font-medium text-foreground">
								Messages
							</h1>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
								<input
									type="text"
									placeholder="Rechercher..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border"
								/>
							</div>
						</div>

						{/* List */}
						<div className="flex-1 overflow-y-auto">
							{filtered.length === 0 && (
								<p className="p-4 text-center text-sm text-muted-foreground">
									Aucune conversation
								</p>
							)}
							{filtered.map((convo) => {
								const color = getAvatarColor(
									convo.participants || [],
									utilisateur,
								);
								const initials = getInitials(
									convo.participants || [],
									utilisateur,
								);
								const isActive = convo.id === activeId;
								const reciever = convo.participants.filter(
									(e: any) => e.userId !== utilisateur?.id,
								); // Handle "Last, First" format
								const name = reciever[0]?.nom || "Unknown";
								return (
									<div
										key={convo.id}
										onClick={() => handleSelect(convo.id)}
										className={`cursor-pointer border-b border-border px-4 py-3 transition-colors hover:bg-muted/50 ${isActive ? "bg-muted/50" : ""}`}
									>
										<div className="flex items-center gap-3">
											<div
												className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium"
												style={{
													background: color.bg,
													color: color.text,
												}}
											>
												{initials}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-baseline justify-between">
													<p className="truncate text-sm font-medium text-foreground">
														{
															name
														}
													</p>
													<span className="ml-2 shrink-0 text-xs text-muted-foreground">
														{fmtDate(
															convo.lastMessageAt,
														)}
													</span>
												</div>
												<div className="mt-0.5 flex items-center justify-between gap-2">
													<p className="truncate text-xs text-muted-foreground">
														{convo.lastMessage}
													</p>
													{convo.unread > 0 && (
														<span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
															{convo.unread}
														</span>
													)}
												</div>
												<p className="mt-0.5 text-xs text-muted-foreground">
													{convo.tripLabel}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* ── Right panel: chat view ── */}
					{active ? (
						<div className="flex flex-col">
							{/* Chat header */}
							<div className="flex items-center justify-between border-b border-border px-5 py-3">
								<div className="flex items-center gap-3">
									<div
										className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium"
										style={{
											background: getAvatarColor(
												active.participants || [],
												utilisateur,
											).bg,
											color: getAvatarColor(
												active.participants || [],
												utilisateur,
											).text,
										}}
									>
										{getInitials(
											active.participants || [],
											utilisateur,
										)}
									</div>
									<div>
										<p className="text-sm font-medium text-foreground">
											{active.participant?.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{active.tripLabel} ·{" "}
											{active.tripTime}
										</p>
									</div>
								</div>
								<div
									className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
									title={
										isConnected ? "Connecté" : "Déconnecté"
									}
								/>
							</div>

							{/* Messages */}
							<div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4">
								{(!active.messages ||
									active.messages.length === 0) && (
									<p className="text-center text-sm text-muted-foreground">
										Aucun message
									</p>
								)}
								{active.messages?.map((msg: any) => {
									const isMe =
										msg.senderId === utilisateur?.id;
									return (
										<div
											key={msg.id}
											className={`flex ${isMe ? "justify-end" : "justify-start"}`}
										>
											<div
												className="max-w-[65%] px-3.5 py-2.5"
												style={{
													background: isMe
														? "#378ADD"
														: "var(--color-background-secondary)",
													borderRadius: isMe
														? "12px 0 12px 12px"
														: "0 12px 12px 12px",
												}}
											>
												<p
													className="text-sm"
													style={{
														color: isMe
															? "white"
															: "var(--color-text-primary)",
													}}
												>
													{msg.content}
												</p>
												<p
													className="mt-1 text-right text-xs"
													style={{
														color: isMe
															? "rgba(255,255,255,0.7)"
															: "var(--color-text-secondary)",
													}}
												>
													{fmtTime(msg.sentAt)}
												</p>
											</div>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>

							{/* Input bar */}
							<div className="flex items-center gap-3 border-t border-border px-5 py-3">
								<input
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Écrire un message..."
									disabled={!isConnected}
									className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-border"
								/>
								<button
									onClick={handleSend}
									disabled={
										!input.trim() || sending || !isConnected
									}
									className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-opacity disabled:opacity-40"
								>
									<Send className="h-4 w-4" />
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-center text-sm text-muted-foreground">
							Sélectionnez une conversation
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
