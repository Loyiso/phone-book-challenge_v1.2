import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Observable, catchError} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Contact, MessageModel} from '../models/contact.model';

export interface UserProfile {
  name: string;
  surname: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5297/api/';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {
  }

  isAuthenticated() {
    return isPlatformBrowser(this.platformId) && localStorage.getItem('last_cookie_update') !== null;
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

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}users/me`, {
      withCredentials: true
    });
  }

  updateProfile(name: string, surname: string, email: string): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}users/me/profile`, {
      name,
      surname,
      email,
    }, {
      withCredentials: true
    });
  }

  updatePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}users/me/password`, {
      currentPassword,
      newPassword,
      confirmNewPassword,
    }, {
      withCredentials: true
    });
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}contacts`, {
        withCredentials: true
      }
    ).pipe();
  }

  getMessages(): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(`${this.apiUrl}messages`, {
        withCredentials: true
      }
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
