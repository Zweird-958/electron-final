import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/renderer/components/ui/sonner";
import { TooltipProvider } from "@/renderer/components/ui/tooltip";
import { api } from "@/lib/api";
import { AppLayout } from "@/renderer/components/layout/app-layout";
import { PosPage } from "@/renderer/pages/pos";
import { DashboardPage } from "@/renderer/pages/dashboard";
import { ProductsPage } from "@/renderer/pages/products";
import { SalesPage } from "@/renderer/pages/sales";
import { SettingsPage } from "@/renderer/pages/settings";

const applyTheme = (theme: string) => {
	const root = document.documentElement;
	root.classList.remove("dark");
	if (theme === "dark") {
		root.classList.add("dark");
	} else if (theme === "system") {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			root.classList.add("dark");
		}
	}
};

const App = () => {
	const { i18n } = useTranslation();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		api.settings.get().then((s) => {
			i18n.changeLanguage(s.language);
			applyTheme(s.theme);
			setReady(true);
		});
	}, [i18n]);

	if (!ready) return null;

	return (
		<TooltipProvider>
			<HashRouter>
				<Routes>
					<Route element={<AppLayout />}>
						<Route path="/" element={<PosPage />} />
						<Route path="/dashboard" element={<DashboardPage />} />
						<Route path="/products" element={<ProductsPage />} />
						<Route path="/sales" element={<SalesPage />} />
						<Route path="/settings" element={<SettingsPage />} />
					</Route>
				</Routes>
			</HashRouter>
			<Toaster richColors position="bottom-right" />
		</TooltipProvider>
	);
};

export default App;
