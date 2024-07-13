import { Injectable } from '@angular/core'; // Importation du décorateur Injectable d'Angular
import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar'; // Importation des classes nécessaires d'angular-calendar

@Injectable() // Décorateur indiquant que cette classe peut être injectée comme dépendance
export class CustomDateFormatter extends CalendarDateFormatter {
  
  // Surcharge de la méthode monthViewColumnHeader pour personnaliser l'affichage de l'en-tête de colonne de la vue mensuelle
  public override monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date); // Formatage de la date en fonction de la locale avec le jour de la semaine en abrégé
  }

  // Surcharge de la méthode weekViewColumnHeader pour personnaliser l'affichage de l'en-tête de colonne de la vue hebdomadaire
  public override weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date); // Formatage de la date en fonction de la locale avec le jour de la semaine en abrégé
  }

  // Surcharge de la méthode dayViewHour pour personnaliser l'affichage des heures dans la vue journalière
  public override dayViewHour({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric' }).format(date); // Formatage de la date en fonction de la locale avec les heures et minutes
  }
}
