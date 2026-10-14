import { definePreset } from '@primeuix/themes';
import AuraBase from '@primeuix/themes/aura/base';
import skeleton from '@primeuix/themes/aura/skeleton';
import toast from '@primeuix/themes/aura/toast';

/**
 * Light Aura preset aligned with the Kitchen Orders Board design.
 * PrimeNG paints `primary.color` from shade 500, so that shade is Blue 600 (#2563eb).
 * Only the components the app renders are included; add a component's Aura tokens here before using it.
 */
export const kitchenOrdersPreset = definePreset({ ...AuraBase, components: { skeleton, toast } }, {
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
