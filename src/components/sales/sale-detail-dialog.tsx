import { useState, useEffect } from "react";
import { Printer, Download } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { SaleWithItems } from "@/types";

type Props = {
	saleId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const SaleDetailDialog = ({ saleId, open, onOpenChange }: Props) => {
	const { t } = useTranslation();
	const [sale, setSale] = useState<SaleWithItems | null>(null);

	useEffect(() => {
		if (saleId && open) {
			api.sales.get(saleId).then((data) => setSale(data ?? null));
		} else {
			setSale(null);
		}
	}, [saleId, open]);

	const handlePrint = async () => {
		if (!sale) return;
		const ok = await api.receipt.print(sale.id);
		if (ok) toast.success(t("sales.printReceipt"));
	};

	const handleDownload = async () => {
		if (!sale) return;
		const path = await api.receipt.download(sale.id);
		if (path) toast.success(t("sales.downloadReceipt"));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{t("sales.detail")} #{sale?.id}
					</DialogTitle>
				</DialogHeader>

				{sale && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							{new Date(sale.created_at).toLocaleString()}
						</p>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("sales.product")}</TableHead>
									<TableHead className="text-center">
										{t("sales.qty")}
									</TableHead>
									<TableHead className="text-right">
										{t("sales.unitPrice")}
									</TableHead>
									<TableHead className="text-right">
										{t("sales.subtotal")}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sale.items.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium">
											{item.product_name}
										</TableCell>
										<TableCell className="text-center">
											{item.quantity}
										</TableCell>
										<TableCell className="text-right">
											{item.unit_price.toFixed(2)} €
										</TableCell>
										<TableCell className="text-right font-semibold">
											{item.total.toFixed(2)} €
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<div className="flex justify-end border-t border-border pt-3">
							<p className="text-lg font-bold">
								{t("sales.total")} : {sale.total.toFixed(2)} €
							</p>
						</div>
					</div>
				)}

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleDownload} disabled={!sale}>
						<Download className="size-4" />
						{t("sales.downloadReceipt")}
					</Button>
					<Button onClick={handlePrint} disabled={!sale}>
						<Printer className="size-4" />
						{t("sales.printReceipt")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
