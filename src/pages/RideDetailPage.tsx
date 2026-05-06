"use client";

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	MapPin,
	Clock,
	Users,
	Star,
	BadgeCheck,
	Phone,
	Car,
	ArrowLeft,
	Calendar,
	MessageCircle,
	ChevronRight,
	Minus,
	Plus,
	Check,
	CreditCard,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// @ts-ignore
import { Fetch } from "@/hooks/Fetch";

export function RideDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { utilisateur } = useAuth();
	const [selectedSeats, setSelectedSeats] = useState(1);
	const [bookingConfirmed, setBookingConfirmed] = useState(false);
	const [paymentSimRecorded, setPaymentSimRecorded] = useState(false);
	const [acceptedSimulatedPayment, setAcceptedSimulatedPayment] =
		useState(false);
	const [ride, setRide] = useState(null);
	const [driver, setDriver] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchRideData = async () => {
			try {
				setIsLoading(true);

				// Fetch ride details
				const rideResult = await Fetch(
					`http://localhost:8080/voyages/${id}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					},
					{
						healthCheck: true,
						retries: 0,
						retryDelay: 1000,
						timeout: 10000,
					},
				);

				if (!rideResult.success) {
					setError("Impossible de charger le trajet");
					setIsLoading(false);
					return;
				}

				const rideData = rideResult.data.data;
				setRide(rideData);
				setDriver(rideData.owner);

				setIsLoading(false);
			} catch (err) {
				console.error("Error fetching ride data:", err);
				setError("Une erreur s'est produite lors du chargement");
				setIsLoading(false);
			}
		};

		if (id) {
			fetchRideData();
		}
	}, [id]);

	const isUserOwner = () => {
		return utilisateur && driver && utilisateur.id === driver.id;
	};

	const handleBooking = async () => {
		if (!paymentSimRecorded || !acceptedSimulatedPayment) {
			alert(
				"Cochez l'autorisation et enregistrez le paiement simule avant de confirmer.",
			);
			return;
		}
		try {
			const bookingData = {
				voyageId: Number(id),
				nombrePlaces: selectedSeats,
				simulatePayment: true,
				paymentMethod: "CB_SIMULATION",
				maskedCardDigits: "****4242",
			};

			const result = await Fetch(
				`http://localhost:8080/reservations`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(bookingData),
				},
				{
					healthCheck: true,
					retries: 0,
					retryDelay: 1000,
					timeout: 10000,
				},
			);

			if (result.success) {
				setBookingConfirmed(true);
			} else {
				alert("Erreur lors de la reservation. Veuillez reessayer.");
			}
		} catch (err) {
			console.error("Booking error:", err);
			alert("Une erreur s'est produite lors de la reservation.");
		}
	};

	if (isLoading) {
		return (
			<main className="min-h-screen bg-background">
				<div className="mx-auto max-w-3xl px-4 py-16 text-center">
					<p className="text-muted-foreground">
						Chargement du trajet...
					</p>
				</div>
			</main>
		);
	}

	if (error !== "" || !ride || !driver) {
		return (
			<main className="min-h-screen bg-background">
				<div className="mx-auto max-w-3xl px-4 py-16 text-center">
					<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-foreground">
						Trajet non trouve
					</h1>
					<p className="mt-2 text-muted-foreground">
						{error ||
							"Ce trajet n'existe pas ou n'est plus disponible."}
					</p>
					<Button
						className="mt-6"
						onClick={() => navigate("/search")}
					>
						Retour aux trajets
					</Button>
				</div>
			</main>
		);
	}

	const totalPrice = ride.prix * selectedSeats;
	const availableSeats = ride.placesDisponibles;
	const isOwner = isUserOwner();

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Back */}
				<Link
					to="/search"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour aux resultats
				</Link>

				<div className="mt-6 grid gap-8 lg:grid-cols-3">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Route Card */}
						<Card className="border-border relative">
							<CardContent className="p-6">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									{ride.date} a{" "}
									{ride.departureTime?.split("T")[1] || ""}
								</div>

								<div className="mt-6 flex items-start gap-4">
									<div className="flex flex-col items-center pt-1">
										<div className="h-4 w-4 rounded-full border-2 border-primary bg-background" />
										<div className="h-20 w-0.5 bg-border" />
										{ride.stops &&
											ride.stops.length > 0 && (
												<>
													<div className="h-3 w-3 rounded-full bg-muted-foreground/50" />
													<div className="h-20 w-0.5 bg-border" />
												</>
											)}
										<div className="h-4 w-4 rounded-full bg-primary" />
									</div>
									<div className="flex-1 space-y-6">
										<div>
											<p className="text-lg font-semibold text-foreground">
												{ride.depart}
											</p>
											<p className="text-sm text-muted-foreground">
												{ride.departurePoint}
											</p>
										</div>
										{ride.stops &&
											ride.stops.length > 0 && (
												<div>
													<p className="text-sm font-medium text-muted-foreground">
														Arret:{" "}
														{ride.stops.join(", ")}
													</p>
												</div>
											)}
										<div>
											<p className="text-lg font-semibold text-foreground">
												{ride.arrivee}
											</p>
											<p className="text-sm text-muted-foreground">
												{ride.arrivalPoint}
											</p>
										</div>
									</div>
								</div>

								<Separator className="my-6" />

								<div className="flex flex-wrap gap-6">
									<div className="flex items-center gap-2">
										<Users className="h-5 w-5 text-muted-foreground" />
										<span className="text-foreground">
											{availableSeats} place
											{availableSeats > 1 ? "s" : ""}{" "}
											disponible
											{availableSeats > 1 ? "s" : ""}
										</span>
									</div>
									{ride.car && (
										<div className="flex items-center gap-2">
											<Car className="h-5 w-5 text-muted-foreground" />
											<span className="text-foreground">
												{ride.car}
											</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Driver Card */}
						<Card className="border-border">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										Conducteur
									</CardTitle>
									{isOwner && (
										<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
											<Shield className="h-3 w-3" />
											vous
										</span>
									)}
								</div>
							</CardHeader>
							<CardContent className="p-6 pt-0">
								<div className="flex items-start gap-4">
									<div className="relative">
										<img
											src={
												driver.avatarUrl ||
												"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
											}
											alt={driver.prenom}
											className="h-16 w-16 rounded-full object-cover"
										/>
										{driver.identiteVerifiee && (
											<div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
												<BadgeCheck className="h-4 w-4 text-primary-foreground" />
											</div>
										)}
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-foreground">
											{driver.prenom} {driver.nom}
										</h3>
										<div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
											<span className="flex items-center gap-1">
												<Star className="h-4 w-4 fill-accent text-accent" />
												{driver.note || 0}
											</span>
											<span>
												{driver.trajetsEnTantQueConducteur ||
													0}{" "}
												trajets
											</span>
										</div>
									</div>
								</div>

								<div className="mt-4 flex flex-wrap gap-2">
									{driver.identiteVerifiee && (
										<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
											<BadgeCheck className="h-3 w-3" />
											Identite verifiee
										</span>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Booking Sidebar */}
					<div className="lg:col-span-1">
						<Card className="sticky top-24 border-border">
							<CardContent className="p-6">
								<div className="text-center">
									<span className="text-3xl font-bold text-primary">
										{ride.prix} DT
									</span>
									<span className="text-muted-foreground">
										{" "}
										/ place
									</span>
								</div>

								<Separator className="my-6" />

								{isOwner && (
									<div className="rounded-lg bg-primary/5 p-4 border border-primary/20 space-y-3">
										<div className="flex items-start gap-3">
											<Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
											<div>
												<p className="text-sm font-semibold text-foreground">
													C'est votre trajet
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													Vous ne pouvez pas reserver
													votre propre trajet.
												</p>
											</div>
										</div>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => navigate("/profile")}
										>
											Voir les reservations
										</Button>
									</div>
								)}
										<div>
											<label className="text-sm font-medium text-foreground">
												Nombre de places
											</label>
											<div className="mt-2 flex items-center justify-center gap-4">
												<button
													onClick={() =>
														setSelectedSeats(
															Math.max(
																1,
																selectedSeats -
																	1,
															),
														)
													}
													disabled={
														selectedSeats <= 1
													}
													className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50"
												>
													<Minus className="h-4 w-4" />
												</button>
												<span className="w-12 text-center text-xl font-semibold text-foreground">
													{selectedSeats}
												</span>
												<button
													onClick={() =>
														setSelectedSeats(
															Math.min(
																availableSeats,
																selectedSeats +
																	1,
															),
														)
													}
													disabled={
														selectedSeats >=
														availableSeats
													}
													className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50"
												>
													<Plus className="h-4 w-4" />
												</button>
											</div>
											<p className="mt-2 text-center text-sm text-muted-foreground">
												{availableSeats} place
												{availableSeats > 1
													? "s"
													: ""}{" "}
												disponible
												{availableSeats > 1 ? "s" : ""}
											</p>
										</div>

										<Separator className="my-6" />

										{/* Total */}
										<div className="flex items-center justify-between">
											<span className="text-foreground">
												Total
											</span>
											<span className="text-2xl font-bold text-foreground">
												{totalPrice} DT
											</span>
										</div>

										{/* Book Button */}
										<Dialog
											onOpenChange={(open) => {
												if (!open) {
													setBookingConfirmed(false);
													setPaymentSimRecorded(
														false,
													);
													setAcceptedSimulatedPayment(
														false,
													);
												}
											}}
										>
											<DialogTrigger asChild>
												<Button className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isOwner}>
													Reserver {selectedSeats}{" "}
													place
													{selectedSeats > 1
														? "s"
														: ""}
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>
														{bookingConfirmed
															? "Reservation confirmee!"
															: "Confirmer la reservation"}
													</DialogTitle>
													<DialogDescription>
														{bookingConfirmed
															? "Votre reservation a ete enregistree avec succes."
															: `${selectedSeats} place(s) pour ${totalPrice} DT — paiement simule dans l'application (aucun tiers).`}
													</DialogDescription>
												</DialogHeader>
												{bookingConfirmed ? (
													<div className="flex flex-col items-center py-6">
														<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
															<Check className="h-8 w-8 text-primary" />
														</div>
														<p className="mt-4 text-center text-sm text-muted-foreground">
															Le conducteur a ete
															notifie. Vous
															recevrez les details
															de contact par
															email.
														</p>
														<Button
															className="mt-6 w-full"
															onClick={() =>
																navigate(
																	"/profile",
																)
															}
														>
															Voir mes trajets
														</Button>
													</div>
												) : (
													<div className="space-y-4">
														<div className="rounded-lg bg-muted p-4">
															<div className="flex items-center justify-between">
																<span className="text-sm text-muted-foreground">
																	Trajet
																</span>
																<span className="text-sm font-medium text-foreground">
																	{
																		ride.depart
																	}{" "}
																	-{" "}
																	{
																		ride.arrivee
																	}
																</span>
															</div>
															<div className="mt-2 flex items-center justify-between">
																<span className="text-sm text-muted-foreground">
																	Date
																</span>
																<span className="text-sm font-medium text-foreground">
																	{ride.date}
																</span>
															</div>
															<div className="mt-2 flex items-center justify-between">
																<span className="text-sm text-muted-foreground">
																	Places
																</span>
																<span className="text-sm font-medium text-foreground">
																	{
																		selectedSeats
																	}
																</span>
															</div>
															<Separator className="my-3" />
															<div className="flex items-center justify-between">
																<span className="font-medium text-foreground">
																	Total
																</span>
																<span className="text-lg font-bold text-primary">
																	{totalPrice}{" "}
																	DT
																</span>
															</div>
														</div>

														<div className="rounded-lg border border-border p-4">
															<p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
																<CreditCard className="h-4 w-4" />
																Paiement (
																{paymentSimRecorded
																	? "OK"
																	: "pas encore fait"}
																)
															</p>
															<p className="mb-3 text-xs text-muted-foreground">
																Aucun
																prestataire de
																paiement: nous
																enregistrons
																uniquement une
																ligne de
																paiement simulée
																liée à votre
																compte pour la
																réservation.
															</p>
															<Label
																htmlFor="card-ref"
																className="text-muted-foreground"
															>
																Carte fictive
																(affichage)
															</Label>
															<Input
																id="card-ref"
																readOnly
																value="···· ···· ···· 4242"
																className="mt-1 font-mono"
															/>
															<div className="mt-3 flex items-start gap-2">
																<Checkbox
																	id="pay-terms"
																	checked={
																		acceptedSimulatedPayment
																	}
																	onCheckedChange={(
																		c,
																	) =>
																		setAcceptedSimulatedPayment(
																			c ===
																				true,
																		)
																	}
																/>
																<Label
																	htmlFor="pay-terms"
																	className="text-sm leading-snug font-normal text-muted-foreground"
																>
																	J'autorise
																	l'application
																	à
																	enregistrer
																	un paiement
																	simulé de{" "}
																	<strong>
																		{
																			totalPrice
																		}{" "}
																		DT
																	</strong>{" "}
																	pour cette
																	réservation
																	(aucun débit
																	réel).
																</Label>
															</div>
															{!paymentSimRecorded ? (
																<Button
																	type="button"
																	variant="secondary"
																	className="mt-4 w-full"
																	disabled={
																		!acceptedSimulatedPayment
																	}
																	onClick={() =>
																		setPaymentSimRecorded(
																			true,
																		)
																	}
																>
																	Enregistrer
																	le paiement
																	(simulation)
																</Button>
															) : (
																<p className="mt-4 text-xs font-medium text-emerald-700">
																	Paiement
																	simulé
																	enregistré —
																	vous pouvez
																	confirmer la
																	réservation.
																</p>
															)}
														</div>

														<Button
															className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
															disabled={
																!paymentSimRecorded
															}
															onClick={
																handleBooking
															}
														>
															Confirmer la
															reservation
														</Button>
													</div>
												)}
											</DialogContent>
										</Dialog>

										{/* Contact */}
										{!isOwner && (
											<Button
											variant="outline"
											className="mt-3 w-full"
											onClick={() => {
												if (!id || !driver?.id) return;
												navigate(
													`/messages?tripId=${encodeURIComponent(id)}&withUser=${encodeURIComponent(String(driver.id))}`,
												);
											}}
										>
											<MessageCircle className="mr-2 h-4 w-4" />
											{`Contacter ${driver.prenom}`}
										</Button>
									)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
