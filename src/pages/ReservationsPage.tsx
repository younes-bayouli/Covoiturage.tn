import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Users, WifiOff, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
//@ts-ignore
import useFetch from "@/hooks/useFetch";
//@ts-ignore
import { Fetch } from "@/hooks/Fetch";

const FAKE_RESERVATIONS_DATA = [
	{
		id: 1,
		tripId: 101,
		departure: "Tunis",
		arrival: "Sousse",
		departureTime: "2026-04-25T08:00:00",
		arrivalTime: "2026-04-25T10:30:00",
		driver: "Ahmed Ben Ali",
		price: 25,
		status: "upcoming",
	},
	{
		id: 2,
		tripId: 102,
		departure: "Sfax",
		arrival: "Gafsa",
		departureTime: "2026-04-20T14:00:00",
		arrivalTime: "2026-04-20T17:00:00",
		driver: "Fatima Karray",
		price: 35,
		status: "completed",
	},
	{
		id: 3,
		tripId: 103,
		departure: "Kasserine",
		arrival: "Tunis",
		departureTime: "2026-04-24T10:00:00",
		arrivalTime: "2026-04-24T15:00:00",
		driver: "Mohamed Trabelsi",
		price: 40,
		status: "upcoming",
	},
];

// ─── Modal ────────────────────────────────────────────────────────────────────

function CancelConfirmModal({
	reservation,
	refund,
	onConfirm,
	onClose,
	isLoading,
}) {
	if (!reservation) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="mb-5 flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-5 w-5 text-destructive" />
					</div>
					<div>
						<h2 className="text-base font-medium text-foreground">
							Annuler la réservation
						</h2>
						<p className="text-sm text-muted-foreground">
							{reservation.trip?.depart ?? reservation.departure} →{" "}
							{reservation.trip?.arrivee ?? reservation.arrival}
						</p>
					</div>
					<button
						onClick={onClose}
						className="ml-auto text-muted-foreground hover:text-foreground"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Refund summary */}
				<div className="mb-5 space-y-3 rounded-xl bg-muted/50 p-4">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Trajet</span>
						<span className="font-medium text-foreground">
							Réservation #{reservation.id}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Prix payé</span>
						<span className="font-medium text-foreground">
							{reservation.price.toFixed(2)} TND
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Politique</span>
						<span
							className={`font-medium ${
								refund.color === "success"
									? "text-green-600"
									: "text-amber-600"
							}`}
						>
							{refund.refundPercentage}% — {refund.label}
						</span>
					</div>
					<div className="flex items-center justify-between border-t border-border pt-3">
						<span className="text-sm font-medium text-foreground">
							Montant remboursé
						</span>
						<span className="text-lg font-semibold text-green-600">
							{refund.refundAmount.toFixed(2)} TND
						</span>
					</div>
				</div>

				<p className="mb-5 text-sm text-muted-foreground">
					Cette action est{" "}
					<strong className="text-foreground">irréversible</strong>.
					Votre remboursement sera traité automatiquement.
				</p>

				{/* Actions */}
				<div className="flex gap-3">
					<Button
						variant="outline"
						className="flex-1"
						onClick={onClose}
						disabled={isLoading}
					>
						Garder la réservation
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReservationsPage() {
	const {
		data: reservationsData,
		loading,
		error,
		backendUp,
		refetch,
	} = useFetch(
		"http://localhost:8080/reservations",
		{},
		{
			cache: false,
			retries: 0,
			retryDelay: 1000,
			healthCheck: true,
			fakeData: FAKE_RESERVATIONS_DATA,
		},
	);

	const [cancelingReservation, setCancelingReservation] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [cancelMessage, setCancelMessage] = useState("");

	const calculateRefund = (reservation: any) => {
		const departureRaw =
			reservation.trip?.departureTime ?? reservation.departureTime;
		const paid = reservation.price ?? 0;
		if (!departureRaw) {
			return {
				refundPercentage: 100,
				refundAmount: paid,
				label: "Remboursement intégral (pas d'info horaire)",
				color: "success",
			};
		}
		const departureTime = new Date(departureRaw);
		const now = new Date();
		const hoursUntilDeparture =
			(departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

		// Alignée au backend : >= 24h → 100 %, sinon 90 % (pénalité 10 %)
		if (hoursUntilDeparture >= 24) {
			return {
				refundPercentage: 100,
				refundAmount: paid,
				label: "Au moins 24h avant le trajet — remboursement intégral",
				color: "success",
			};
		}
		return {
			refundPercentage: 90,
			refundAmount: Math.round(paid * 90) / 100,
			label: "Moins de 24h avant le trajet — pénalité 10%",
			color: "warning",
		};
	};

	useEffect(() => {
		refetch();
	}, []);

	const handleCancelClick = (reservation: any) => {
		setCancelingReservation(reservation);
	};

	const handleConfirmCancel = async () => {
		if (!cancelingReservation) return;
		const refund = calculateRefund(cancelingReservation);
		setIsLoading(true);
		try {
			const response = await Fetch(
				`http://localhost:8080/reservations/${cancelingReservation.id}/cancel`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
				},
			);
			/*
			if (response.success) {
				setCancelMessage(
					`Réservation annulée — ${refund.label} (${refund.refundAmount.toFixed(2)} TND remboursé)`,
				);
				refetch();
			} else {
				setCancelMessage(
					"Erreur lors de l'annulation. Veuillez réessayer.",
				);
			}*/
		} catch (err) {
			setCancelMessage("Erreur: " + err.message);
		} finally {
			setIsLoading(false);
			setCancelingReservation(null);
			refetch();
			setTimeout(() => setCancelMessage(""), 3000);
		}
	};
	const isUpcomingReservation = (trip: any) => {
		return new Date(trip.departureTime) > new Date();
	};

	const reservations = reservationsData !== null ? reservationsData.data : [];

	const upcomingReservations =
		reservations?.filter(
			(r: any) =>
				r.status === "confirmed" && isUpcomingReservation(r.trip),
		) || [];
	const pastReservations =
		reservations?.filter(
			(r: any) =>
				r.status === "confirmed" && !isUpcomingReservation(r.trip),
		) || [];

	return (
		<main className="min-h-screen bg-background">
			{/* Cancel confirmation modal */}
			{cancelingReservation && (
				<CancelConfirmModal
					reservation={cancelingReservation}
					refund={calculateRefund(cancelingReservation)}
					onConfirm={handleConfirmCancel}
					onClose={() => setCancelingReservation(null)}
					isLoading={isLoading}
				/>
			)}

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Backend offline banner */}
				{!backendUp && (
					<div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
						<WifiOff className="h-4 w-4 shrink-0" />
						<p className="text-sm">
							Serveur inaccessible — les données affichées sont
							des exemples.
						</p>
					</div>
				)}

				{/* Cancellation message */}
				{cancelMessage && (
					<div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
						{cancelMessage}
					</div>
				)}

				{/* Error */}
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

				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-medium text-foreground">
							Mes réservations
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							{loading
								? "Chargement..."
								: `${upcomingReservations.length} réservation${upcomingReservations.length !== 1 ? "s" : ""} à venir`}
						</p>
					</div>
					<Link to="/search">
						<Button variant="outline" size="sm">
							+ Chercher un trajet
						</Button>
					</Link>
				</div>

				{/* Loading skeletons */}
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

				{/* Upcoming */}
				{!loading && (
					<>
						<p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
							À venir
						</p>

						{upcomingReservations.length === 0 ? (
							<div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-border py-16">
								<MapPin className="h-8 w-8 text-muted-foreground" />
								<h3 className="mt-4 text-base font-medium text-foreground">
									Aucune réservation à venir
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									Vous n'avez pas de trajets programmés.
								</p>
								<Link to="/search" className="mt-6">
									<Button size="sm">
										Chercher un trajet
									</Button>
								</Link>
							</div>
						) : (
							<div className="mb-8 space-y-3">
								{upcomingReservations.map((r) => (
									<ReservationCard
										key={r.id}
										reservation={r}
										onCancel={handleCancelClick}
										calculateRefund={calculateRefund}
									/>
								))}
							</div>
						)}

						{/* Past */}
						<p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Réservations passées
						</p>

						{pastReservations.length === 0 ? (
							<div className="flex flex-col items-center justify-center rounded-lg border border-border py-16">
								<Clock className="h-8 w-8 text-muted-foreground" />
								<h3 className="mt-4 text-base font-medium text-foreground">
									Aucune réservation passée
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									Vos réservations complétées apparaîtront
									ici.
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{pastReservations.map((r) => (
									<ReservationCard
										key={r.id}
										reservation={r}
										onCancel={null}
										calculateRefund={calculateRefund}
										isPast
									/>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</main>
	);
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ReservationCard({
	reservation,
	onCancel,
	calculateRefund,
	isPast = false,
}) {
	const departure = new Date(reservation.trip.departureTime);
	const arrival = new Date(reservation.trip.arrivalTime);
	const refund = calculateRefund(reservation);
	console.log("Refund for reservation", reservation, ":", refund);

	const fmt = (date: any) =>
		date.toLocaleTimeString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	const fmtDate = (date: any) =>
		date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});

	return (
		<div
			className={`rounded-r-lg border border-l-[3px] border-border bg-card p-5 transition-all hover:shadow-sm ${
				isPast ? "border-l-border opacity-75" : "border-l-primary"
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					{/* Badges */}
					<div className="mb-3 flex items-center gap-2">
						<span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
							Réservation #{reservation.id}
						</span>
						{isPast ? (
							<span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs text-green-700">
								Complété
							</span>
						) : (
							<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
								À venir
							</span>
						)}
					</div>

					{/* Route */}
					<div className="flex items-stretch gap-3">
						<div className="flex flex-col items-center pt-1">
							<div
								className={`h-2.5 w-2.5 rounded-full border-2 bg-card ${
									isPast
										? "border-muted-foreground"
										: "border-primary"
								}`}
							/>
							<div className="my-1 w-px flex-1 bg-border" />
							<div
								className={`h-2.5 w-2.5 rounded-full ${
									isPast
										? "bg-muted-foreground"
										: "bg-primary"
								}`}
							/>
						</div>
						<div className="flex-1">
							<div className="flex items-baseline justify-between">
								<p className="text-sm font-medium text-foreground">
									{reservation.trip.depart}
								</p>
								<span className="text-xs text-muted-foreground">
									{fmt(departure)}
								</span>
							</div>
							<div className="my-2" />
							<div className="flex items-baseline justify-between">
								<p className="text-sm font-medium text-foreground">
									{reservation.trip.arrivee}
								</p>
								<span className="text-xs text-muted-foreground">
									{fmt(arrival)}
								</span>
							</div>
						</div>
					</div>

					{/* Meta */}
					<div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Users className="h-3.5 w-3.5" />
							{reservation.trip.owner.nom +
								" " +
								reservation.trip.owner.prenom}
						</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							{fmtDate(departure)}
						</span>
					</div>
				</div>

				{/* Price */}
				<div className="shrink-0 text-right">
					<p
						className={`text-xl font-medium ${isPast ? "text-muted-foreground" : "text-foreground"}`}
					>
						{reservation.price} TND
					</p>
					{!isPast && (
						<p
							className={`mt-1 text-xs ${refund.color === "success" ? "text-green-600" : "text-amber-600"}`}
						>
							{refund.refundPercentage}% remboursable
						</p>
					)}
					{isPast && (
						<p className="mt-1 text-xs text-green-600">
							Trajet complété
						</p>
					)}
				</div>
			</div>

			{/* Cancel button */}
			{!isPast && onCancel && (
				<div className="mt-4 border-t border-border pt-4">
					<button
						onClick={() => onCancel(reservation)}
						className="w-full rounded-md bg-destructive/10 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
					>
						Annuler la réservation
					</button>
				</div>
			)}
		</div>
	);
}
