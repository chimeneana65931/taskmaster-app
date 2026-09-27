export interface Todo { // Définition de la structure d'une tâche
  id: number; // Identifiant unique de la tâche
  title: string; // Texte de la tâche
  category: string; // Catégorie : Travail, Perso, Courses, Urgent
  priority: 'Basse' | 'Moyenne' | 'Haute'; // Niveau de priorité de la tâche
  completed: boolean; // Statut terminé ou non
  createdAt: number; // Timestamp de création (utilisé pour le tri)
}