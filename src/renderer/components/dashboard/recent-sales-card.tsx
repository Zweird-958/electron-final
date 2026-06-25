import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/renderer/components/ui/card";
import { useTranslation } from "react-i18next";

type Props = {
	sales: {
		id: number;
		total: number;
		items_count: number;
		created_at: string;
	}[];
	onSelect: (id: number) => void;
};

export const RecentSalesCard = ({ sales, onSelect }: Props) => {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-medium">
					{t("dashboard.recentSales")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{sales.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("dashboard.noData")}
					</p>
				) : (
					<div className="space-y-2">
						{sales.map((s) => (
							<button
								key={s.id}
								onClick={() => onSelect(s.id)}
								className="flex w-full items-center justify-between rounded-lg border border-border p-2 text-sm transition-colors hover:bg-accent"
							>
								<div>
									<span className="font-mono text-xs text-muted-foreground">
										#{s.id}
									</span>
									<span className="ml-2">
										{s.items_count} {t("sales.items")}
									</span>
								</div>
								<span className="font-semibold">{s.total.toFixed(2)} €</span>
							</button>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
