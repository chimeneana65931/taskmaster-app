import { Component } from '@angular/core'; // Import du décorateur Component
import { TodoListComponent } from './components/todo-list/todo-list.component'; // Import du composant todo-list

@Component({ // Décorateur définissant les métadonnées du composant racine
  selector: 'app-root', // Nom de la balise HTML du composant racine
  standalone: true, // Composant autonome, sans NgModule
  imports: [TodoListComponent], // Import du composant enfant à utiliser
  template: `<app-todo-list></app-todo-list>` // Template inline affichant le composant todo-list
})
export class AppComponent {} // Déclaration de la classe du composant racine (vide, sert de conteneur)