import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** `01` + `0`, `1`, `2`, or `5` + 8 digits. Empty values are left to `Validators.required`. */
const EGYPTIAN_MOBILE_PATTERN = /^01[0125]\d{8}$/;

export function egyptianMobileValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value?.trim() ?? '';
    if (value.length === 0) {
      return null;
    }

    return EGYPTIAN_MOBILE_PATTERN.test(value) ? null : { egyptianMobile: true };
  };
}
