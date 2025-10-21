# LoanbizzV18

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.21.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


BACKEND:
npm install express mongoose cors dotenv body-parser bcryptjs
Explanation:

express → server

mongoose → connect to MongoDB

cors → allow Angular to talk to backend

dotenv → store secrets like DB link safely

body-parser → read POST request body

bcryptjs → encrypt passwords



The usage of AuthGuard :

Protect routes from unauthorized access – Blocks pages like Home, View Loans, Add Loan Forms if the user is not logged in.

Prevent manual URL access – Stops users from typing protected URLs directly in the browser.

Adds extra layer of security with AppComponent checks – Works alongside AppComponent token check to ensure user cannot access protected pages.

Future-proofing – Can be extended for roles or permissions (e.g., admin, premium users) without changing components.

Optional login/register protection – Can prevent already logged-in users from visiting login or register pages unnecessarily.