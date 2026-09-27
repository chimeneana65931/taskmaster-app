import { Component, computed, signal } from '@angular/core'; // Import des outils Angular pour signals et composants
import { FormsModule } from '@angular/forms'; // Import du module pour utiliser ngModel
import { CommonModule } from '@angular/common'; // Import du module pour ngFor / ngIf
import { TodoService } from '../../services/todo.service'; // Import du service Todo
import { Todo } from '../../models/todo'; // Import du modèle Todo

type StatusFilter = 'all' | 'active' | 'completed'; // Type définissant les filtres de statut possibles
type SortOption = 'recent' | 'old' | 'priority' | 'alpha'; // Type définissant les options de tri possibles

@Component({ // Décorateur définissant les métadonnées du composant
  selector: 'app-todo-list', // Nom de la balise HTML du composant
  standalone: true, // Composant autonome, sans NgModule
  imports: [FormsModule, CommonModule], // Modules importés par ce composant
  templateUrl: './todo-list.component.html', // Fichier HTML associé
  styleUrl: './todo-list.component.scss' // Fichier SCSS associé
})
export class TodoListComponent { // Déclaration de la classe du composant
  categories = ['Travail', 'Perso', 'Courses', 'Urgent']; // Liste des catégories disponibles
  priorities: Todo['priority'][] = ['Basse', 'Moyenne', 'Haute']; // Liste des priorités disponibles

  newTitle = ''; // Variable liée au champ de saisie pour une nouvelle tâche
  newCategory = 'Perso'; // Catégorie sélectionnée par défaut
  newPriority: Todo['priority'] = 'Moyenne'; // Priorité sélectionnée par défaut

  editingId: number | null = null; // Id de la tâche en cours d'édition (null si aucune)
  editingTitle = ''; // Titre temporaire pendant l'édition

  searchText = signal(''); // Signal contenant le texte recherché
  statusFilter = signal<StatusFilter>('all'); // Signal contenant le filtre de statut actif
  categoryFilter = signal('Toutes'); // Signal contenant le filtre de catégorie actif
  sortBy = signal<SortOption>('recent'); // Signal contenant l'option de tri active
  darkMode = signal(false); // Signal indiquant si le mode sombre est activé

  constructor(public todoService: TodoService) {} // Injection du service Todo, rendu public pour le template

  filteredTodos = computed(() => { // Signal calculé produisant la liste finale affichée
    let list = this.todoService.todos(); // Récupère toutes les tâches actuelles

    if (this.searchText().trim()) { // Vérifie si une recherche est saisie
      const term = this.searchText().toLowerCase(); // Passe le terme recherché en minuscule
      list = list.filter(t => t.title.toLowerCase().includes(term)); // Filtre les tâches contenant le terme
    }

    if (this.statusFilter() === 'active') { // Vérifie si le filtre "à faire" est actif
      list = list.filter(t => !t.completed); // Garde uniquement les tâches non terminées
    } else if (this.statusFilter() === 'completed') { // Vérifie si le filtre "terminées" est actif
      list = list.filter(t => t.completed); // Garde uniquement les tâches terminées
    }

    if (this.categoryFilter() !== 'Toutes') { // Vérifie si une catégorie précise est sélectionnée
      list = list.filter(t => t.category === this.categoryFilter()); // Filtre par catégorie choisie
    }

    const priorityOrder = { Haute: 0, Moyenne: 1, Basse: 2 }; // Définit l'ordre de tri des priorités
    const sorted = [...list]; // Copie le tableau pour ne pas modifier l'original

    switch (this.sortBy()) { // Vérifie l'option de tri sélectionnée
      case 'recent': // Cas : tri du plus récent au plus ancien
        sorted.sort((a, b) => b.createdAt - a.createdAt); // Compare les dates de création décroissantes
        break; // Sort du switch
      case 'old': // Cas : tri du plus ancien au plus récent
        sorted.sort((a, b) => a.createdAt - b.createdAt); // Compare les dates de création croissantes
        break; // Sort du switch
      case 'priority': // Cas : tri par priorité
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]); // Compare l'ordre des priorités
        break; // Sort du switch
      case 'alpha': // Cas : tri alphabétique
        sorted.sort((a, b) => a.title.localeCompare(b.title)); // Compare les titres alphabétiquement
        break; // Sort du switch
    }

    return sorted; // Retourne la liste finale triée et filtrée
  });

  totalCount = computed(() => this.todoService.todos().length); // Signal calculé du nombre total de tâches

  remainingCount = computed(() => // Signal calculé du nombre de tâches restantes
    this.todoService.todos().filter(t => !t.completed).length // Compte les tâches non terminées
  );

  activeCount = computed(() => this.remainingCount()); // Alias du nombre de tâches actives pour l'onglet

  completedCount = computed(() => // Signal calculé du nombre de tâches terminées
    this.todoService.todos().filter(t => t.completed).length // Compte les tâches terminées
  );

  progressPercent = computed(() => { // Signal calculé du pourcentage de progression
    const total = this.totalCount(); // Récupère le nombre total de tâches
    if (total === 0) return 0; // Évite une division par zéro si aucune tâche
    return Math.round((this.completedCount() / total) * 100); // Calcule et arrondit le pourcentage
  });

  onAdd(): void { // Méthode appelée lors de l'ajout d'une tâche
    if (this.newTitle.trim()) { // Vérifie que le champ titre n'est pas vide
      this.todoService.addTodo(this.newTitle, this.newCategory, this.newPriority); // Appelle le service pour ajouter la tâche
      this.newTitle = ''; // Réinitialise le champ de saisie du titre
    }
  }

  onToggle(id: number): void { // Méthode appelée lors du clic sur une case à cocher
    this.todoService.toggleTodo(id); // Appelle le service pour inverser le statut
  }

  onDelete(id: number): void { // Méthode appelée lors du clic sur supprimer
    this.todoService.deleteTodo(id); // Appelle le service pour supprimer la tâche
  }

  startEdit(id: number, currentTitle: string): void { // Méthode pour démarrer l'édition d'une tâche
    this.editingId = id; // Définit l'id de la tâche en cours d'édition
    this.editingTitle = currentTitle; // Pré-remplit le champ d'édition avec le titre actuel
  }

  saveEdit(id: number): void { // Méthode pour sauvegarder l'édition
    if (this.editingTitle.trim()) { // Vérifie que le nouveau titre n'est pas vide
      this.todoService.editTodo(id, this.editingTitle); // Appelle le service pour mettre à jour le titre
    }
    this.editingId = null; // Quitte le mode édition
  }

  setStatusFilter(f: StatusFilter): void { // Méthode pour changer le filtre de statut
    this.statusFilter.set(f); // Met à jour le signal du filtre de statut
  }

  setCategoryFilter(c: string): void { // Méthode pour changer le filtre de catégorie
    this.categoryFilter.set(c); // Met à jour le signal du filtre de catégorie
  }

  onSearchChange(value: string): void { // Méthode appelée lors de la saisie dans la recherche
    this.searchText.set(value); // Met à jour le signal du texte recherché
  }

  onSortChange(value: SortOption): void { // Méthode appelée lors du changement de tri
    this.sortBy.set(value); // Met à jour le signal de l'option de tri
  }

  toggleDarkMode(): void { // Méthode pour basculer le mode sombre
    this.darkMode.update(v => !v); // Inverse la valeur actuelle du signal
  }

  clearCompleted(): void { // Méthode pour supprimer les tâches terminées
    this.todoService.clearCompleted(); // Appelle le service correspondant
  }
}