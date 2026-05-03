import { Navigation } from "./Navigation";
import { Sidebar } from "./AdminSidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<Sidebar isOpen={sidebarOpen} />

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Admin Header */}
				<header className="border-b border-border bg-background/95 backdrop-blur">
					<div className="flex items-center justify-between px-6 py-4">
						<button
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="rounded-lg p-2 hover:bg-muted lg:hidden"
						>
							{sidebarOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</button>
						<div className="flex-1" />
						<div className="text-sm text-muted-foreground">
							Admin Panel
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto">{children}</main>
			</div>
		</div>
	);
}
