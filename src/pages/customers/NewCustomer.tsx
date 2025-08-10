import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { PlanListRow, usePlans } from 'hooks/usePlans';
import { useSnackbar } from 'notistack';
import { useAuth } from 'providers/AuthProvider';
import { rootPaths } from 'routes/paths';
import { createCustomer } from 'services/customers';
import { createMembership } from 'services/memberships';
import { createPayment } from 'services/payments';
import { createProgressEvent } from 'services/progress';
import { useSWRConfig } from 'swr';
import PageHeader from 'components/sections/common/PageHeader';
import StyledTextField from 'components/styled/StyledTextField';

const steps = ['Datos del cliente', 'Evaluación inicial', 'Membresía', 'Pago'] as const;
type WizardStep = 0 | 1 | 2 | 3;

export default function NewCustomer() {
  const { profile, staff } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();
  const { data: plans = [] } = usePlans(200);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState<WizardStep>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: customer
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identification, setIdentification] = useState('');
  const [dob, setDob] = useState(''); // yyyy-mm-dd
  const [notes, setNotes] = useState('');

  // Step 2: metrics (flexible fields stored in metrics json)
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [bodyFatPct, setBodyFatPct] = useState<number | ''>('');
  const [evalNotes, setEvalNotes] = useState('');

  // Step 3: membership
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(''); // yyyy-mm-dd
  const [endDate, setEndDate] = useState<string>(''); // yyyy-mm-dd optional

  // Step 4: payment
  const selectedPlan = useMemo<PlanListRow | undefined>(
    () => plans.find((p) => p.id === selectedPlanId),
    [plans, selectedPlanId],
  );
  const [amountDollars, setAmountDollars] = useState<number | ''>('');
  const [method, setMethod] = useState<'cash' | 'card' | 'stripe' | 'paypal'>('cash');

  const canNext = useMemo(() => {
    if (activeStep === 0) return firstName.trim().length > 1 && lastName.trim().length > 1;
    if (activeStep === 2) return !!selectedPlanId;
    return true;
  }, [activeStep, firstName, lastName, selectedPlanId]);

  const resetAll = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setIdentification('');
    setDob('');
    setNotes('');
    setWeightKg('');
    setHeightCm('');
    setBodyFatPct('');
    setEvalNotes('');
    setSelectedPlanId('');
    setStartDate('');
    setEndDate('');
    setAmountDollars('');
    setMethod('cash');
    setActiveStep(0);
  };

  const handleCancel = () => {
    resetAll();
    navigate(`/${rootPaths.customersRoot}`);
  };

  const handleSubmit = useCallback(async () => {
    if (!profile?.gym_id) return;
    setIsSubmitting(true);
    try {
      const customerId = await createCustomer(profile.gym_id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        identification: identification.trim() || null,
        dob: dob || null,
        notes: notes || null,
      });

      const metrics: Record<string, unknown> = {};
      if (weightKg !== '') metrics.weight_kg = Number(weightKg);
      if (heightCm !== '') metrics.height_cm = Number(heightCm);
      if (bodyFatPct !== '') metrics.body_fat_pct = Number(bodyFatPct);
      await createProgressEvent({
        gymId: profile.gym_id,
        customerId,
        staffId: staff?.id ?? null,
        notes: evalNotes || null,
        metrics: Object.keys(metrics).length ? metrics : null,
        eventType: 'measurement',
      });

      let membershipId: string | null = null;
      if (selectedPlanId) {
        membershipId = await createMembership({
          gymId: profile.gym_id,
          customerId,
          planId: selectedPlanId,
          startDate: startDate || undefined,
          endDate: endDate || null,
          autoRenew: true,
        });
      }

      const amt = amountDollars === '' ? 0 : Number(amountDollars);
      if (amt > 0) {
        await createPayment({
          gymId: profile.gym_id,
          customerId,
          membershipId: membershipId ?? null,
          amountDollars: amt,
          method,
          status: 'paid',
        });
      }

      enqueueSnackbar('Cliente registrado', { variant: 'success' });
      await mutate('customers:list');
      resetAll();
      navigate(`/${rootPaths.customersRoot}`);
    } catch (e) {
      enqueueSnackbar(e instanceof Error ? e.message : 'Operación fallida', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    profile?.gym_id,
    firstName,
    lastName,
    email,
    phone,
    identification,
    dob,
    notes,
    weightKg,
    heightCm,
    bodyFatPct,
    evalNotes,
    staff?.id,
    selectedPlanId,
    startDate,
    endDate,
    amountDollars,
    method,
  ]);

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Nuevo cliente"
        breadcrumb={[
          { label: 'Inicio', url: rootPaths.root },
          { label: 'Clientes', url: `/${rootPaths.customersRoot}` },
          { label: 'Nuevo', active: true },
        ]}
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <StyledTextField
                  label="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                />
                <StyledTextField
                  label="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <StyledTextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <StyledTextField
                  label="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <StyledTextField
                  label="Identificación"
                  value={identification}
                  onChange={(e) => setIdentification(e.target.value)}
                  fullWidth
                />
                <StyledTextField
                  label="Fecha nacimiento"
                  placeholder="YYYY-MM-DD"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  fullWidth
                />
              </Stack>
              <StyledTextField
                label="Notas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <StyledTextField
                  label="Peso (kg)"
                  type="number"
                  inputProps={{ step: 0.1 }}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  fullWidth
                />
                <StyledTextField
                  label="Altura (cm)"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                  fullWidth
                />
                <StyledTextField
                  label="Grasa corporal (%)"
                  type="number"
                  inputProps={{ step: 0.1 }}
                  value={bodyFatPct}
                  onChange={(e) =>
                    setBodyFatPct(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  fullWidth
                />
              </Stack>
              <StyledTextField
                label="Notas de evaluación"
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={2}>
              <StyledTextField
                select
                label="Plan"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                fullWidth
              >
                {plans.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} — ${(p.price_cents / 100).toFixed(2)}
                  </MenuItem>
                ))}
              </StyledTextField>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <StyledTextField
                  label="Fecha inicio"
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                />
                <StyledTextField
                  label="Fecha fin (opcional)"
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                />
              </Stack>
              {selectedPlan && (
                <Typography variant="caption" color="text.secondary">
                  Precio del plan: ${(selectedPlan.price_cents / 100).toFixed(2)} USD
                </Typography>
              )}
            </Stack>
          )}

          {activeStep === 3 && (
            <Stack spacing={2}>
              <StyledTextField
                label="Monto a pagar (USD)"
                type="number"
                inputProps={{ step: 0.01, min: 0 }}
                value={amountDollars}
                onChange={(e) =>
                  setAmountDollars(e.target.value === '' ? '' : Number(e.target.value))
                }
                fullWidth
              />
              <StyledTextField
                select
                label="Método de pago"
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="stripe">Stripe</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
              </StyledTextField>
              {selectedPlan && (
                <Typography variant="caption" color="text.secondary">
                  Total plan: ${(selectedPlan.price_cents / 100).toFixed(2)} — pagas ahora:{' '}
                  {amountDollars === '' ? '0.00' : Number(amountDollars).toFixed(2)}
                </Typography>
              )}
            </Stack>
          )}

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={handleCancel} color="neutral" variant="text" disabled={isSubmitting}>
              Cancelar
            </Button>
            {activeStep > 0 && (
              <Button
                onClick={() => setActiveStep((s) => (s - 1) as WizardStep)}
                color="neutral"
                disabled={isSubmitting}
              >
                Atrás
              </Button>
            )}
            {activeStep < steps.length - 1 && (
              <Button
                onClick={() => setActiveStep((s) => (s + 1) as WizardStep)}
                variant="contained"
                disabled={!canNext || isSubmitting}
              >
                Siguiente
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={isSubmitting || !profile?.gym_id}
              >
                Finalizar
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
