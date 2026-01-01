import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, catchError} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Contact, MessageModel} from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5297/api/';

  constructor(private http: HttpClient) {
  }

  isAuthenticated() {
    return localStorage.getItem('last_cookie_update') !== null;
  }

  signup(email: string, password: string, name: string, surname: string): Observable<string> {
    return this.http.post<any>(`${this.apiUrl}auth/register`, {email, password, name, surname}, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response && response.message) {
          return response.message;
        } else {
          return "Sorry, fail to signup";
        }
      })
    );
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}auth/login`, {email, password}, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response && response.user) {
          localStorage.setItem('last_cookie_update', (new Date()).toString());
          localStorage.setItem('user', JSON.stringify(response.user));
          return true;
        } else {
          return false;
        }
      })
    );
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}contacts`, {
        withCredentials: true
      }
    ).pipe();
  }

  getMessages(): Observable<MessageModel[]> {
    return this.http.get<any>(`${this.apiUrl}messages`, {
        withCredentials: true
      }
    ).pipe(
      map(response => response.messages as MessageModel[])
    );
  }

  createMessage(id: number, type: string | null, body: string | null): Observable<MessageModel> {
    return this.http.post<MessageModel>(`${this.apiUrl}messages`,
      {
        contact_id: id,
        type,
        body,
      }, {
        withCredentials: true
      }).pipe(
      catchError((error) => {
        console.error('Error creating message:', error);
        throw error;
      })
    );
  }
}
