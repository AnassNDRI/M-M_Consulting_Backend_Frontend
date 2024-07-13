import { Pipe, PipeTransform } from '@angular/core';

// Création d'un Pipe Angular personnalisé.
@Pipe({
  name: 'dateWithSuffix', // Nom du pipe, utilisé dans les templates pour appliquer la transformation.
  standalone: true
})
export class DateWithSuffixPipe implements PipeTransform {
  // La méthode transform est appelée avec la valeur de date à transformer.
  transform(date: Date | string): string {
    const d = new Date(date); // Convertit la valeur en un objet Date.
    const day = d.getDate(); // Obtient le jour du mois de l'objet Date.
    const daySuffix = this.getSuffix(day); // Obtient le suffixe correct pour le jour.
    return daySuffix; // Renvoie le suffixe.
  }

  // Méthode privée pour obtenir le suffixe de la journée en fonction des règles en anglais.
  private getSuffix(day: number): string {
    // Calcule le reste de la division du jour par 10 et 100 pour déterminer le suffixe.
    const j = day % 10,
          k = day % 100;
    // Selon le reste, le suffixe approprié est renvoyé.
    if (j == 1 && k != 11) {
        return "st"; // 'st' pour 1, sauf si c'est 11.
    }
    if (j == 2 && k != 12) {
        return "nd"; // 'nd' pour 2, sauf si c'est 12.
    }
    if (j == 3 && k != 13) {
        return "rd"; // 'rd' pour 3, sauf si c'est 13.
    }
    // Pour tous les autres cas, 'th' est utilisé.
    return "th";
  }
}
