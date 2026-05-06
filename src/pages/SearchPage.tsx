"use client";

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
	MapPin,
	Clock,
	Users,
	ChevronRight,
	SlidersHorizontal,
	X,
	WifiOff,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cities } from "@/lib/data";
import { useAuth } from "../context/AuthContext";
//@ts-ignore
import useFetch from "@/hooks/useFetch";

const fakeVoyages = [
	{
		id: 1,
		depart: "Tunis",
		arrivee: "Sfax",
		prix: 15,
		placesDisponibles: 3,
		date: "2025-06-01",
		departureTime: "2025-06-01T08:00:00",
	},
	{
		id: 2,
		depart: "Sfax",
		arrivee: "Sousse",
		prix: 10,
		placesDisponibles: 2,
		date: "2025-06-02",
		departureTime: "2025-06-02T10:30:00",
	},
	{
		id: 3,
		depart: "Tunis",
		arrivee: "Monastir",
		prix: 20,
		placesDisponibles: 4,
		date: "2025-06-03",
		departureTime: "2025-06-03T14:00:00",
	},
	{
		id: 4,
		depart: "Sousse",
		arrivee: "Tunis",
		prix: 18,
		placesDisponibles: 1,
		date: "2025-06-04",
		departureTime: "2025-06-04T09:00:00",
	},
	{
		id: 5,
		depart: "Sfax",
		arrivee: "Gabès",
		prix: 12,
		placesDisponibles: 3,
		date: "2025-06-05",
		departureTime: "2025-06-05T11:00:00",
	},
];

export function SearchPage() {
	const [searchParams] = useSearchParams();
	const { utilisateur } = useAuth();
	const initialDepart = searchParams.get("depart") || "";
	const initialArrivee = searchParams.get("arrivee") || "";
	const dateParam = searchParams.get("date") || "";
	const passagersParam = searchParams.get("nbrPassagers") || "1";

	const [afficherFiltres, setAfficherFiltres] = useState(false);
	const [allVoyages, setVoyages] = useState([]);

	// Filter state
	const [depart, setDepart] = useState(initialDepart);
	const [arrivee, setArrivee] = useState(initialArrivee);
	const [prixMax, setPrixMax] = useState(50);
	const [placesMin, setPlacesMin] = useState(1);
	const [date, setDate] = useState(dateParam);

	// Determine which endpoint to use
	// If both depart and arrivee are provided, use search (with or without date)
	// Otherwise, get all upcoming trips
	const hasSearchParams = depart && arrivee;

	const buildUrl = () => {
		if (hasSearchParams) {
			const params = new URLSearchParams({
				depart: depart,
				arrivee: arrivee,
				nbrPassagers: passagersParam,
				prixMax: String(prixMax),
				placesMin: String(placesMin),
			});

			// Only add date if it's provided
			if (date) {
				params.append("date", date);
			}

			return `http://localhost:8080/voyages/recherche?${params.toString()}`;
		} else {
			// Get all upcoming trips
			return `http://localhost:8080/voyages/upcoming?limit=100`;
		}
	};

	const {
		data: voyages,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		buildUrl(),
		{},
		{
			immediate: true,
			cache: false,
			healthCheck: true,
			fakeData: fakeVoyages,
		},
	);

	useEffect(() => {
		if (voyages) {
			// Handle both wrapped and unwrapped responses
			const voyagesArray = Array.isArray(voyages)
				? voyages
				: voyages.data
					? voyages.data
					: [];
			setVoyages(voyagesArray);
		}
	}, [voyages]);

	// Refetch whenever filters change
	useEffect(() => {
		refetch(buildUrl());
	}, [prixMax, placesMin, date, depart, arrivee]);

	const reinitialiserFiltres = () => {
		setDepart(initialDepart);
		setArrivee(initialArrivee);
		setPrixMax(50);
		setPlacesMin(1);
		setDate(dateParam);
	};

	const isUserOwner = (voyage: any) => {
		return utilisateur && voyage.owner?.id === utilisateur.id;
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{!backendUp && (
					<div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
						<WifiOff className="h-5 w-5 shrink-0" />
						<p className="text-sm font-medium">
							Serveur inaccessible — les données affichées sont
							des exemples.
						</p>
					</div>
				)}

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-foreground sm:text-3xl">
							{depart && arrivee
								? `${depart} → ${arrivee}`
								: "Tous les voyages"}
						</h1>
						<p className="mt-1 text-muted-foreground">
							{loading
								? "Recherche en cours..."
								: `${allVoyages?.length || 0} voyage${allVoyages?.length !== 1 ? "s" : ""} disponible${allVoyages?.length !== 1 ? "s" : ""}`}
						</p>
					</div>
					<Button
						variant="outline"
						onClick={() => setAfficherFiltres(!afficherFiltres)}
						className="flex items-center gap-2"
					>
						<SlidersHorizontal className="h-4 w-4" />
						Filtres
					</Button>
				</div>

				<div className="mt-8 grid gap-8 lg:grid-cols-4">
					{/* ── Filters sidebar ── */}
					<aside
						className={`lg:block ${afficherFiltres ? "block" : "hidden"} lg:col-span-1`}
					>
						<Card className="sticky top-24 border-border">
							<CardContent className="p-6 space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-foreground">
										Filtres
									</h2>
									<button
										onClick={reinitialiserFiltres}
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Réinitialiser
									</button>
								</div>

								{/* Départ (dropdown) */}
								<div>
									<Label className="text-sm font-medium">
										Départ
									</Label>
									<select
										value={depart}
										onChange={(e) =>
											setDepart(e.target.value)
										}
										className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									>
										<option value="">
											Sélectionner une ville
										</option>
										{cities.map((city) => (
											<option key={city} value={city}>
												{city}
											</option>
										))}
									</select>
								</div>

								{/* Arrivée (dropdown) */}
								<div>
									<Label className="text-sm font-medium">
										Arrivée
									</Label>
									<select
										value={arrivee}
										onChange={(e) =>
											setArrivee(e.target.value)
										}
										className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									>
										<option value="">
											Sélectionner une ville
										</option>
										{cities.map((city) => (
											<option key={city} value={city}>
												{city}
											</option>
										))}
									</select>
								</div>

								{/* Date */}
								<div>
									<Label className="text-sm font-medium">
										Date{" "}
										<span className="text-xs text-muted-foreground">
											(optionnel)
										</span>
									</Label>
									<input
										type="date"
										value={date}
										onChange={(e) =>
											setDate(e.target.value)
										}
										className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									/>
									{date === "" && depart && arrivee && (
										<p className="mt-1 text-xs text-muted-foreground">
											Tous les trajets à venir seront
											affichés
										</p>
									)}
								</div>

								{/* Prix max */}
								<div>
									<div className="flex items-center justify-between">
										<Label className="text-sm font-medium">
											Prix maximum
										</Label>
										<span className="text-sm font-semibold text-primary">
											{prixMax} DT
										</span>
									</div>
									<Slider
										className="mt-3"
										min={0}
										max={50}
										step={5}
										value={[prixMax]}
										onValueChange={([val]) =>
											setPrixMax(val)
										}
									/>
									<div className="mt-1 flex justify-between text-xs text-muted-foreground">
										<span>0 DT</span>
										<span>50 DT</span>
									</div>
								</div>

								{/* Places minimum */}
								<div>
									<div className="flex items-center justify-between">
										<Label className="text-sm font-medium">
											Places disponibles (min)
										</Label>
										<span className="text-sm font-semibold text-primary">
											{placesMin}
										</span>
									</div>
									<Slider
										className="mt-3"
										min={1}
										max={4}
										step={1}
										value={[placesMin]}
										onValueChange={([val]) =>
											setPlacesMin(val)
										}
									/>
									<div className="mt-1 flex justify-between text-xs text-muted-foreground">
										<span>1</span>
										<span>4</span>
									</div>
								</div>

								<Button
									variant="outline"
									className="w-full lg:hidden"
									onClick={() => setAfficherFiltres(false)}
								>
									<X className="mr-2 h-4 w-4" />
									Fermer les filtres
								</Button>
							</CardContent>
						</Card>
					</aside>

					{/* ── Results ── */}
					<div className={"lg:col-span-3"}>
						{loading && (
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<Card key={i} className="border-border">
										<CardContent className="p-6">
											<div className="animate-pulse space-y-3">
												<div className="h-4 w-1/3 rounded bg-muted" />
												<div className="h-4 w-1/2 rounded bg-muted" />
												<div className="h-4 w-1/4 rounded bg-muted" />
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}

						{error && !loading && backendUp && hasSearchParams && (
							<Card className="border-destructive">
								<CardContent className="flex flex-col items-center justify-center py-16">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
										<X className="h-8 w-8 text-destructive" />
									</div>
									<h3 className="mt-4 text-lg font-semibold text-foreground">
										Erreur de connexion
									</h3>
									<p className="mt-2 text-center text-muted-foreground">
										Impossible de contacter le serveur.
										Veuillez réessayer.
									</p>
									<Button
										className="mt-6"
										onClick={() => refetch(buildUrl())}
									>
										Réessayer
									</Button>
								</CardContent>
							</Card>
						)}

						{!loading && !error && allVoyages?.length === 0 && (
							<Card className="border-border">
								<CardContent className="flex flex-col items-center justify-center py-16">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
										<MapPin className="h-8 w-8 text-muted-foreground" />
									</div>
									<h3 className="mt-4 text-lg font-semibold text-foreground">
										Aucun voyage trouvé
									</h3>
									<p className="mt-2 text-center text-muted-foreground">
										Essayez de modifier vos filtres ou vos
										paramètres de recherche.
									</p>
									<Button
										variant="outline"
										className="mt-6"
										onClick={reinitialiserFiltres}
									>
										Réinitialiser les filtres
									</Button>
								</CardContent>
							</Card>
						)}

						{!loading && allVoyages && allVoyages.length > 0 && (
							<div className="space-y-4">
								{allVoyages.map((voyage: any) => {
									const isOwner = isUserOwner(voyage);
									return (
										<Link
											key={voyage.id}
											to={`/voyage/${voyage.id}`}
										>
											<Card
												className={`border-border transition-all relative ${
													isOwner
														? "opacity-75"
														: "hover:border-primary/50 hover:shadow-md"
												} `}
											>
												{isOwner && (
													<div className="absolute top-4 left-4">
														<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary border border-primary/20">
															<Shield className="h-3 w-3" />
															Votre trajet
														</span>
													</div>
												)}
												<CardContent className="p-6">
													<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
														<div className="flex-1">
															<div className="flex items-center gap-3">
																<div className="flex flex-col items-center">
																	<div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
																	<div className="h-8 w-0.5 bg-border" />
																	<div className="h-3 w-3 rounded-full bg-primary" />
																</div>
																<div className="flex-1">
																	<div className="flex items-center justify-between">
																		<p className="font-medium text-foreground">
																			{
																				voyage.depart
																			}
																		</p>
																	</div>
																	<div className="mt-4">
																		<p className="font-medium text-foreground">
																			{
																				voyage.arrivee
																			}
																		</p>
																	</div>
																</div>
															</div>
															<div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
																<span className="flex items-center gap-1">
																	<Users className="h-4 w-4" />
																	{
																		voyage.placesDisponibles
																	}{" "}
																	place
																	{voyage.placesDisponibles >
																	1
																		? "s"
																		: ""}
																</span>
																<span className="flex items-center gap-1">
																	<Clock className="h-4 w-4" />
																	{
																		voyage.date
																	}
																</span>
															</div>
														</div>
														<div className="d-flex align-content-end">
															<span className="text-sm text-muted-foreground">
																{voyage.departureTime
																	? new Date(
																			voyage.departureTime,
																		).toLocaleTimeString(
																			"fr-TN",
																			{
																				hour: "2-digit",
																				minute: "2-digit",
																			},
																		)
																	: ""}
															</span>
															<div className="flex items-center">
																<span className="text-2xl font-bold text-primary">
																	{
																		voyage.prix
																	}{" "}
																	DT
																</span>
																{!isOwner && (
																	<ChevronRight className="h-5 w-5 text-muted-foreground" />
																)}
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</Link>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
