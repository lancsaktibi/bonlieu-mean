import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {

  // check if filetype is string -- this happens if file is not updated
  if (typeof(control.value) === 'string') {
    return of(null);
  }

  const file = control.value as File;
  const fileReader = new FileReader();

  // we need to create an observable as mimeType should have it as a return value
  const frObs = new Observable((observer: Observer<{ [key: string]: any }>) => {
    fileReader.addEventListener('loadend', () => {

      // create an unsigned 8 bit array for the arrayBuffer
      // subarray (0, 4) contains the mimetype in the file
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);

      // check through the subarray
      let header = '';
      let isValid = false;
      for (let i = 0; i < arr.length; i++) {

        // attach char in hex to the header string
        header += arr[i].toString(16);
      }

      // magic numbers - file signatures
      switch (header) {
        case '89504e47': // .png
          isValid = true;
          break;
        case 'ffd8ffe0': // .jpg
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }

      // omit response data
      if (isValid) {
        observer.next(null); // omit null if mime type is valid -- equals no error in response
      } else {
        observer.next({ invalidMimeType: true }); // omit error code
      }
      observer.complete(); // let subscribers know we are done
    });

    fileReader.readAsArrayBuffer(file); // this triggers the load -- arraybuffer needed to determine mimetype
  });

  return frObs; // return the observable to the mimeType const
};
