import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { EMPTY, catchError, finalize } from 'rxjs';
import { MessageModel } from '../../models/contact.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss'
})
export class HistoryPageComponent implements OnInit {
  messages: MessageModel[] = [];
  loading = true;
  errorMessage = '';
  searchTerm = '';
  typeFilter = 'all';
  statusFilter = 'all';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  get filteredMessages(): MessageModel[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.messages.filter(message => {
      const matchesType = this.typeFilter === 'all' || message.type.toLowerCase() === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || message.status.toLowerCase() === this.statusFilter;
      const searchableText = `${message.contactName} ${message.body} ${message.type} ${message.status}`.toLowerCase();
      return matchesType && matchesStatus && (!search || searchableText.includes(search));
    });
  }

  get deliveredCount(): number {
    return this.messages.filter(message => ['sent', 'delivered', 'read'].includes(message.status.toLowerCase())).length;
  }

  get failedCount(): number {
    return this.messages.filter(message => message.status.toLowerCase() === 'failed').length;
  }

  loadMessages(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getMessages().pipe(
      catchError((error: unknown) => {
        this.errorMessage = this.getErrorMessage(error);
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(messages => {
      this.messages = messages;
    });
  }

  statusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'read':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'sent':
        return 'bg-sky-50 text-sky-700 ring-sky-600/20';
      case 'failed':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      default:
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return 'Message history could not be loaded. Check your connection and try again.';
  }
}
