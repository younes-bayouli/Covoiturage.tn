"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Users,
	Shield,
	AlertCircle,
	CheckCircle2,
	Search,
	ChevronRight,
	WifiOff,
	Crown,
} from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

interface User {
	id: number;
	email: string;
	prenom: string;
	nom: string;
	ville: string;
	accountStatus: "ACTIVE" | "SUSPENDED" | "BANNED";
	identiteVerifiee: boolean;
	telephoneVerifie: boolean;
	note: number;
	trajetsEffectues: number;
	role: string;
}

// Mock data for fallback
const mockUsers: User[] = [
	{
		id: 1,
		email: "john@example.com",
		prenom: "John",
		nom: "Doe",
		ville: "Tunis",
		accountStatus: "ACTIVE",
		identiteVerifiee: true,
		telephoneVerifie: true,
		note: 4.8,
		trajetsEffectues: 12,
	},
	{
		id: 2,
		email: "jane@example.com",
		prenom: "Jane",
		nom: "Smith",
		ville: "Sfax",
		accountStatus: "ACTIVE",
		identiteVerifiee: false,
		telephoneVerifie: true,
		note: 4.5,
		trajetsEffectues: 8,
	},
	{
		id: 3,
		email: "suspended@example.com",
		prenom: "Suspended",
		nom: "User",
		ville: "Sousse",
		accountStatus: "SUSPENDED",
		identiteVerifiee: true,
		telephoneVerifie: false,
		note: 2.1,
		trajetsEffectues: 3,
	},
	{
		id: 4,
		email: "banned@example.com",
		prenom: "Banned",
		nom: "User",
		ville: "Monastir",
		accountStatus: "BANNED",
		identiteVerifiee: false,
		telephoneVerifie: false,
		note: 1.0,
		trajetsEffectues: 1,
	},
];

export function GestionUtilisateurs() {
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(20);
	const navigate = useNavigate();
	const { utilisateur } = useAuth();

	// Fetch data from backend
	const {
		data: response,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		`http://localhost:8080/admin/users?page=${page}&size=${size}`,
		{},
		{
			immediate: true,
			cache: false,
			healthCheck: true,
			fakeData: null,
		},
	);

	// Extract users from response
	const users: User[] = response?.content || response || mockUsers;

	useEffect(() => {
		let filtered = users ? users : [];

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter((user) => {
				// Add null checks for all properties
				const email = user?.email || "";
				const prenom = user?.prenom || "";
				const nom = user?.nom || "";
				const ville = user?.ville || "";
				const searchLower = searchTerm.toLowerCase();

				return (
					email.toLowerCase().includes(searchLower) ||
					`${prenom} ${nom}`.toLowerCase().includes(searchLower) ||
					ville.toLowerCase().includes(searchLower)
				);
			});
		}

		// Filter by status
		if (statusFilter !== "ALL") {
			filtered = filtered.filter(
				(user) => user?.accountStatus === statusFilter,
			);
		}

		setFilteredUsers(filtered);
	}, [searchTerm, statusFilter, users]);

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<
			string,
			{ bg: string; text: string; icon: React.ReactNode }
		> = {
			ACTIVE: {
				bg: "bg-green-100",
				text: "text-green-800",
				icon: <CheckCircle2 className="h-4 w-4" />,
			},
			SUSPENDED: {
				bg: "bg-yellow-100",
				text: "text-yellow-800",
				icon: <AlertCircle className="h-4 w-4" />,
			},
			BANNED: {
				bg: "bg-red-100",
				text: "text-red-800",
				icon: <AlertCircle className="h-4 w-4" />,
			},
		};

		const config = statusConfig[status] || statusConfig.ACTIVE;

		return (
			<div
				className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${config.bg} ${config.text}`}
			>
				{config.icon}
				<span className="text-sm font-medium">
					{status === "ACTIVE"
						? "Actif"
						: status === "SUSPENDED"
							? "Suspendu"
							: "Banni"}
				</span>
			</div>
		);
	};

	const isCurrentUser = (userId: number) => {
		return utilisateur?.id === userId;
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
								<Users className="h-6 w-6 text-primary" />
							</div>
							Gestion des utilisateurs
						</h1>
						<p className="mt-1 text-muted-foreground">
							Gérez tous les comptes utilisateurs de la plateforme
						</p>
					</div>
				</div>

				{/* Search and Filters */}
				<Card className="border-border mb-8">
					<CardContent className="p-6">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Rechercher par email, nom ou ville..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>
							<select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(e.target.value)
								}
								className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							>
								<option value="ALL">Tous les statuts</option>
								<option value="ACTIVE">Actif</option>
								<option value="SUSPENDED">Suspendu</option>
								<option value="BANNED">Banni</option>
							</select>
							<Button
								variant="outline"
								onClick={() => refetch()}
								disabled={loading}
							>
								{loading ? "Chargement..." : "Actualiser"}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Users Table */}
				<Card className="border-border">
					<CardContent className="p-0">
						{error && !backendUp ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Impossible de charger les données. Affichage
									des données en cache.
								</p>
							</div>
						) : loading && users.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Chargement des utilisateurs...
								</p>
							</div>
						) : filteredUsers.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Aucun utilisateur trouvé
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="border-b border-border bg-muted/50">
										<tr>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Email
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Nom
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Ville
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Statut
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Vérifications
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Note
											</th>
											<th className="px-6 py-3" />
										</tr>
									</thead>
									<tbody>
										{filteredUsers.map((user, idx) => (
											<tr
												key={user.id}
												className={`border-b border-border transition-colors hover:bg-muted/50 ${
													isCurrentUser(user.id)
														? "bg-primary/5"
														: idx % 2 === 0
															? "bg-background"
															: "bg-muted/20"
												}`}
											>
												<td className="px-6 py-4 text-sm text-foreground">
													<div className="flex items-center gap-2">
														{user.email}
														{isCurrentUser(
															user.id,
														) && (
															<span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1">
																<Crown className="h-3 w-3 text-primary" />
																<span className="text-xs font-medium text-primary">
																	Vous
																</span>
															</span>
														)}
														{!isCurrentUser(
															user.id,
														) &&
															user.role ===
																"ADMIN" && (
																<span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1">
																	<Crown className="h-3 w-3 text-primary" />
																	<span className="text-xs font-medium text-primary">
																		Admin
																	</span>
																</span>
															)}
													</div>
												</td>
												<td className="px-6 py-4 text-sm text-foreground">
													{user.prenom} {user.nom}
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground">
													{user.ville}
												</td>
												<td className="px-6 py-4">
													{getStatusBadge(
														user.accountStatus,
													)}
												</td>
												<td className="px-6 py-4 text-sm">
													<div className="flex gap-2">
														{user.identiteVerifiee ? (
															<CheckCircle2 className="h-4 w-4 text-green-600" />
														) : (
															<AlertCircle className="h-4 w-4 text-muted-foreground" />
														)}
														{user.telephoneVerifie ? (
															<CheckCircle2 className="h-4 w-4 text-green-600" />
														) : (
															<AlertCircle className="h-4 w-4 text-muted-foreground" />
														)}
													</div>
												</td>
												<td className="px-6 py-4 text-sm font-semibold">
													{user.note
														? user.note.toFixed(1)
														: "N/A"}{" "}
													⭐
												</td>
												<td className="px-6 py-4 text-right">
													<Button
														variant="ghost"
														size="sm"
														className="gap-1"
														onClick={() =>
															navigate(
																`/admin/users/${user.id}`,
															)
														}
													>
														Voir
														<ChevronRight className="h-4 w-4" />
													</Button>
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
