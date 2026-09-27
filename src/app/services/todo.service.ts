import { Injectable, signal } from '@angular/core'; // Import des outils Angular nécessaires
import { Todo } from '../models/todo'; // Import du modèle Todo

const STORAGE_KEY = 'angular-todos'; // Clé utilisée pour stocker les données dans localStorage

@Injectable({ // Décorateur indiquant que cette classe est un service injectable
  providedIn: 'root' // Le service est disponible dans toute l'application
})
export class TodoService { // Déclaration de la classe du service
  todos = signal<Todo[]>(this.loadFromStorage()); // Signal réactif initialisé avec les données du localStorage

  private loadFromStorage(): Todo[] { // Méthode privée pour lire le localStorage
    const raw = localStorage.getItem(STORAGE_KEY); // Récupère la chaîne JSON stockée (ou null)
    return raw ? JSON.parse(raw) : []; // Parse le JSON si présent, sinon retourne un tableau vide
  }

  private saveToStorage(todos: Todo[]): void { // Méthode privée pour écrire dans le localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); // Convertit le tableau en JSON et le sauvegarde
  }

  addTodo(title: string, category: string, priority: Todo['priority']): void { // Méthode pour ajouter une nouvelle tâche
    const newTodo: Todo = { // Construction de l'objet représentant la nouvelle tâche
      id: Date.now(), // Utilise le timestamp actuel comme identifiant unique
      title: title.trim(), // Supprime les espaces inutiles autour du titre
      category, // Catégorie choisie par l'utilisateur
      priority, // Priorité choisie par l'utilisateur
      completed: false, // Une nouvelle tâche n'est jamais terminée
      createdAt: Date.now() // Enregistre la date de création
    };
    const updated = [...this.todos(), newTodo]; // Crée un nouveau tableau avec la tâche ajoutée
    this.todos.set(updated); // Met à jour le signal avec le nouveau tableau
    this.saveToStorage(updated); // Sauvegarde le nouveau tableau dans le localStorage
  }

  toggleTodo(id: number): void { // Méthode pour inverser le statut terminé/non terminé
    const updated = this.todos().map(t => // Parcourt toutes les tâches
      t.id === id ? { ...t, completed: !t.completed } : t // Inverse "completed" seulement pour la tâche ciblée
    );
    this.todos.set(updated); // Met à jour le signal
    this.saveToStorage(updated); // Sauvegarde le changement
  }

  deleteTodo(id: number): void { // Méthode pour supprimer une tâche
    const updated = this.todos().filter(t => t.id !== id); // Garde toutes les tâches sauf celle à supprimer
    this.todos.set(updated); // Met à jour le signal
    this.saveToStorage(updated); // Sauvegarde le nouveau tableau
  }

  editTodo(id: number, newTitle: string): void { // Méthode pour modifier le titre d'une tâche
    const updated = this.todos().map(t => // Parcourt toutes les tâches
      t.id === id ? { ...t, title: newTitle.trim() } : t // Remplace le titre seulement pour la tâche ciblée
    );
    this.todos.set(updated); // Met à jour le signal
    this.saveToStorage(updated); // Sauvegarde le changement
  }

  clearCompleted(): void { // Méthode pour supprimer toutes les tâches terminées
    const updated = this.todos().filter(t => !t.completed); // Garde uniquement les tâches non terminées
    this.todos.set(updated); // Met à jour le signal
    this.saveToStorage(updated); // Sauvegarde le nouveau tableau
  }
}