import { FormControl } from '@angular/forms';

import { egyptianMobileValidator } from './egyptian-mobile.validator';

describe('egyptianMobileValidator', () => {
  const validate = egyptianMobileValidator();

  it('accepts 010, 011, 012, and 015 numbers', () => {
    for (const phone of ['01012345678', '01112345678', '01212345678', '01512345678']) {
      expect(validate(new FormControl(phone))).toBeNull();
    }
  });

  it('rejects numbers that miss the operator digit or the length', () => {
    expect(validate(new FormControl('01312345678'))).toEqual({ egyptianMobile: true });
    expect(validate(new FormControl('0101234567'))).toEqual({ egyptianMobile: true });
    expect(validate(new FormControl('+201012345678'))).toEqual({ egyptianMobile: true });
  });

  it('leaves an empty value for the required validator', () => {
    expect(validate(new FormControl(''))).toBeNull();
    expect(validate(new FormControl(null))).toBeNull();
  });
});
