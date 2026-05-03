import { Link, useLocation } from "react-router-dom";
import {
	Users,
	BarChart3,
	MessageSquare,
	Settings,
	LogOut,
	History,
	ClipboardList,
	Database,
} from "lucide-react";
import { useAuth } from "../context/authContext";

interface SidebarProps {
	isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
	const location = useLocation();
	const { logout } = useAuth();

	const menuItems = [
		{
			label: "Utilisateurs",
			href: "/admin/users",
			icon: Users,
		},
		{
			label: "Voyages",
			href: "/admin/voyages",
			icon: BarChart3,
		},
		{
			label: "Messages",
			href: "/admin/messages",
			icon: MessageSquare,
		},
		{
			label: "Journal d'activité",
			href: "/admin/activity-logs",
			icon: History, // Évoque le temps et la traçabilité
		},
		{
			label: "Activité Admin",
			href: "/admin/admin-activity-logs",
			icon: Database, // Évoque le temps et la traçabilité
		},
	];

	return (
		<aside
			className={`${
				isOpen ? "translate-x-0" : "-translate-x-full"
			} fixed left-0 top-0 z-40 h-screen w-64 bg-muted/50 border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static`}
		>
			<div className="flex flex-col h-full">
				{/* Logo */}
				<div className="px-6 py-4 border-b border-border">
					<h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
						Admin
					</h1>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = location.pathname === item.href;

						return (
							<Link
								key={item.href}
								to={item.href}
								className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								<Icon className="h-5 w-5" />
								<span className="text-sm font-medium">
									{item.label}
								</span>
							</Link>
						);
					})}
				</nav>

				{/* Logout */}
				<div className="border-t border-border px-4 py-4">
					<button
						onClick={logout}
						className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<LogOut className="h-5 w-5" />
						<span className="text-sm font-medium">Déconnexion</span>
					</button>
				</div>
			</div>
		</aside>
	);
}
