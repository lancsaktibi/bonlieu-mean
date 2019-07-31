import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  // inject MatDialogModule for popup handling
  constructor(private dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    return next.handle(req).pipe(
      // listen to requests and catch errors
      catchError((error: HttpErrorResponse) => {
        // setup error message
        let errorMessage = 'An unknown error occured!'; // default message
        if (error.error.message) {
          errorMessage = error.error.message; // if there is a real error, pick it
        }

        // pull in dialog.service and ErrorComponent
        // add message in data:
        this.dialog.open(ErrorComponent, {data: {message: errorMessage}});

        // generate new observable with the error and return it
        return throwError(error);
      })
    ); // exit the middleware but before, add error message with pipe()
  }
}
