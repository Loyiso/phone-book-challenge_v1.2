import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DataGridComponent } from "../../shared/data-grid/data-grid.component";
import { Contact } from '../../models/contact.model';
import { tap } from 'rxjs/operators';
import { TableAction } from '../../models/table-action.model';
import { EMPTY, catchError, finalize } from 'rxjs';

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
  imports: [DataGridComponent]
})
export class ContactsPageComponent implements OnInit {
  contacts: Contact[] = [];
  actions: TableAction[] = [];
  loading: boolean = true;
  selectedContact: Contact | null = null;
  messageType = 'text';
  messageBody = '';
  isSendingMessage = false;
  messageFeedback: string | null = null;
  messageHasError = false;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loading = true;
    this.actions = [
      {
        label: 'Send Message',
        icon: 'message',
        action: (contact: Contact) => this.sendMessage(contact)
      }
    ];
    this.apiService.getContacts().pipe(
      tap((contacts) => {
        this.contacts = contacts;
        this.loading = false;
      })
    ).subscribe();
  }

  getHeaders(): string[] {
    return ['Name', 'Email', 'Phone'];
  }

  sendMessage(contact: Contact): void {
    this.selectedContact = contact;
    this.messageType = 'text';
    this.messageBody = '';
    this.messageFeedback = null;
    this.messageHasError = false;
  }

  closeMessageModal(): void {
    if (!this.isSendingMessage) {
      this.selectedContact = null;
    }
  }

  submitMessage(): void {
    const contact = this.selectedContact;
    const body = this.messageBody.trim();
    if (!contact || !body || this.isSendingMessage) {
      return;
    }

    this.isSendingMessage = true;
    this.messageFeedback = null;
    this.messageHasError = false;

    this.apiService.createMessage(contact.id, this.messageType, body).pipe(
      tap({
        next: () => {
          this.messageFeedback = 'Message sent successfully.';
        },
        error: (error) => {
          this.messageHasError = true;
          this.messageFeedback = error?.error?.detail ?? error?.error?.message ?? 'Message could not be sent. Please try again.';
        }
      }),
      catchError((error) => {
        this.messageHasError = true;
        this.messageFeedback ??= error?.error?.detail ?? error?.error?.message ?? 'Message could not be sent. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.isSendingMessage = false;
      })
    ).subscribe();
  }
}
