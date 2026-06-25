import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CheckCircle, Loader2, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { api } from "@/lib/api"
import { Button } from "@/renderer/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/renderer/components/ui/field"
import { Input } from "@/renderer/components/ui/input"
import type { Product, ProductInput } from "@/types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSave: (input: ProductInput, id?: number) => Promise<void>
}

const productSchema = z.object({
  barcode: z.string().optional(),
  name: z.string().min(1, "validation.required"),
  brand: z.string().optional(),
  price: z.number("validation.priceInvalid").min(0, "validation.priceInvalid"),
  stock: z
    .number("validation.stockInvalid")
    .int()
    .min(0, "validation.stockInvalid"),
  category: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof productSchema>

const EMPTY_VALUES: FormValues = {
  barcode: "",
  name: "",
  brand: "",
  price: 0,
  stock: 0,
  category: "",
  image_url: "",
}

export const ProductFormDialog = ({
  open,
  onOpenChange,
  product,
  onSave,
}: Props) => {
  const { t } = useTranslation()
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "found" | "not_found" | "offline"
  >("idle")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  })

  const barcodeValue = watch("barcode")

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          barcode: product.barcode ?? "",
          name: product.name,
          brand: product.brand ?? "",
          price: product.price,
          stock: product.stock,
          category: product.category ?? "",
          image_url: product.image_url ?? "",
        })
      } else {
        reset(EMPTY_VALUES)
      }
      setLookupStatus("idle")
    }
  }, [product, open, reset])

  const handleLookup = async () => {
    if (!barcodeValue?.trim()) return
    setLookupStatus("loading")

    const result = await api.products.lookupBarcode(barcodeValue.trim())

    if (result.source === "local" && result.ok) {
      const p = result.data as Product
      setValue("name", p.name)
      setValue("brand", p.brand ?? "")
      setValue("price", p.price)
      setValue("stock", p.stock)
      setValue("category", p.category ?? "")
      setValue("image_url", p.image_url ?? "")
      setLookupStatus("found")
      return
    }

    if (result.ok) {
      const off = result.data as {
        product_name: string
        brands: string
        image_url: string
        categories: string
      }
      setValue("name", off.product_name)
      setValue("brand", off.brands)
      setValue("image_url", off.image_url)
      setValue("category", off.categories.split(",")[0]?.trim() ?? "")
      setLookupStatus("found")
    } else if (result.error === "offline" || result.error === "timeout") {
      setLookupStatus("offline")
    } else {
      setLookupStatus("not_found")
    }
  }

  const onSubmit = async (data: FormValues) => {
    await onSave(
      {
        barcode: data.barcode?.trim() || null,
        name: data.name.trim(),
        brand: data.brand?.trim() || null,
        price: data.price,
        stock: data.stock,
        category: data.category?.trim() || null,
        image_url: data.image_url?.trim() || null,
      },
      product?.id,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? t("products.edit") : t("products.add")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Barcode + lookup */}
          <Field>
            <FieldLabel>{t("products.barcode")}</FieldLabel>
            <div className="flex gap-2">
              <Input {...register("barcode")} placeholder="3017620422003" />
              <Button
                type="button"
                variant="outline"
                onClick={handleLookup}
                disabled={lookupStatus === "loading" || !barcodeValue?.trim()}
              >
                {lookupStatus === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                <span className="ml-1">{t("products.barcodeLookup")}</span>
              </Button>
            </div>
            {lookupStatus === "found" && (
              <p className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="size-3" /> {t("products.barcodeFound")}
              </p>
            )}
            {lookupStatus === "not_found" && (
              <p className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="size-3" />{" "}
                {t("products.barcodeNotFound")}
              </p>
            )}
            {lookupStatus === "offline" && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="size-3" />{" "}
                {t("products.barcodeOffline")}
              </p>
            )}
          </Field>

          {/* Name */}
          <Field data-invalid={!!errors.name}>
            <FieldLabel>{t("products.name")} *</FieldLabel>
            <Input {...register("name")} aria-invalid={!!errors.name} />
            <FieldError
              errors={[
                errors.name ? { message: t(errors.name.message!) } : undefined,
              ]}
            />
          </Field>

          {/* Brand + Price */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>{t("products.brand")}</FieldLabel>
              <Input {...register("brand")} />
            </Field>
            <Field data-invalid={!!errors.price}>
              <FieldLabel>{t("products.price")} *</FieldLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("price", { valueAsNumber: true })}
                aria-invalid={!!errors.price}
              />
              <FieldError
                errors={[
                  errors.price
                    ? { message: t(errors.price.message!) }
                    : undefined,
                ]}
              />
            </Field>
          </div>

          {/* Stock */}
          <Field data-invalid={!!errors.stock}>
            <FieldLabel>{t("products.stock")} *</FieldLabel>
            <Input
              type="number"
              min="0"
              step="1"
              {...register("stock", { valueAsNumber: true })}
              aria-invalid={!!errors.stock}
            />
            <FieldError
              errors={[
                errors.stock
                  ? { message: t(errors.stock.message!) }
                  : undefined,
              ]}
            />
          </Field>

          {/* Category */}
          <Field>
            <FieldLabel>{t("products.category")}</FieldLabel>
            <Input {...register("category")} />
          </Field>

          {/* Image URL */}
          <Field data-invalid={!!errors.image_url}>
            <FieldLabel>{t("products.image")}</FieldLabel>
            <Input {...register("image_url")} placeholder="https://..." />
            <FieldError
              errors={[
                errors.image_url
                  ? { message: t(errors.image_url.message!) }
                  : undefined,
              ]}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("products.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("products.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
