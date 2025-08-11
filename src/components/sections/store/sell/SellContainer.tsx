import { useMemo, useState } from 'react';
import { Avatar, Badge, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import useNumberFormat from 'hooks/useNumberFormat';
import { useProducts } from 'hooks/useProducts';
import { useSnackbar } from 'notistack';
import { useAuth } from 'providers/AuthProvider';
import {
  CartItemInput,
  createDraftSale,
  paySale,
  setSaleDiscount,
  upsertSaleItems,
} from 'services/sales';
import StyledTextField from 'components/styled/StyledTextField';
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector';

export default function SellContainer() {
  const { data: products = [] } = useProducts(500);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<
    Array<{ product_id: string; name: string; unit_price_cents: number; qty: number }>
  >([]);
  const [discountCents, setDiscountCents] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { currencyFormat } = useNumberFormat();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q),
    );
  }, [products, query]);

  const subtotalCents = cart.reduce((acc, it) => acc + it.unit_price_cents * it.qty, 0);
  const totalCents = Math.max(subtotalCents - discountCents, 0);

  const addToCart = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === id);
      if (existing) return prev.map((i) => (i.product_id === id ? { ...i, qty: i.qty + 1 } : i));
      return [
        ...prev,
        { product_id: id, name: p.name, unit_price_cents: p.price_cents ?? 0, qty: 1 },
      ];
    });
  };

  const setQty = (id: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.product_id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product_id !== id));

  const handleCheckout = async () => {
    if (!profile?.gym_id || cart.length === 0) return;
    try {
      const saleId = await createDraftSale({
        gym_id: profile.gym_id,
        discount_cents: discountCents,
      });
      const items: CartItemInput[] = cart.map((c) => ({
        product_id: c.product_id,
        quantity: c.qty,
        unit_price_cents: c.unit_price_cents,
      }));
      await upsertSaleItems(profile.gym_id, saleId, items);
      if (discountCents > 0) await setSaleDiscount(saleId, discountCents);
      await paySale(saleId, method);
      enqueueSnackbar('Venta registrada', { variant: 'success' });
      setCart([]);
      setDiscountCents(0);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Operación fallida';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2} direction="column">
            <StyledTextField
              placeholder="Buscar por nombre o SKU"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
            />
            <Stack spacing={1} direction="column">
              {filtered.slice(0, 100).map((p) => (
                <Stack
                  key={p.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ flex: 1, overflow: 'hidden' }}
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>{p.name.substring(0, 1)}</Avatar>
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {p.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {p.sku || '—'} · Stock: {p.on_hand ?? 0}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip size="small" label={currencyFormat((p.price_cents ?? 0) / 100)} />
                    <Button variant="soft" size="small" onClick={() => addToCart(p.id)}>
                      Añadir
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper variant="outlined" sx={{ p: 2, position: 'sticky', top: 16 }}>
          <Stack spacing={2} direction="column">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Carrito</Typography>
              <Badge color="primary" badgeContent={cart.reduce((a, b) => a + b.qty, 0)}>
                <span />
              </Badge>
            </Stack>
            <Stack spacing={1} direction="column">
              {cart.map((c) => (
                <Stack
                  key={c.product_id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle2" sx={{ flex: 1 }} noWrap>
                    {c.name}
                  </Typography>
                  <StyledTextField
                    type="number"
                    value={c.qty}
                    onChange={(e) => setQty(c.product_id, parseInt(e.target.value || '1', 10))}
                    sx={{ width: 96 }}
                  />
                  <Typography sx={{ width: 120, textAlign: 'right' }}>
                    {currencyFormat((c.unit_price_cents ?? 0) / 100)}
                  </Typography>
                  <Typography sx={{ width: 120, textAlign: 'right' }}>
                    {currencyFormat(((c.unit_price_cents ?? 0) * c.qty) / 100)}
                  </Typography>
                  <Button color="error" variant="text" onClick={() => removeFromCart(c.product_id)}>
                    Quitar
                  </Button>
                </Stack>
              ))}
              {!cart.length && (
                <Typography variant="body2" color="text.secondary">
                  No hay productos en el carrito
                </Typography>
              )}
            </Stack>
            <Divider />
            <PaymentMethodSelector value={method} onChange={setMethod} />
            <Stack direction="row" spacing={2} alignItems="center">
              <StyledTextField
                label="Descuento"
                type="number"
                value={discountCents / 100}
                onChange={(e) =>
                  setDiscountCents(Math.round(parseFloat(e.target.value || '0') * 100))
                }
                sx={{ width: 200 }}
              />
              <Stack sx={{ flex: 1 }} />
              <Stack spacing={0.5} direction="column">
                <Typography variant="body2">
                  Subtotal: {currencyFormat(subtotalCents / 100)}
                </Typography>
                <Typography variant="body2">
                  Descuento: {currencyFormat(discountCents / 100)}
                </Typography>
                <Typography variant="h6">Total: {currencyFormat(totalCents / 100)}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="contained" onClick={handleCheckout} disabled={cart.length === 0}>
                Cobrar
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
