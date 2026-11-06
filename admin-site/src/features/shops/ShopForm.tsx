import { type BusinessType, type CreateShopInput, FIELD_LIMITS, type Shop } from '@kadai/shared';
import { useEffect } from 'react';
import { FormAlert, SelectField, TextareaField, TextField, useForm } from '@kadai/ui';
import { BUSINESS_TYPES } from '@/config/businessTypes';
import { shopsApi } from './shopsApi';

const BUSINESS_TYPE_OPTIONS = Object.values(BUSINESS_TYPES).map(({ id, label, units, icon }) => ({
  value: id,
  label,
  description: `Sold in: ${units}`,
  icon,
}));

interface ShopFormValues {
  name: string;
  businessType: BusinessType | '';
  phone: string;
  address: string;
}

const EMPTY_VALUES: ShopFormValues = { name: '', businessType: '', phone: '', address: '' };

interface ShopFormProps {
  id: string;
  onCreated: (shop: Shop) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
}

export function ShopForm({ id, onCreated, onDirtyChange, onSubmittingChange }: ShopFormProps) {
  const { field, handleSubmit, formError, isSubmitting, isDirty } = useForm<ShopFormValues>({
    initialValues: EMPTY_VALUES,
    // The API validates everything, including a missing business type, and the form shows its messages.
    onSubmit: async (values) => onCreated(await shopsApi.create(values as CreateShopInput)),
  });

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);
  useEffect(() => onSubmittingChange(isSubmitting), [isSubmitting, onSubmittingChange]);

  return (
    <form id={id} noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <TextField
        {...field('name')}
        label="Shop name"
        required
        maxLength={FIELD_LIMITS.shortText}
        autoComplete="organization"
        data-autofocus
      />
      <SelectField
        {...field('businessType')}
        label="Business type"
        required
        placeholder="Choose a business type"
        hint="This decides the units and features the shop gets."
        options={BUSINESS_TYPE_OPTIONS}
      />
      <TextField
        {...field('phone')}
        label="Phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        hint="10 to 15 digits. A + at the start is fine."
      />
      <TextareaField
        {...field('address')}
        label="Address"
        maxLength={FIELD_LIMITS.longText}
        autoComplete="street-address"
      />
    </form>
  );
}
