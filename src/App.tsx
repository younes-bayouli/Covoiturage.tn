import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { RideDetailPage } from "./pages/RideDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OfferPage } from "./pages/OfferPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthProvider } from "./context/authContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useLocation } from "react-router-dom";
import { ModifierPage } from "./pages/ModifyPage";
import { TripsPage } from "./pages/TripsPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { GestionUtilisateurs } from "./pages/admin/GestionUtilisateurs";
import { AdminLayout } from "./components/AdminLayout";
import { GestionVoyages } from "./pages/admin/GestionVoyages";
import { UserDetails } from "./pages/admin/UserDetails";
import { VoyageDetail } from "./pages/admin/VoyageDetail";
import { ActivityLogs } from "./pages/admin/ActivityLogs";
import { AdminsActivity } from "./pages/admin/AdminsActivity";

export default function App() {
	const location = useLocation();
	const pagesWithoutNav = ["/login", "/signin"];
	const isAdminPage = location.pathname.startsWith("/admin");
	const showNav =
		!pagesWithoutNav.includes(location.pathname) && !isAdminPage;

	return (
		<AuthProvider>
			<div className="min-h-screen bg-background">
				{showNav && <Navigation />}
				<Routes>
					{/* Public Routes */}
					<Route path="/" element={<HomePage />} />
					<Route path="/search" element={<SearchPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signin" element={<RegisterPage />} />
					<Route path="/trips" element={<TripsPage />} />

					{/* Protected User Routes */}
					<Route
						path="/offer"
						element={
							<ProtectedRoute>
								<OfferPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/reservations"
						element={
							<ProtectedRoute>
								<ReservationsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/modifier"
						element={
							<ProtectedRoute>
								<ModifierPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/voyage/:id"
						element={
							<ProtectedRoute>
								<RideDetailPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/messages"
						element={
							<ProtectedRoute>
								<MessagesPage />
							</ProtectedRoute>
						}
					/>

					{/* Admin Routes */}
					<Route
						path="/admin/users"
						element={
							<ProtectedRoute requiredRole="ADMIN">
								<AdminLayout>
									<GestionUtilisateurs />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/users/:id"
						element={
							<ProtectedRoute requiredRole="ADMIN">
								<AdminLayout>
									<UserDetails />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/voyages"
						element={
							<ProtectedRoute requiredRole="ADMIN">
								<AdminLayout>
									<GestionVoyages />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/trips/:id"
						element={
							<ProtectedRoute requiredRole="ADMIN">
								<AdminLayout>
									<VoyageDetail />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/activity-logs"
						element={
							<ProtectedRoute requiredRole="ADMIN">
								<AdminLayout>
									<ActivityLogs />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/admin-activity-logs"
						element={
							<ProtectedRoute requiredRole="ADMIN">
								<AdminLayout>
									<AdminsActivity />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
				</Routes>

				{/* Footer - Hide on Admin Pages */}
				{!isAdminPage && (
					<footer className="border-t border-border bg-muted/30 py-1">
						<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
							<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
								<p className="text-sm text-muted-foreground">
									2026 Covoiturage.tn. Tous droits reserves.
								</p>
								<div className="flex gap-6">
									<a
										href="#"
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Conditions
									</a>
									<a
										href="#"
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Confidentialite
									</a>
									<a
										href="#"
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Contact
									</a>
								</div>
							</div>
						</div>
					</footer>
				)}
			</div>
		</AuthProvider>
	);
}
