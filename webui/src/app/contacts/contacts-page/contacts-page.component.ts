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

  sendMessage(contact: Contact) {
    const type = prompt('Enter message type (text or email):');
    const body = prompt('Enter message body:');

    if (!type || !body) {
      console.error('Message type and body are required');
      return;
    }

    this.apiService.createMessage(contact.id, type, body).pipe(
      tap({
        next: (message) => {
          console.log('Message sent successfully:', message);
        },
        error: (error) => {
          console.error('Failed to send message:', error);
        }
      }),
      catchError((error) => {
        return EMPTY;
      }),
      finalize(() => {
      })
    ).subscribe();
  }
}
