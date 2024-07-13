import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function isValidTvaNumber(): ValidatorFn {
  const beRegex = /^BE\d{10}$/;
  const frRegex = /^FR[A-Z]{2}\d{9}$/;
  const itRegex = /^IT\d{11}$/;
  const luRegex = /^LU\d{8}$/;
  const nlRegex = /^NL\d{9}B\d{2}$/;
  const deRegex = /^DE\d{9}$/;
  const cheRegex = /^(CHE|CHE-)?\d{3}\.\d{3}\.\d{3} TVA$/;
  const regexArray = [
    beRegex,
    frRegex,
    itRegex,
    luRegex,
    nlRegex,
    deRegex,
    cheRegex,
  ];

  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = regexArray.some((regex) => regex.test(control.value));
    return valid ? null : { invalidVatNumber: { value: control.value } };
  };
}



// Validateur pour les plages de dates


// Validateur personnalisé pour les plages de dates
export function dateRangeValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    // Récupération des valeurs des champs startDate et endDate
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;
    
    // Obtenir la date d'aujourd'hui et mettre les heures à zéro pour comparer uniquement les dates
    const today = new Date().setHours(0, 0, 0, 0);

    if (startDate && endDate) {
      // Convertir les dates de début et de fin en objets Date et mettre les heures à zéro
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);

      // Vérifier si la date de début est postérieure à la date de fin
      if (start > end) {
        return { dateRange: 'La date de début doit être antérieure à la date de fin' };
      }
      
      // Vérifier si la date de fin est après aujourd'hui
      if (end > today) {
        return { dateRange: "La date de fin ne peut pas être après aujourd'hui" };
      }
    }
    
    // Si aucune erreur, retourner null
    return null;
  };
}