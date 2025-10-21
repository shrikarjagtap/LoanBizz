import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes'; // make sure you have your routes defined here

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),                          // ✅ Routing support
    provideHttpClient(withInterceptorsFromDi())     // ✅ HttpClient with DI interceptors
  ]
})
.catch((err) => console.error(err));
