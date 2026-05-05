"use client";

import { Link, useNavigate } from "react-router-dom";
import {
	Star,
	BadgeCheck,
	Phone,
	MapPin,
	Calendar,
	Car,
	PlusCircle,
	ChevronRight,
	LogOut,
	ArrowRight,
	Settings,
	Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
// @ts-ignore
import useFetch from "@/hooks/useFetch";

const FAKE_UPCOMING_TRIPS = [
	{
		id: 1,
		departure: "Tunis",
		arrival: "Sousse",
		departureTime: "2026-04-25T08:00:00",
		price: 25,
		seats: 4,
		reservations: 2,
		status: "upcoming",
	},
	{
		id: 3,
		departure: "Kasserine",
		arrival: "Tunis",
		departureTime: "2026-04-24T10:00:00",
		price: 40,
		seats: 5,
		reservations: 1,
		status: "upcoming",
	},
];

/** Same shape as GET /reservations (ApiResponse.data items) for filters + preview cards */
const FAKE_UPCOMING_RESERVATIONS = [
	{
		id: 1,
		status: "confirmed",
		price: 25,
		trip: {
			id: 101,
			depart: "Tunis",
			arrivee: "Sousse",
			departureTime: "2026-12-25T08:00:00",
			owner: { prenom: "Ahmed", nom: "Ben Ali" },
		},
	},
	{
		id: 3,
		status: "confirmed",
		price: 40,
		trip: {
			id: 103,
			depart: "Kasserine",
			arrivee: "Tunis",
			departureTime: "2026-12-24T10:00:00",
			owner: { prenom: "Mohamed", nom: "Trabelsi" },
		},
	},
];

const FAKE_MESSAGES = [
	{ id: 1, unread: 1 },
	{ id: 2, unread: 2 },
];

export function ProfilePage() {
	const { logout, utilisateur } = useAuth();
	const navigate = useNavigate();

	const { data: tripsData } = useFetch(
		"http://localhost:8080/trips",
		{},
		{
			cache: false,
			retries: 0,
			healthCheck: true,
			fakeData: FAKE_UPCOMING_TRIPS,
		},
	);
	const { data: reservationsData } = useFetch(
		utilisateur?.id ? "http://localhost:8080/reservations" : "",
		{},
		{
			cache: false,
			retries: 0,
			healthCheck: true,
			fakeData: FAKE_UPCOMING_RESERVATIONS,
		},
	);
	const { data: messages } = useFetch(
		"http://localhost:8080/messages",
		{},
		{
			cache: false,
			retries: 1,
			healthCheck: true,
			fakeData: FAKE_MESSAGES,
		},
	);

	const u = utilisateur;
	const initials = u
		? `${u.prenom?.[0] ?? ""}${u.nom?.[0] ?? ""}`.toUpperCase()
		: "?";
	const fmt = (d: any) =>
		new Date(d).toLocaleString("fr-FR", {
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});

	const isUpcoming = (trip: any) => {
		if (!trip?.departureTime) return false;
		return new Date(trip.departureTime) > new Date();
	};

	const isTripCancelled = (trip: any) => {
		const s = (trip?.status ?? "").toString().toLowerCase();
		return s === "cancelled" || s === "canceled";
	};

	const isUpcomingReservation = (r: any) => {
		const trip = r.trip;
		if (!trip?.departureTime) return false;
		return new Date(trip.departureTime) > new Date();
	};

	const reservationPreview = (r: any) => {
		const trip = r.trip;
		const owner = trip?.owner;
		const driver =
			owner != null
				? `${owner.prenom ?? ""} ${owner.nom ?? ""}`.trim() || "—"
				: (r.driver as string) ?? "—";
		return {
			depart: trip?.depart ?? r.departure ?? "—",
			arrivee: trip?.arrivee ?? r.arrival ?? "—",
			departureTime: trip?.departureTime ?? r.departureTime,
			price: r.price ?? trip?.prix ?? 0,
			driver,
		};
	};

	const trips = tripsData !== null ? tripsData.data : [];
	const reservations = reservationsData !== null ? reservationsData.data : [];

	const upcomingTrips =
		trips
			?.filter((t: any) => isUpcoming(t) && !isTripCancelled(t))
			.slice(0, 3) || [];
	const confirmedReservations =
		reservations?.filter((r: any) => r.status === "confirmed") || [];
	const upcomingReservationsList = confirmedReservations
		.filter(isUpcomingReservation)
		.slice(0, 3);
	const recentReservationsFallback = [...confirmedReservations]
		.filter((r: any) => r.trip?.departureTime)
		.sort(
			(a: any, b: any) =>
				new Date(b.trip.departureTime).getTime() -
				new Date(a.trip.departureTime).getTime(),
		)
		.slice(0, 3);
	const upcomingReservations =
		upcomingReservationsList.length > 0
			? upcomingReservationsList
			: recentReservationsFallback;
	const unreadCount = 3;

	/*messages?.reduce((sum: number, c: any) => sum + (c.unread ?? 0), 0) ??
		0;*/

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
				<div className="grid gap-6 lg:grid-cols-[320px_1fr]">
					{/* ── Left sidebar ── */}
					<div className="flex flex-col gap-5">
						{/* Profile card */}
						<div className="rounded-2xl border border-border bg-card p-7">
							<div className="flex flex-col items-center gap-4 text-center">
								{/* Avatar */}
								<div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-medium text-blue-700">
									{initials}
								</div>

								<div>
									<p className="text-xl font-medium text-foreground">
										{u ? `${u.prenom} ${u.nom}` : "—"}
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										{u?.email}
									</p>
								</div>

								{/* Meta */}
								<div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
									<span className="flex items-center gap-1.5">
										<Star className="h-4 w-4" />
										{u?.note ?? "—"}
									</span>
									<span className="flex items-center gap-1.5">
										<MapPin className="h-4 w-4" />
										{u?.ville ?? "—"}
									</span>
									<span className="flex items-center gap-1.5">
										<Calendar className="h-4 w-4" />
										Membre depuis{" "}
										{u
											? new Date(
													u.membreDepuis,
												).toLocaleDateString("fr-FR", {
													month: "short",
													year: "numeric",
												})
											: "—"}
									</span>
								</div>

								{/* Badges */}
								<div className="flex flex-wrap justify-center gap-2">
									{u?.identiteVerifiee && (
										<span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
											<BadgeCheck className="h-3.5 w-3.5" />
											Identité vérifiée
										</span>
									)}
									{u?.telephoneVerifie && (
										<span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700">
											<Phone className="h-3.5 w-3.5" />
											Tél. vérifié
										</span>
									)}
								</div>

								{/* Action buttons */}
								<div className="flex w-full gap-2">
									<Link to="/modifier" className="flex-1">
										<Button
											variant="outline"
											size="sm"
											className="w-full"
										>
											<Settings className="mr-1.5 h-4 w-4" />
											Modifier
										</Button>
									</Link>
									<Button
										variant="outline"
										size="sm"
										className="flex-1 text-destructive hover:text-destructive"
										onClick={logout}
									>
										<LogOut className="mr-1.5 h-4 w-4" />
										Quitter
									</Button>
								</div>

								{/* Notifications button */}
								<Link to="/messages" className="w-full">
									<Button
										variant="outline"
										size="sm"
										className="relative w-full"
									>
										<Bell className="mr-1.5 h-4 w-4" />
										Messages
										{unreadCount > 0 && (
											<span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
												{unreadCount}
											</span>
										)}
									</Button>
								</Link>
							</div>

							{/* Stats */}
							<div className="mt-6 space-y-3 border-t border-border pt-6">
								{[
									{
										label: "Trajets effectués",
										value: u?.trajetsEffectues ?? 0,
									},
									{
										label: "Conducteur",
										value:
											u?.trajetsEnTantQueConducteur ?? 0,
									},
									{
										label: "Passager",
										value: u?.trajetsEnTantQuePassager ?? 0,
									},
								].map((s) => (
									<div
										key={s.label}
										className="flex items-center justify-between"
									>
										<p className="text-sm text-muted-foreground">
											{s.label}
										</p>
										<p className="text-base font-medium text-foreground">
											{s.value}
										</p>
									</div>
								))}
							</div>
						</div>

						{/* Quick actions */}
						<div className="flex flex-col gap-3">
							{[
								{
									to: "/offer",
									icon: PlusCircle,
									label: "Proposer un trajet",
									sub: "Partagez votre prochain voyage",
								},
								{
									to: "/search",
									icon: Car,
									label: "Trouver un trajet",
									sub: "Rechercher des covoiturages",
								},
							].map(({ to, icon: Icon, label, sub }) => (
								<Link key={to} to={to}>
									<div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:shadow-sm">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
											<Icon className="h-5 w-5 text-muted-foreground" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-medium text-foreground">
												{label}
											</p>
											<p className="text-xs text-muted-foreground">
												{sub}
											</p>
										</div>
										<ChevronRight className="h-4 w-4 text-muted-foreground" />
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* ── Right content ── */}
					<div className="flex flex-col gap-5">
						{/* Trips */}
						<div className="rounded-2xl border border-border bg-card p-7">
							<div className="mb-5 flex items-center justify-between">
								<p className="text-base font-medium text-foreground">
									Mes trajets à venir
								</p>
								<Link
									to="/trips"
									className="text-sm text-blue-600 hover:underline"
								>
									Voir tous
								</Link>
							</div>
							{upcomingTrips.length === 0 ? (
								<div className="flex flex-col items-center py-10 text-center">
									<p className="text-sm text-muted-foreground">
										Aucun trajet à venir
									</p>
									<Link to="/offer" className="mt-4">
										<Button size="sm" variant="outline">
											<PlusCircle className="mr-1.5 h-4 w-4" />
											Proposer un trajet
										</Button>
									</Link>
								</div>
							) : (
								<div className="space-y-3">
									{upcomingTrips.map((trip: any) => (
										<div
											key={trip.id}
											className="bg-muted/40 px-4 py-3.5"
											style={{
												borderLeft: "3px solid #378ADD",
												borderRadius: "0 10px 10px 0",
											}}
										>
											<div className="flex items-center justify-between">
												<p className="text-base font-medium text-foreground">
													{trip.depart} →{" "}
													{trip.arrivee}
												</p>
												<p className="text-base font-medium text-foreground">
													{trip.prix} TND
												</p>
											</div>
											<div className="mt-1.5 flex items-center justify-between">
												<p className="text-sm text-muted-foreground">
													{fmt(trip.departureTime)}
												</p>
												<p className="text-sm text-muted-foreground">
													{trip.reservations}/
													{trip.seats} places
												</p>
											</div>
										</div>
									))}
									<Link to="/trips">
										<Button
											variant="outline"
											className="mt-3 w-full"
										>
											Voir tous{" "}
											<ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</Link>
								</div>
							)}
						</div>

						{/* Reservations */}
						<div className="rounded-2xl border border-border bg-card p-7">
							<div className="mb-5 flex items-center justify-between">
								<p className="text-base font-medium text-foreground">
									Mes réservations
								</p>
								<Link
									to="/reservations"
									className="text-sm text-blue-600 hover:underline"
								>
									Voir tous
								</Link>
							</div>
							{upcomingReservations.length === 0 ? (
								<div className="flex flex-col items-center py-10 text-center">
									<p className="text-sm text-muted-foreground">
										Aucune réservation
									</p>
									<Link to="/search" className="mt-4">
										<Button size="sm" variant="outline">
											<Car className="mr-1.5 h-4 w-4" />
											Chercher un trajet
										</Button>
									</Link>
								</div>
							) : (
								<div className="space-y-3">
									{upcomingReservations.map((r: any) => {
										const v = reservationPreview(r);
										return (
										<div
											key={r.id}
											className="bg-muted/40 px-4 py-3.5"
											style={{
												borderLeft: "3px solid #1D9E75",
												borderRadius: "0 10px 10px 0",
											}}
										>
											<div className="flex items-center justify-between">
												<p className="text-base font-medium text-foreground">
													{v.depart} → {v.arrivee}
												</p>
												<p className="text-base font-medium text-foreground">
													{v.price} TND
												</p>
											</div>
											<p className="mt-1.5 text-sm text-muted-foreground">
												{v.driver} ·{" "}
												{fmt(v.departureTime)}
											</p>
										</div>
									);
									})}
									<Link to="/reservations">
										<Button
											variant="outline"
											className="mt-3 w-full"
										>
											Voir tous{" "}
											<ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
