import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

interface Task {
  name: string;
  description: string;
  fromDate: string;
  toDate: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo-app',
  standalone: false,
  templateUrl: './todo-app.component.html',
  styleUrls: ['./todo-app.component.css']
})
export class TodoAppComponent implements OnInit {

  taskName = '';
  taskDescription = '';
  fromDate = '';
  toDate = '';
  tasks: any[] = [
  {
    id: 1,
    name: 'Complete Portfolio',
    description: 'Finish Angular portfolio',
    fromDate: '2026-09-14T09:00',
    toDate: '2026-09-14T11:00',
    completed: false
  },
  {
    id: 2,
    name: 'Design Homepage',
    description: 'Create homepage UI',
    fromDate: '2026-09-14T11:30',
    toDate: '2026-09-14T13:00',
    completed: false
  },
  {
    id: 3,
    name: 'Review Tasks',
    description: 'Check pending tasks',
    fromDate: '2026-09-15T10:00',
    toDate: '2026-09-15T11:00',
    completed: false
  },
  {
    id: 4,
    name: 'Update Resume',
    description: 'Add latest experience',
    fromDate: '2026-09-15T14:00',
    toDate: '2026-09-15T15:30',
    completed: false
  },
  {
    id: 5,
    name: 'Learn Angular',
    description: 'Practice Angular basics',
    fromDate: '2026-09-16T09:30',
    toDate: '2026-09-16T11:00',
    completed: false
  }
];

  isEditing = false;
  editingIndex: number | null = null;

  filterStatus: 'all' | 'opened' | 'closed' | 'today' = 'all';
  display = false;

  displayDeleteConfirm = false;
  taskToDelete: Task | null = null;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    // Refresh every minute
    setInterval(() => {
      this.tasks = [...this.tasks];
    }, 60000);

    // Sample tasks
    this.tasks = [
    ];
  }
  
  showDialog() {
    this.display = true;
  }

  addOrUpdateTask() {
    if (!this.taskName || !this.taskDescription || !this.fromDate || !this.toDate) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'All fields are required' });
      return;
    }

    if (this.fromDate > this.toDate) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: '"From" time should be before "To" time.' });
      return;
    }

    const task: Task = {
      name: this.taskName.trim(),
      description: this.taskDescription.trim(),
      fromDate: this.fromDate,
      toDate: this.toDate,
      completed: false
    };

    if (this.isEditing && this.editingIndex !== null) {
      this.tasks[this.editingIndex] = { ...this.tasks[this.editingIndex], ...task };
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated' });
    } else {
      this.tasks.push(task);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created' });
    }

    this.cancelEdit();
  }

  editTask(task: Task) {
    this.display = true;
    const index = this.tasks.indexOf(task);
    if (index > -1) {
      this.taskName = task.name;
      this.taskDescription = task.description;
      this.fromDate = task.fromDate;
      this.toDate = task.toDate;
      this.editingIndex = index;
      this.isEditing = true;
    }
  }

  cancelEdit() {
    this.clearForm();
    this.display = false;
    this.isEditing = false;
    this.editingIndex = null;
  }

  // deleteTask(task: Task) {
  //   this.tasks = this.tasks.filter(t => t !== task);
  // }

  confirmDeleteTask(task: Task) {
  this.taskToDelete = task;
  this.displayDeleteConfirm = true;
}

  deleteConfirmed() {
    if (this.taskToDelete) {
      this.tasks = this.tasks.filter(t => t !== this.taskToDelete);
      this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Task deleted' });
    }
    this.displayDeleteConfirm = false;
    this.taskToDelete = null;
  }

  cancelDelete() {
    this.displayDeleteConfirm = false;
    this.taskToDelete = null;
  }
  toggleStatus(task: Task) {
    task.completed = !task.completed;
  }

  clearForm() {
    this.taskName = '';
    this.taskDescription = '';
    this.fromDate = '';
    this.toDate = '';
  }

  getStatus(task: Task): string {
    const now = new Date();
    const from = new Date(task.fromDate);
    const to = new Date(task.toDate);

    if (task.completed) {
      return now > to ? 'Completed On Time' : 'Completed';
    }

    if (now >= from && now <= to) return 'Active';
    if (now < from) return 'Pending';
    return 'Not Completed';
  }

  getCardClass(task: Task): string {
    const status = this.getStatus(task);
    switch (status) {
      case 'Active': return 'card-active';
      case 'Completed': return 'card-completed';
      case 'Completed On Time': return 'card-completedontime';
      case 'Pending': return 'card-pending';
      default: return 'not-completed';
    }
  }

  getFilteredTasks(): Task[] {
    const now = new Date();

    switch (this.filterStatus) {
      case 'opened':
        return this.tasks.filter(task =>
          ['Active', 'Pending', 'Completed'].includes(this.getStatus(task))
        );
      case 'closed':
        return this.tasks.filter(task =>
          ['Completed On Time', 'Not Completed'].includes(this.getStatus(task))
        );
      case 'today':
        return this.tasks.filter(task => {
          const date = new Date(task.fromDate);
          return date.getDate() === now.getDate() &&
                 date.getMonth() === now.getMonth() &&
                 date.getFullYear() === now.getFullYear();
        });
      default:
        return this.tasks;
    }
  }

  getGroupedTasks() {
    const grouped: { [date: string]: Task[] } = {};

    this.getFilteredTasks().forEach(task => {
      const key = new Date(task.fromDate).toDateString();
      grouped[key] = grouped[key] || [];
      grouped[key].push(task);
    });

    // Sort tasks within each date group
    Object.values(grouped).forEach(tasks =>
      tasks.sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime())
    );

    // Return grouped entries sorted by date
    return Object.entries(grouped).sort((a, b) =>
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
  }

  getOpenedCount(): number {
    return this.tasks.filter(task =>
      ['Active', 'Pending', 'Completed'].includes(this.getStatus(task))
    ).length;
  }

  getClosedCount(): number {
    return this.tasks.filter(task =>
      ['Completed On Time', 'Not Completed'].includes(this.getStatus(task))
    ).length;
  }

  getTodayCount(): number {
    const now = new Date();
    return this.tasks.filter(task => {
      const date = new Date(task.fromDate);
      return date.getDate() === now.getDate() &&
             date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear();
    }).length;
  }
}
