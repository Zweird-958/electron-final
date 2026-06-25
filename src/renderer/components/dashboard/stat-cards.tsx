import { TrendingUp, TrendingDown, ShoppingBag, Package } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/renderer/components/ui/card";
import { useTranslation } from "react-i18next";
import type { DashboardData } from "@/types";

type Props = {
	data: DashboardData;
};

export const DashboardStatCards = ({ data }: Props) => {
	const { t } = useTranslation();

	const revenueDiff = data.today.revenue - data.yesterday.revenue;
	const salesDiff = data.today.salesCount - data.yesterday.salesCount;

	return (
		<div className="grid grid-cols-3 gap-4">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<TrendingUp className="size-4" />
						{t("dashboard.todayRevenue")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold">
						{data.today.revenue.toFixed(2)} €
					</p>
					<div className="mt-1 flex items-center gap-1 text-xs">
						{revenueDiff >= 0 ? (
							<TrendingUp className="size-3 text-green-600" />
						) : (
							<TrendingDown className="size-3 text-red-600" />
						)}
						<span
							className={revenueDiff >= 0 ? "text-green-600" : "text-red-600"}
						>
							{revenueDiff >= 0 ? "+" : ""}
							{revenueDiff.toFixed(2)} €
						</span>
						<span className="text-muted-foreground">
							{t("dashboard.vsYesterday")}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<ShoppingBag className="size-4" />
						{t("dashboard.todaySales")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold">{data.today.salesCount}</p>
					<div className="mt-1 flex items-center gap-1 text-xs">
						{salesDiff >= 0 ? (
							<TrendingUp className="size-3 text-green-600" />
						) : (
							<TrendingDown className="size-3 text-red-600" />
						)}
						<span
							className={salesDiff >= 0 ? "text-green-600" : "text-red-600"}
						>
							{salesDiff >= 0 ? "+" : ""}
							{salesDiff}
						</span>
						<span className="text-muted-foreground">
							{t("dashboard.vsYesterday")}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<Package className="size-4" />
						{t("dashboard.todayItems")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold">{data.today.itemsSold}</p>
				</CardContent>
			</Card>
		</div>
	);
};
