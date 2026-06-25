import { ipcRenderer, contextBridge } from "electron";
import {
	DASHBOARD,
	IMPORT,
	PRODUCTS,
	RECEIPT,
	SALES,
	SETTINGS,
	SYSTEM,
	UPDATER,
} from "../src/channels";

const api = {
	products: {
		list: () => ipcRenderer.invoke(PRODUCTS.LIST),
		get: (id: number) => ipcRenderer.invoke(PRODUCTS.GET, id),
		search: (query: string) => ipcRenderer.invoke(PRODUCTS.SEARCH, query),
		create: (input: unknown) => ipcRenderer.invoke(PRODUCTS.CREATE, input),
		update: (id: number, input: unknown) =>
			ipcRenderer.invoke(PRODUCTS.UPDATE, id, input),
		delete: (id: number) => ipcRenderer.invoke(PRODUCTS.DELETE, id),
		lookupBarcode: (barcode: string) =>
			ipcRenderer.invoke(PRODUCTS.LOOKUP_BARCODE, barcode),
	},

	sales: {
		create: (input: unknown) => ipcRenderer.invoke(SALES.CREATE, input),
		list: () => ipcRenderer.invoke(SALES.LIST),
		get: (id: number) => ipcRenderer.invoke(SALES.GET, id),
		getByDate: (date: string) => ipcRenderer.invoke(SALES.GET_BY_DATE, date),
		dailySummary: (date: string) =>
			ipcRenderer.invoke(SALES.DAILY_SUMMARY, date),
		exportCsv: (sales: unknown) => ipcRenderer.invoke(SALES.EXPORT_CSV, sales),
		exportPdf: (sales: unknown) => ipcRenderer.invoke(SALES.EXPORT_PDF, sales),
	},

	import: {
		csv: () => ipcRenderer.invoke(IMPORT.CSV),
	},

	dashboard: {
		summary: () => ipcRenderer.invoke(DASHBOARD.SUMMARY),
	},

	receipt: {
		print: (saleId: number) => ipcRenderer.invoke(RECEIPT.PRINT, saleId),
		download: (saleId: number) => ipcRenderer.invoke(RECEIPT.DOWNLOAD, saleId),
	},

	updater: {
		check: () => ipcRenderer.invoke(UPDATER.CHECK),
		download: () => ipcRenderer.invoke(UPDATER.DOWNLOAD),
		install: () => ipcRenderer.invoke(UPDATER.INSTALL),
	},

	settings: {
		get: () => ipcRenderer.invoke(SETTINGS.GET),
		set: (partial: unknown) => ipcRenderer.invoke(SETTINGS.SET, partial),
	},

	system: {
		confirm: (message: string) => ipcRenderer.invoke(SYSTEM.CONFIRM, message),
		notify: (title: string, body: string) =>
			ipcRenderer.invoke(SYSTEM.NOTIFY, title, body),
	},

	on: (channel: string, callback: (...args: unknown[]) => void) => {
		ipcRenderer.on(channel, (_event, ...args) => callback(...args));
	},
	off: (channel: string, callback: (...args: unknown[]) => void) => {
		ipcRenderer.removeListener(channel, callback);
	},
};

contextBridge.exposeInMainWorld("api", api);

export type ElectronAPI = typeof api;
