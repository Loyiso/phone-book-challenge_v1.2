import { Routes } from '@angular/router';
import { ProfileManagementComponent } from './profile/profile-management/profile-management.component';
import { ContactsPageComponent } from './contacts/contacts-page/contacts-page.component';
import { HistoryPageComponent } from './history/history-page/history-page.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/auth-guard.service';
import { SignupComponent } from './signup/signup.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: SignupComponent }
        ]
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'profile', component: ProfileManagementComponent, canActivate: [AuthGuard] },
            { path: 'contacts', component: ContactsPageComponent, canActivate: [AuthGuard] },
            { path: 'history', component: HistoryPageComponent, canActivate: [AuthGuard] }
        ]
    }
];
