import { definePreset } from '@primeuix/themes';
import AuraBase from '@primeuix/themes/aura/base';
import button from '@primeuix/themes/aura/button';
import select from '@primeuix/themes/aura/select';
import selectbutton from '@primeuix/themes/aura/selectbutton';
import skeleton from '@primeuix/themes/aura/skeleton';
import toast from '@primeuix/themes/aura/toast';
import togglebutton from '@primeuix/themes/aura/togglebutton';

/**
 * Light Aura preset aligned with the Kitchen Orders Board design.
 * PrimeNG paints `primary.color` from shade 500, so that shade is Blue 600 (#2563eb).
 * Only the components the app renders are included; add a component's Aura tokens here before using it.
 */
export const kitchenOrdersPreset = definePreset(
  { ...AuraBase, components: { button, select, selectbutton, skeleton, toast, togglebutton } },
  {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.600}',
      600: '{blue.700}',
      700: '{blue.800}',
      800: '{blue.900}',
      900: '{blue.950}',
      950: '{blue.950}',
    },
    content: {
      borderRadius: '{border.radius.sm}',
    },
    formField: {
      borderRadius: '{border.radius.sm}',
    },
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
  },
});
