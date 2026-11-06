import { type BusinessType, type CreateShopInput, FIELD_LIMITS, type Shop } from '@kadai/shared';
import { useEffect } from 'react';
import {
  fieldRules,
  FormAlert,
  type FormRules,
  PhoneField,
  SelectField,
  TextareaField,
  TextField,
  useForm,
} from '@kadai/ui';
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
const RULES: FormRules<ShopFormValues> = {
  name: fieldRules.text('Shop name', { required: true }),
  businessType: { label: 'Business type', required: true },
  phone: fieldRules.phone(),
  address: fieldRules.text('Address', { max: FIELD_LIMITS.longText }),
};

interface ShopFormProps {
  id: string;
  onCreated: (shop: Shop) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
}

export function ShopForm({ id, onCreated, onDirtyChange, onSubmittingChange }: ShopFormProps) {
  const { field, handleSubmit, formError, isSubmitting, isDirty } = useForm<ShopFormValues>({
    initialValues: EMPTY_VALUES,
    rules: RULES,
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
        placeholder="For example, Ponni Dairy"
        maxLength={FIELD_LIMITS.shortText}
        autoComplete="organization"
        data-autofocus
      />
      <SelectField
        {...field('businessType')}
        label="Business type"
        placeholder="Choose a business type"
        hint="This decides the units and features the shop gets."
        options={BUSINESS_TYPE_OPTIONS}
      />
      <PhoneField {...field('phone')} />
      <TextareaField
        {...field('address')}
        label="Address"
        placeholder="Street, area, city and PIN code"
        showCount
        maxLength={FIELD_LIMITS.longText}
        autoComplete="street-address"
      />
    </form>
  );
}
