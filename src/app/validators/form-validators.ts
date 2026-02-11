import { FormControl, ValidationErrors } from '@angular/forms';

export class FormValidators {

  static notOnlyWhiteSpace(control: FormControl): ValidationErrors | null {
    if ((control.value != null) && (control.value.trim().length === 0)) {
      return { notOnlyWhiteSpace: true };
    } else return null;
  }

  public static forbiddenWord(word: string): any {
    return (control: FormControl): ValidationErrors | null => {
      const forbidden = new RegExp(word, 'i');
      if (forbidden.test(control.value)) {
        return { forbiddenWord: true };
      } else return null;
    }
  }

  static isImageUrl(control: FormControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value;
    if (value.startsWith('data:image/')) {
      return null;
    }
    const urlRegex = /^(https?|http):\/\/[^\s/$.?#].[^\s]*$/i;
    const imageRegex = /\.(jpg|jpeg|png|webp|avif|gif)/i;
    if (urlRegex.test(value)) {
      return null;
    }
    return { invalidUrl: true };
  }
}
