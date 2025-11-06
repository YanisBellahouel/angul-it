import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * 🌳 Composant racine de l'application
 *
 * C'est le premier composant chargé par Angular.
 * Il contient le <router-outlet> qui affichera les autres composants
 * selon la route active (/, /captcha, /result)
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Pas de logique ici, juste le conteneur principal
  // Tout est géré par le routing et les composants enfants
}