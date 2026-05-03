"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	LogOut,
	AlertCircle,
	CheckCircle2,
	Trash2,
	Lock,
	Unlock,
	WifiOff,
	Search,
	Filter,
	ChevronRight,
	AlertTriangle,
} from "lucide-react";
import useFetch from "@/hooks/useFetch";

interface ActivityLog {
	id: number;
	actor: string;
	role: "ADMIN" | "USER";
	type:
		| "LOGIN"
		| "LOGOUT"
		| "REGISTER"
		| "UPDATE_PROFILE"
		| "SUSPEND"
		| "BAN"
		| "DELETE"
		| "REACTIVATE"
		| "VERIFY_IDENTITY"
		| "VERIFY_PHONE"
		| "CREATE_TRIP"
		| "CANCEL_TRIP"
		| "COMPLETE_TRIP"
		| "OTHER";
	severity: "NORMAL" | "HIGH";
	message: string;
	timestamp: string;
}

const mockLogs: ActivityLog[] = [
	{
		id: 1,
		actor: "Admin1",
		role: "ADMIN",
		type: "SUSPEND",
		severity: "HIGH",
		message:
			"Admin Admin1 suspended account with credentials: 5, Smith, Jane, jane@example.com. For Violation of terms.",
		timestamp: "2025-06-15T14:30:00",
	},
	{
		id: 2,
		actor: "John Doe",
		role: "USER",
		type: "LOGIN",
		severity: "NORMAL",
		message: "User with credentials 1, john@example.com login successful.",
		timestamp: "2025-06-15T10:15:00",
	},
	{
		id: 3,
		actor: "Admin1",
		role: "ADMIN",
		type: "BAN",
		severity: "HIGH",
		message:
			"Admin Admin1 banned account with credentials: 4, User, Banned, banned@example.com. For Repeated violations.",
		timestamp: "2025-06-14T09:45:00",
	},
	{
		id: 4,
		actor: "Jane Smith",
		role: "USER",
		type: "CREATE_TRIP",
		severity: "NORMAL",
		message: "Trip #1 was created successfully.",
		timestamp: "2025-06-14T08:20:00",
	},
];

export function AdminsActivity() {
	const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("ALL");
	const [severityFilter, setSeverityFilter] = useState("ALL");
	const [typeFilter, setTypeFilter] = useState("ALL");
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(20);

	// Fetch data from backend
	const {
		data: response,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		`http://localhost:8080/admin/activity-logs?page=${page}&size=${size}`,
		{},
		{
			immediate: true,
			cache: false,
			healthCheck: true,
			fakeData: mockLogs,
		},
	);

	// Extract logs from response
	const logs: ActivityLog[] = Array.isArray(response?.content)
		? response.content
		: Array.isArray(response)
			? response
			: mockLogs;

	useEffect(() => {
		let filtered = logs ? logs : [];

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter((log) => {
				const actor = log?.actor || "";
				const message = log?.message || "";
				const searchLower = searchTerm.toLowerCase();

				return (
					actor.toLowerCase().includes(searchLower) ||
					message.toLowerCase().includes(searchLower)
				);
			});
		}

		// Filter by role
		filtered = filtered.filter((log) => log?.role === "ADMIN");

		// Filter by severity
		if (severityFilter !== "ALL") {
			filtered = filtered.filter(
				(log) => log?.severity === severityFilter,
			);
		}

		// Filter by type
		if (typeFilter !== "ALL") {
			filtered = filtered.filter((log) => log?.type === typeFilter);
		}

		setFilteredLogs(filtered);
	}, [searchTerm, roleFilter, severityFilter, typeFilter, logs]);

	const getActionIcon = (type: string) => {
		const iconConfig: Record<string, React.ReactNode> = {
			LOGIN: <LogOut className="h-4 w-4 text-blue-600" />,
			LOGOUT: <LogOut className="h-4 w-4 text-gray-600" />,
			SUSPEND: <AlertCircle className="h-4 w-4 text-yellow-600" />,
			BAN: <Trash2 className="h-4 w-4 text-red-600" />,
			DELETE: <Trash2 className="h-4 w-4 text-red-600" />,
			REACTIVATE: <Unlock className="h-4 w-4 text-green-600" />,
			VERIFY_IDENTITY: (
				<CheckCircle2 className="h-4 w-4 text-green-600" />
			),
			VERIFY_PHONE: <CheckCircle2 className="h-4 w-4 text-green-600" />,
			CREATE_TRIP: <CheckCircle2 className="h-4 w-4 text-blue-600" />,
			CANCEL_TRIP: <Trash2 className="h-4 w-4 text-red-600" />,
			COMPLETE_TRIP: <CheckCircle2 className="h-4 w-4 text-green-600" />,
			OTHER: <AlertCircle className="h-4 w-4 text-gray-600" />,
		};

		return iconConfig[type] || <AlertCircle className="h-4 w-4" />;
	};

	const getSeverityBadge = (severity: string, msg: string) => {
		if (severity === "HIGH" || msg.includes("failed")) {
			return (
				<span className="flex items-center gap-1 p-0 text-xs font-medium bg-red-100 text-red-700 rounded-full border border-red-200">
					<AlertCircle className="h-3 w-3" />
				</span>
			);
		}
		return (
			<span className="flex items-center gap-1 p-0 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
				<CheckCircle2 className="h-3 w-3" />
			</span>
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Backend Down Warning */}
				{!backendUp && (
					<div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
						<WifiOff className="h-5 w-5 shrink-0" />
						<p className="text-sm font-medium">
							Serveur inaccessible — les données affichées sont
							des exemples.
						</p>
					</div>
				)}

				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
					<div>
						<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<LogOut className="h-6 w-6 text-primary" />
							</div>
							Journaux d'activité
						</h1>
						<p className="mt-1 text-muted-foreground">
							Suivi des actions des utilisateurs et
							administrateurs
						</p>
					</div>
				</div>

				{/* Search and Filters */}
				<Card className="border-border mb-8">
					<CardContent className="p-6">
						<div className="flex flex-col gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Rechercher par acteur ou message..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>

							<div className="flex flex-wrap gap-3">
								<select
									value={severityFilter}
									onChange={(e) =>
										setSeverityFilter(e.target.value)
									}
									className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								>
									<option value="ALL">
										Toutes les sévérités
									</option>
									<option value="NORMAL">Normal</option>
									<option value="HIGH">Élevée</option>
								</select>

								<select
									value={typeFilter}
									onChange={(e) =>
										setTypeFilter(e.target.value)
									}
									className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								>
									<option value="ALL">Tous les types</option>
									<option value="LOGIN">Connexion</option>
									<option value="LOGOUT">Déconnexion</option>
									<option value="SUSPEND">Suspension</option>
									<option value="BAN">Bannissement</option>
									<option value="DELETE">Suppression</option>
									<option value="REACTIVATE">
										Réactivation
									</option>
									<option value="CREATE_TRIP">
										Créer un voyage
									</option>
									<option value="CANCEL_TRIP">
										Annuler un voyage
									</option>
									<option value="COMPLETE_TRIP">
										Compléter un voyage
									</option>
								</select>

								<Button
									variant="outline"
									onClick={() => refetch()}
									disabled={loading}
								>
									{loading ? "Chargement..." : "Actualiser"}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Logs Table */}
				<Card className="border-border">
					<CardContent className="p-0">
						{error && !backendUp ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Impossible de charger les données. Affichage
									des données en cache.
								</p>
							</div>
						) : loading && logs?.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Chargement des journaux...
								</p>
							</div>
						) : filteredLogs.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Aucun événement trouvé
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="border-b border-border bg-muted/50">
										<tr>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground"></th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Date & Heure
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Message
											</th>
										</tr>
									</thead>
									<tbody>
										{filteredLogs.map((log, idx) => (
											<tr
												key={log.id}
												className={`border-b border-border transition-colors hover:bg-muted/50 ${
													log.severity === "HIGH"
														? "bg-red-50/30 dark:bg-red-950/10"
														: idx % 2 === 0
															? "bg-background"
															: "bg-muted/20"
												}`}
											>
												<td className="px-6 py-4">
													{getSeverityBadge(
														log.severity,
														log.message,
													)}
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
													{formatDate(log.timestamp)}
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground w-auto truncate">
													{log.message}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
