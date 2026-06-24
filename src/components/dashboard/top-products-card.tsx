import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from 'react-i18next'

type Props = {
  products: { name: string; quantity: number; revenue: number }[]
}

export const TopProductsCard = ({ products }: Props) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('dashboard.topProducts')}</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('dashboard.noData')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('sales.product')}</TableHead>
                <TableHead className="text-center">{t('dashboard.quantity')}</TableHead>
                <TableHead className="text-right">{t('dashboard.revenue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{p.quantity}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{p.revenue.toFixed(2)} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
