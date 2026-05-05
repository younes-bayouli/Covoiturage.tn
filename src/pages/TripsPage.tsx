import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Users, WifiOff, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
//@ts-ignore
import useFetch from "@/hooks/useFetch";
//@ts-ignore
import { Fetch } from "@/hooks/Fetch";

// ── Confirmation modal ──────────────────────────────────────────────

function ConfirmCancelModal({ trip, refund, onConfirm, onCancel, isLoading }) {
	if (!trip) return null;

	const totalRefund =
		refund.refundAmount * (trip.seats - trip.placesDisponibles);
	console.log(
		"Refund details:",
		refund.refundAmount,
		"Total refund:",
		totalRefund,
	);
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onCancel}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl mx-4">
				{/* Header */}
				<div className="mb-5 flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-5 w-5 text-destructive" />
					</div>
					<div>
						<h2 className="text-base font-medium text-foreground">
							Annuler le trajet
						</h2>
						<p className="text-sm text-muted-foreground">
							{trip.depart} → {trip.arrivee}
						</p>
					</div>
					<button
						onClick={onCancel}
						className="ml-auto text-muted-foreground hover:text-foreground"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				{/* Refund summary */}
				<div className="mb-5 space-y-3 rounded-xl bg-muted/50 p-4">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							Passagers à rembourser
						</span>
						<span className="font-medium text-foreground">
							{trip.seats - trip.placesDisponibles}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							Remboursement par passager
						</span>
						<span className="font-medium text-foreground">
							{refund.refundAmount.toFixed(2)} TND
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Politique</span>
						<span
							className={`font-medium ${refund.color === "success" ? "text-green-600" : "text-amber-600"}`}
						>
							{refund.refundPercentage}% — {refund.label}
						</span>
					</div>
					<div className="border-t border-border pt-3 flex items-center justify-between">
						<span className="text-sm font-medium text-foreground">
							Total à rembourser
						</span>
						<span className="text-lg font-semibold text-destructive">
							{totalRefund.toFixed(2)} TND
						</span>
					</div>
				</div>

				<p className="mb-5 text-sm text-muted-foreground">
					Cette action est{" "}
					<strong className="text-foreground">irréversible</strong>.
					Tous les passagers seront notifiés et remboursés
					automatiquement.
				</p>

				{/* Actions */}
				<div className="flex gap-3">
					<Button
						variant="outline"
						className="flex-1"
						onClick={onCancel}
						disabled={isLoading}
					>
						Garder le trajet
					</Button>
					<Button
						className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? "Annulation..." : "Confirmer l'annulation"}
					</Button>
				</div>
			</div>
		</div>
	);
}

export function TripsPage() {
	const {
		data: tripsData,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		"http://localhost:8080/trips",
		{},
		{
			cache: false,
			retries: 0,
			retryDelay: 1000,
			healthCheck: true,
		},
	);

	useEffect(()=>{
		refetch();
	},[])

	const [cancelingId, setCancelingId] = useState(null);
	const [cancelMessage, setCancelMessage] = useState("");
	const [modalTrip, setModalTrip] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const calculateRefund = (trip: any) => {
		if (trip.seats - trip.placesDisponibles === 0)
			return {
				refundPercentage: 0,
				refundAmount: 0,
				label: "Aucune réservation",
				color: "muted",
			};
		const hoursUntilDeparture =
			(new Date(trip.departureTime) - new Date()) / (1000 * 60 * 60);
		if (hoursUntilDeparture <= 24)
			return {
				refundPercentage: 120,
				refundAmount: (trip.prix * 120) / 100,
				label: "Annulation dans les 24h",
				color: "warning",
			};
		return {
			refundPercentage: 100,
			refundAmount: trip.prix,
			label: "Annulation avant 24h",
			color: "success",
		};
	};

	// Determine if a trip is upcoming based on departure time
	const isUpcomingTrip = (trip: any) => {
		return new Date(trip.departureTime) > new Date();
	};

	/** Backend used CANCELED vs cancelled; accept all variants for existing rows */
	const isTripCancelled = (trip: any) => {
		const s = (trip?.status ?? "").toString().toLowerCase();
		return s === "cancelled" || s === "canceled";
	};

	// Opens the modal instead of cancelling directly
	const handleCancelClick = (trip: any) => {
		setModalTrip(trip);
	};

	// Called when user confirms in the modal
	const handleConfirmCancel = async () => {
		if (!modalTrip) return;
		const refund = calculateRefund(modalTrip);
		setIsSubmitting(true);
		setCancelingId(modalTrip.id);

		try {
			const response = await Fetch(
				`http://localhost:8080/trips/${modalTrip.id}/cancel`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refund: refund.refundAmount }),
				},
				{
					healthCheck: true,
					retries: 0,
					retryDelay: 1000,
					timeout: 10000,
				},
			);
			if (response.success) {
				setCancelMessage(
					`Trajet annulé — ${refund.label} (${(refund.refundAmount * (modalTrip.seats - modalTrip.placesDisponibles)).toFixed(2)} TND remboursé)`,
				);
			} else {
				setCancelMessage(
					"Erreur lors de l'annulation. Veuillez réessayer.",
				);
			}
		} catch (err) {
			setCancelMessage("Erreur: " + err.message);
		} finally {
			setIsSubmitting(false);
			setCancelingId(null);
			setModalTrip(null);
			void refetch();
			setTimeout(() => setCancelMessage(""), 4000);
		}
	};

	const trips = tripsData !== null ? tripsData.data : [];
	const upcomingTrips =
		trips?.filter((t: any) => isUpcomingTrip(t) && !isTripCancelled(t)) || [];
	const pastTrips =
		trips?.filter((t: any) => !isUpcomingTrip(t) && !isTripCancelled(t)) || [];
	const cancelledTrips = trips?.filter((t) => isTripCancelled(t)) || [];

	return (
		<main className="min-h-screen bg-background">
			{/* Confirmation modal */}
			{modalTrip && (
				<ConfirmCancelModal
					trip={modalTrip}
					refund={calculateRefund(modalTrip)}
					onConfirm={handleConfirmCancel}
					onCancel={() => setModalTrip(null)}
					isLoading={isSubmitting}
				/>
			)}

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{!backendUp && (
					<div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
						<WifiOff className="h-4 w-4 shrink-0" />
						<p className="text-sm">
							Serveur inaccessible — les données affichées sont
							des exemples.
						</p>
					</div>
				)}

				{cancelMessage && (
					<div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
						{cancelMessage}
					</div>
				)}

				{error && !loading && backendUp && (
					<div className="mb-6 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
						<div className="flex items-center gap-3">
							<X className="h-4 w-4 text-destructive" />
							<p className="text-sm text-destructive">
								{error.message}
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() => refetch()}
						>
							Réessayer
						</Button>
					</div>
				)}

				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-medium text-foreground">
							Mes trajets
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							{loading
								? "Chargement..."
								: `${upcomingTrips.length} trajet${upcomingTrips.length !== 1 ? "s" : ""} à venir`}
						</p>
					</div>
					<Link to="/offer">
						<Button variant="outline" size="sm">
							+ Proposer un trajet
						</Button>
					</Link>
				</div>

				{loading && (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="animate-pulse rounded-lg border border-border bg-card p-6"
							>
								<div className="space-y-3">
									<div className="h-3 w-1/4 rounded bg-muted" />
									<div className="h-4 w-1/3 rounded bg-muted" />
									<div className="h-4 w-1/4 rounded bg-muted" />
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && (
					<>
						{/* ── Upcoming Trips ── */}
						<p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
							À venir
						</p>

						{upcomingTrips.length === 0 ? (
							<div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-border py-16">
								<MapPin className="h-8 w-8 text-muted-foreground" />
								<h3 className="mt-4 text-base font-medium text-foreground">
									Aucun trajet à venir
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									Vous n'avez pas de trajets programmés.
								</p>
								<Link to="/offer" className="mt-6">
									<Button size="sm">
										Proposer un trajet
									</Button>
								</Link>
							</div>
						) : (
							<div className="mb-8 space-y-3">
								{upcomingTrips.map((trip) => (
									<TripCard
										key={trip.id}
										trip={trip}
										onCancel={handleCancelClick}
										isCanceling={cancelingId === trip.id}
										calculateRefund={calculateRefund}
									/>
								))}
							</div>
						)}

						{/* ── Past Trips ── */}
						<p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Trajets passés
						</p>

						{pastTrips.length === 0 ? (
							<div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-border py-16">
								<Clock className="h-8 w-8 text-muted-foreground" />
								<h3 className="mt-4 text-base font-medium text-foreground">
									Aucun trajet passé
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									Vos trajets complétés apparaîtront ici.
								</p>
							</div>
						) : (
							<div className="mb-8 space-y-3">
								{pastTrips.map((trip) => (
									<TripCard
										key={trip.id}
										trip={trip}
										onCancel={null}
										isCanceling={false}
										calculateRefund={calculateRefund}
										isPast
									/>
								))}
							</div>
						)}

						{/* ── Cancelled Trips ── */}
						{cancelledTrips.length > 0 && (
							<>
								<p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Trajets annulés
								</p>
								<div className="space-y-3">
									{cancelledTrips.map((trip) => (
										<TripCard
											key={trip.id}
											trip={trip}
											onCancel={null}
											isCanceling={false}
											calculateRefund={calculateRefund}
											isCancelled
										/>
									))}
								</div>
							</>
						)}
					</>
				)}
			</div>
		</main>
	);
}

function TripCard({
	trip,
	onCancel,
	isCanceling,
	calculateRefund,
	isPast = false,
	isCancelled = false,
}) {
	const departure = new Date(trip.departureTime);
	const arrival = new Date(trip.arrivalTime);
	const refund = calculateRefund(trip);
	const seatsLeft = trip.placesDisponibles;

	const fmt = (d) =>
		d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
	const fmtDate = (d) =>
		d.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});

	return (
		<div
			className={`rounded-r-lg border border-l-[3px] border-border bg-card p-5 transition-all hover:shadow-sm ${
				isCancelled
					? "border-l-destructive opacity-75"
					: isPast
						? "border-l-border opacity-75"
						: "border-l-primary"
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="mb-3 flex items-center gap-2">
						<span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
							Trajet #{trip.id}
						</span>
						{isCancelled ? (
							<span className="rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs text-destructive">
								Annulé
							</span>
						) : isPast ? (
							<span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs text-green-700">
								Complété
							</span>
						) : (
							<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
								À venir
							</span>
						)}
						{!isPast && !isCancelled && seatsLeft === 0 && (
							<span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs text-orange-700">
								Complet
							</span>
						)}
					</div>

					<div className="flex items-stretch gap-3">
						<div className="flex flex-col items-center pt-1">
							<div
								className={`h-2.5 w-2.5 rounded-full border-2 bg-card ${
									isCancelled
										? "border-destructive"
										: isPast
											? "border-muted-foreground"
											: "border-primary"
								}`}
							/>
							<div className="my-1 w-px flex-1 bg-border" />
							<div
								className={`h-2.5 w-2.5 rounded-full ${
									isCancelled
										? "bg-destructive"
										: isPast
											? "bg-muted-foreground"
											: "bg-primary"
								}`}
							/>
						</div>
						<div className="flex-1">
							<div className="flex items-baseline justify-between">
								<p className="text-sm font-medium text-foreground">
									{trip.depart}
								</p>
								<span className="text-xs text-muted-foreground">
									{fmt(departure)}
								</span>
							</div>
							<div className="my-2" />
							<div className="flex items-baseline justify-between">
								<p className="text-sm font-medium text-foreground">
									{trip.arrivee}
								</p>
								<span className="text-xs text-muted-foreground">
									{fmt(arrival)}
								</span>
							</div>
						</div>
					</div>

					<div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Users className="h-3.5 w-3.5" />
							{trip.seats - trip.placesDisponibles}/{trip.seats}{" "}
							places réservées
						</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							{fmtDate(departure)}
						</span>
					</div>
				</div>

				<div className="shrink-0 text-right">
					<p
						className={`text-xl font-medium ${
							isCancelled || isPast
								? "text-muted-foreground"
								: "text-foreground"
						}`}
					>
						{trip.prix} TND
					</p>
					{!isPast && !isCancelled && refund.refundPercentage > 0 && (
						<p
							className={`mt-1 text-xs ${refund.color === "success" ? "text-green-600" : "text-amber-600"}`}
						>
							{refund.refundPercentage}% remboursable
						</p>
					)}
					{isPast && (
						<p className="mt-1 text-xs text-green-600">
							{(
								(trip.seats - trip.placesDisponibles) *
								trip.prix
							).toFixed(2)}{" "}
							TND gagné
						</p>
					)}
					{isCancelled && (
						<p className="mt-1 text-xs text-destructive">Annulé</p>
					)}
				</div>
			</div>

			{!isPast && !isCancelled && onCancel && (
				<div className="mt-4 border-t border-border pt-4">
					<button
						onClick={() => onCancel(trip)}
						disabled={isCanceling}
						className="w-full rounded-md bg-destructive/10 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
					>
						{isCanceling ? "Annulation..." : "Annuler le trajet"}
					</button>
				</div>
			)}
		</div>
	);
}
