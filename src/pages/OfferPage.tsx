"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	MapPin,
	Calendar,
	Clock,
	Users,
	Car,
	DollarSign,
	ChevronDown,
	BadgeCheck,
	Star,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cities } from "@/lib/data";
import { useAuth } from "../context/AuthContext";
// @ts-ignore
import { Fetch } from "@/hooks/Fetch";

export function OfferPage() {
	const navigate = useNavigate();
	const { utilisateur } = useAuth();
	const [showSuccess, setShowSuccess] = useState(false);
	const [showNotification, setShowNotification] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Form state
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [departurePoint, setDeparturePoint] = useState("");
	const [arrivalPoint, setArrivalPoint] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [seats, setSeats] = useState("3");
	const [price, setPrice] = useState("");
	const [car, setCar] = useState("");
	const [notes, setNotes] = useState("");

	// Get current user from auth context
	const currentUser = {
		name: utilisateur
			? `${utilisateur.prenom} ${utilisateur.nom}`
			: "Utilisateur",
		avatar:
			utilisateur?.avatarUrl ||
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
		rating: utilisateur?.note || 0,
		tripsCompleted: utilisateur?.trajetsEnTantQueConducteur || 0,
		idVerified: utilisateur?.identiteVerifiee || false,
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			console.log("Submitting trip with data:", date);
			const tripData = {
				depart: from,
				arrivee: to,
				departurePoint,
				arrivalPoint,
				date: date,
				departureTime: `${date}T${time}`,
				prix: parseFloat(price),
				placesDisponibles: parseInt(seats),
				seats: parseInt(seats),
				car,
				notes,
			};

			const result = await Fetch(
				"http://localhost:8080/voyages",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(tripData),
				},
				{
					healthCheck: true,
					retries: 0,
					retryDelay: 1000,
					timeout: 10000,
				},
			);

			if (result.success) {
				setShowNotification(true);
				setShowSuccess(true);
				// Hide notification after 5 seconds
				setTimeout(() => setShowNotification(false), 5000);
			} else {
				console.error("Failed to create trip:", result.error);
				alert(
					"Erreur lors de la creation du trajet. Veuillez reessayer.",
				);
			}
		} catch (error) {
			console.error("Error:", error);
			alert("Une erreur s'est produite. Veuillez reessayer.");
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "Date non definie";
		const d = new Date(dateStr);
		const days = [
			"Dimanche",
			"Lundi",
			"Mardi",
			"Mercredi",
			"Jeudi",
			"Vendredi",
			"Samedi",
		];
		const months = [
			"Janvier",
			"Fevrier",
			"Mars",
			"Avril",
			"Mai",
			"Juin",
			"Juillet",
			"Aout",
			"Septembre",
			"Octobre",
			"Novembre",
			"Decembre",
		];
		return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
	};

	const initials = currentUser
		? `${currentUser.name
				.split(" ")
				.map((n) => n[0])
				.join("")}`
		: "?";

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
				<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-foreground sm:text-3xl">
					Proposer un trajet
				</h1>
				<p className="mt-2 text-muted-foreground">
					Partagez votre prochain voyage et economisez sur les frais
					de route
				</p>

				<div className="mt-8 grid gap-8 lg:grid-cols-2">
					{/* Form */}
					<Card className="border-border">
						<CardHeader>
							<CardTitle>Details du trajet</CardTitle>
						</CardHeader>
						<CardContent className="p-6 pt-0">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Route */}
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<Label htmlFor="from">
											Ville de depart
										</Label>
										<div className="relative mt-2">
											<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<select
												id="from"
												value={from}
												onChange={(e) =>
													setFrom(e.target.value)
												}
												required
												className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											>
												<option value="">
													Selectionnez
												</option>
												{cities.map((city) => (
													<option
														key={city}
														value={city}
													>
														{city}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
										</div>
									</div>
									<div>
										<Label htmlFor="to">
											Ville d&apos;arrivee
										</Label>
										<div className="relative mt-2">
											<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<select
												id="to"
												value={to}
												onChange={(e) =>
													setTo(e.target.value)
												}
												required
												className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											>
												<option value="">
													Selectionnez
												</option>
												{cities.map((city) => (
													<option
														key={city}
														value={city}
													>
														{city}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
										</div>
									</div>
								</div>

								{/* Exact locations */}
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<Label htmlFor="departurePoint">
											Point de depart exact
										</Label>
										<Input
											id="departurePoint"
											value={departurePoint}
											onChange={(e) =>
												setDeparturePoint(
													e.target.value,
												)
											}
											placeholder="Ex: Station Bab Saadoun"
											className="mt-2"
										/>
									</div>
									<div>
										<Label htmlFor="arrivalPoint">
											Point d&apos;arrivee exact
										</Label>
										<Input
											id="arrivalPoint"
											value={arrivalPoint}
											onChange={(e) =>
												setArrivalPoint(e.target.value)
											}
											placeholder="Ex: Centre-ville"
											className="mt-2"
										/>
									</div>
								</div>

								{/* Date & Time */}
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<Label htmlFor="date">
											Date de depart
										</Label>
										<div className="relative mt-2">
											<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<input
												type="date"
												id="date"
												value={date}
												onChange={(e) =>
													setDate(e.target.value)
												}
												required
												className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											/>
										</div>
									</div>
									<div>
										<Label htmlFor="time">
											Heure de depart
										</Label>
										<div className="relative mt-2">
											<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<input
												type="time"
												id="time"
												value={time}
												onChange={(e) =>
													setTime(e.target.value)
												}
												required
												className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											/>
										</div>
									</div>
								</div>

								{/* Seats & Price */}
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<Label htmlFor="seats">
											Places disponibles
										</Label>
										<div className="relative mt-2">
											<Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<select
												id="seats"
												value={seats}
												onChange={(e) =>
													setSeats(e.target.value)
												}
												className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
											>
												{[1, 2, 3, 4, 5, 6].map((n) => (
													<option key={n} value={n}>
														{n} place
														{n > 1 ? "s" : ""}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
										</div>
									</div>
									<div>
										<Label htmlFor="price">
											Prix par place (DT)
										</Label>
										<div className="relative mt-2">
											<DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												type="number"
												id="price"
												value={price}
												onChange={(e) =>
													setPrice(e.target.value)
												}
												placeholder="15"
												required
												min="1"
												max="100"
												className="pl-10"
											/>
										</div>
									</div>
								</div>

								{/* Car */}
								<div>
									<Label htmlFor="car">Votre vehicule</Label>
									<div className="relative mt-2">
										<Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="car"
											value={car}
											onChange={(e) =>
												setCar(e.target.value)
											}
											placeholder="Ex: Volkswagen Golf 7"
											className="pl-10"
										/>
									</div>
								</div>

								{/* Notes */}
								<div>
									<Label htmlFor="notes">
										Informations supplementaires
									</Label>
									<Textarea
										id="notes"
										value={notes}
										onChange={(e) =>
											setNotes(e.target.value)
										}
										placeholder="Climatisation, bagages acceptes, animaux non-fumeur..."
										className="mt-2"
										rows={3}
									/>
								</div>

								<Button
									type="submit"
									disabled={isLoading}
									className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
								>
									{isLoading
										? "Publication en cours..."
										: "Publier le trajet"}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Live Preview */}
					<div>
						<h2 className="mb-4 text-lg font-semibold text-foreground">
							Apercu de votre annonce
						</h2>
						<Card className="border-border">
							<CardContent className="p-6">
								{/* Date */}
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									{formatDate(date)} {time && `a ${time}`}
								</div>

								{/* Route */}
								<div className="mt-6 flex items-start gap-4">
									<div className="flex flex-col items-center pt-1">
										<div className="h-4 w-4 rounded-full border-2 border-primary bg-background" />
										<div className="h-16 w-0.5 bg-border" />
										<div className="h-4 w-4 rounded-full bg-primary" />
									</div>
									<div className="flex-1 space-y-4">
										<div>
											<p className="text-lg font-semibold text-foreground">
												{from || "Ville de depart"}
											</p>
											<p className="text-sm text-muted-foreground">
												{departurePoint ||
													"Point de depart"}
											</p>
										</div>
										<div>
											<p className="text-lg font-semibold text-foreground">
												{to || "Ville d'arrivee"}
											</p>
											<p className="text-sm text-muted-foreground">
												{arrivalPoint ||
													"Point d'arrivee"}
											</p>
										</div>
									</div>
								</div>

								<Separator className="my-6" />

								{/* Meta */}
								<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
									<span className="flex items-center gap-1">
										<Users className="h-4 w-4" />
										{seats} place
										{parseInt(seats) > 1 ? "s" : ""}
									</span>
									{car && (
										<span className="flex items-center gap-1">
											<Car className="h-4 w-4" />
											{car}
										</span>
									)}
								</div>

								<Separator className="my-6" />

								{/* Driver */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="relative">
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-medium text-blue-700">
												{initials}
											</div>
											{currentUser.idVerified && (
												<div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
													<BadgeCheck className="h-3 w-3 text-primary-foreground" />
												</div>
											)}
										</div>
										<div>
											<p className="font-medium text-foreground">
												{currentUser.name}
											</p>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Star className="h-3 w-3 fill-accent text-accent" />
												{currentUser.rating}
												<span>-</span>
												<span>
													{currentUser.tripsCompleted}{" "}
													trajets
												</span>
											</div>
										</div>
									</div>
									<span className="text-2xl font-bold text-primary">
										{price || "0"} DT
									</span>
								</div>
							</CardContent>
						</Card>

						{notes && (
							<Card className="mt-4 border-border">
								<CardContent className="p-4">
									<p className="text-sm text-muted-foreground">
										{notes}
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>

			{/* Bottom Left Notification */}
			{showNotification && (
				<div className="fixed bottom-4 left-4 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
						<Check className="h-5 w-5 text-green-600" />
					</div>
					<div>
						<p className="font-medium text-green-900">Succes!</p>
						<p className="text-sm text-green-700">
							Votre trajet a ete publie avec succes.
						</p>
					</div>
				</div>
			)}

			{/* Success Dialog */}
			<Dialog open={showSuccess} onOpenChange={setShowSuccess}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Trajet publie avec succes!</DialogTitle>
						<DialogDescription>
							Votre annonce est maintenant visible par tous les
							passagers.
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col items-center py-6">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<Check className="h-8 w-8 text-primary" />
						</div>
						<p className="mt-4 text-center text-sm text-muted-foreground">
							Vous recevrez une notification lorsqu&apos;un
							passager reservera une place.
						</p>
						<div className="mt-6 flex w-full gap-3">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => {
									setShowSuccess(false);
									navigate("/trips");
								}}
							>
								Voir mes trajets
							</Button>
							<Button
								className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
								onClick={() => {
									setShowSuccess(false);
									navigate("/search");
								}}
							>
								Voir les trajets
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	);
}
