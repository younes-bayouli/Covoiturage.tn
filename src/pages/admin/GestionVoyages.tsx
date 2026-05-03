"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	MapPin,
	Calendar,
	Users,
	DollarSign,
	AlertCircle,
	CheckCircle2,
	Search,
	ChevronRight,
	WifiOff,
	Clock,
	XCircle,
} from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { fi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Trip {
	id: number;
	depart: string;
	arrivee: string;
	date: string;
	heureDepart: string;
	conducteurId: number;
	conducteurNom: string;
	conducteurEmail: string;
	prix: number;
	placesTotales: number;
	placesDisponibles: number;
	status: "upcoming" | "ongoing" | "completed" | "cancelled";
	nombrePassagers: number;
	createdAt: string;
}

// Mock data for fallback
const mockTrips: Trip[] = [
	{
		id: 1,
		depart: "Tunis",
		arrivee: "Sfax",
		date: "2025-06-15",
		heureDepart: "08:00",
		conducteurId: 1,
		conducteurNom: "John Doe",
		conducteurEmail: "john@example.com",
		prix: 15,
		placesTotales: 4,
		placesDisponibles: 2,
		status: "upcoming",
		nombrePassagers: 2,
		createdAt: "2025-06-01T10:30:00",
	},
	{
		id: 2,
		depart: "Sfax",
		arrivee: "Sousse",
		date: "2025-06-16",
		heureDepart: "10:30",
		conducteurId: 2,
		conducteurNom: "Jane Smith",
		conducteurEmail: "jane@example.com",
		prix: 10,
		placesTotales: 3,
		placesDisponibles: 1,
		status: "upcoming",
		nombrePassagers: 2,
		createdAt: "2025-06-02T14:00:00",
	},
	{
		id: 3,
		depart: "Tunis",
		arrivee: "Monastir",
		date: "2025-06-10",
		heureDepart: "14:00",
		conducteurId: 3,
		conducteurNom: "Ali Ben",
		conducteurEmail: "ali@example.com",
		prix: 20,
		placesTotales: 5,
		placesDisponibles: 0,
		status: "completed",
		nombrePassagers: 5,
		createdAt: "2025-05-28T09:00:00",
	},
	{
		id: 4,
		depart: "Sousse",
		arrivee: "Tunis",
		date: "2025-06-05",
		heureDepart: "09:00",
		conducteurId: 4,
		conducteurNom: "Fatima Zara",
		conducteurEmail: "fatima@example.com",
		prix: 18,
		placesTotales: 4,
		placesDisponibles: 4,
		status: "cancelled",
		nombrePassagers: 0,
		createdAt: "2025-05-30T11:00:00",
	},
];

export function GestionVoyages() {
	const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(20);
	const navigate = useNavigate();

	// Fetch data from backend
	const {
		data: response,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		`http://localhost:8080/admin/trips?page=${page}&size=${size}`,
		{},
		{
			immediate: true,
			cache: false,
			healthCheck: true,
			fakeData: mockTrips,
		},
	);

	// Extract trips from response
	const trips: Trip[] = response===null?[]:response.content || [];

	useEffect(() => {
		let filtered = trips;

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter((trip) => {
				const depart = trip.depart || "";
				const arrivee = trip.arrivee || "";
				const conducteurNom = trip.owner.nom || "";
                const conducteurPrenom = trip.owner.prenom || "";
				const conducteurEmail = trip.owner.email || "";
				const searchLower = searchTerm.toLowerCase();

				return (
					depart.toLowerCase().includes(searchLower) ||
					arrivee.toLowerCase().includes(searchLower) ||
					searchLower.toLowerCase().includes(conducteurNom) ||
                    searchLower.toLowerCase().includes(conducteurPrenom) ||
                    searchLower.toLowerCase().includes(conducteurNom + " " + conducteurPrenom) ||
					conducteurEmail.toLowerCase().includes(searchLower)
				);
			});
		}

		// Filter by status
		if (statusFilter !== "ALL") {
			filtered = filtered.filter((trip) => trip?.status === statusFilter);
		}

		setFilteredTrips(filtered);
	}, [searchTerm, statusFilter, trips]);

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<
			string,
			{ bg: string; text: string; icon: React.ReactNode }
		> = {
			UPCOMING: {
				bg: "bg-blue-100",
				text: "text-blue-800",
				icon: <Clock className="h-4 w-4" />,
			},
			COMPLETED: {
				bg: "bg-green-100",
				text: "text-green-800",
				icon: <CheckCircle2 className="h-4 w-4" />,
			},
			CANCELED: {
				bg: "bg-red-100",
				text: "text-red-800",
				icon: <XCircle className="h-4 w-4" />,
			},
		};

		const config = statusConfig[status] || statusConfig.UPCOMING;

		return (
			<div
				className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${config.bg} ${config.text}`}
			>
				{config.icon}
				<span className="text-sm font-medium">
					{status === "UPCOMING"
						? "À venir"
						: status === "ONGOING"
							? "En cours"
							: status === "COMPLETED"
								? "Complété"
								: "Annulé"}
				</span>
			</div>
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("fr-FR");
	};

	const formatTime = (timeString: string) => {
		return new Date(timeString).toLocaleTimeString("fr-FR", {
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
								<MapPin className="h-6 w-6 text-primary" />
							</div>
							Gestion des voyages
						</h1>
						<p className="mt-1 text-muted-foreground">
							Gérez tous les trajets disponibles sur la plateforme
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
									placeholder="Rechercher par route, conducteur ou email..."
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
								<option value="UPCOMING">À venir</option>
								<option value="COMPLETED">Complété</option>
								<option value="CANCELED">Annulé</option>
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

				{/* Trips Table */}
				<Card className="border-border">
					<CardContent className="p-0">
						{error && !backendUp ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Impossible de charger les données. Affichage
									des données en cache.
								</p>
							</div>
						) : loading && trips?.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Chargement des voyages...
								</p>
							</div>
						) : filteredTrips.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-muted-foreground">
									Aucun voyage trouvé
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="border-b border-border bg-muted/50">
										<tr>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Route
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Date & Heure
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Conducteur
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Statut
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Prix
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Places
											</th>
											<th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
												Passagers
											</th>
											<th className="px-6 py-3" />
										</tr>
									</thead>
									<tbody>
										{filteredTrips.map((trip, idx) => (
											<tr
												key={trip.id}
												className={`border-b border-border transition-colors hover:bg-muted/50 ${
													idx % 2 === 0
														? "bg-background"
														: "bg-muted/20"
												}`}
											>
												<td className="px-6 py-4 text-sm text-foreground font-medium">
													{trip.depart} →{" "}
													{trip.arrivee}
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground">
													<div className="flex flex-col">
														<span>
															{formatDate(
																trip.date,
															)}
														</span>
														<span className="text-xs text-muted-foreground">
															Depart:{" "}
															{formatTime(
																trip.departureTime,
															)}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 text-sm">
													<div className="flex flex-col">
														<span className="text-foreground font-medium">
															{trip.owner.nom}
														</span>
														<span className="text-xs text-muted-foreground">
															{trip.owner.prenom}
														</span>
													</div>
												</td>
												<td className="px-6 py-4">
													{getStatusBadge(
														trip.status,
													)}
												</td>
												<td className="px-6 py-4 text-sm font-semibold text-foreground">
													<div className="flex items-center gap-1">
														{trip.prix.toFixed(2)}{" "}
														DT
													</div>
												</td>
												<td className="px-6 py-4 text-sm">
													<div className="flex items-center gap-2">
														<Users className="h-4 w-4 text-muted-foreground" />
														<span>
															{trip.seats -
																trip.placesDisponibles}
															/
															{
																trip.placesDisponibles
															}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 text-sm text-foreground font-medium">
													{trip.seats -
														trip.placesDisponibles}
												</td>
												<td className="px-6 py-4 text-right">
													<Button
														variant="ghost"
														size="sm"
														className="gap-1"
														onClick={() =>
															navigate(
																`/admin/trips/${trip.id}`,
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
