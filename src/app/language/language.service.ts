import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable ({ providedIn: 'root' })
export class LanguageService {
  private headerLang = {};
  private listLang = {};
  private createLang = {};
  private authLang = {};

  // create new Subject for lang observables
  private headerLangListener = new Subject<any>();
  private listLangListener = new Subject<any>();
  private createLangListener = new Subject<any>();
  private authLangListener = new Subject<any>();

  getHeaderLangListener() {
    return this.headerLangListener.asObservable();
  }

  getListLangListener() {
    return this.listLangListener.asObservable();
  }

  getCreateLangListener() {
    return this.createLangListener.asObservable();
  }

  getauthLangListener() {
    return this.authLangListener.asObservable();
  }

  onLang(lang: any) {
    if (lang === 'EN') {
        this.headerLang = {
          lang: 'HU',
          button: 'Switch to English',
          login: 'Belépés',
          signup: 'Regisztráció',
          newPost: 'Új cikk',
          logout: 'Kilépés'
        };
        this.listLang = {
          lang: 'HU',
          update: 'Frissítés',
          delete: 'Törlés'
        };
        this.createLang = {
          lang: 'HU',
          save: 'Cikk mentése',
          pick: 'Válassz képet!'
        };
        this.authLang = {
          lang: 'HU',
          login: 'Belépés',
          signup: 'Regisztráció',
          password: 'Jelszó'
        };
        this.saveLangData('HU');
    } else {
        this.headerLang = {
          lang: 'EN',
          button: 'váltás magyarra',
          login: 'Login',
          signup: 'Signup',
          newPost: 'New Post',
          logout: 'Logout'
        };
        this.listLang = {
          lang: 'EN',
          update: 'Update',
          delete: 'Delete'
        };
        this.createLang = {
          lang: 'EN',
          save: 'Save Post',
          pick: 'Pick Image'
        };
        this.authLang = {
          lang: 'EN',
          login: 'Login',
          signup: 'Signup',
          password: 'Password'
        };
        this.saveLangData('EN');
    }
    this.headerLangListener.next(this.headerLang); // spread value
    this.listLangListener.next(this.listLang); // spread value
    this.createLangListener.next(this.createLang); // spread value
    this.authLangListener.next(this.authLang); // spread value
  }

  private saveLangData(lang: string) {
    localStorage.setItem('lang', lang);
  }

  getLangData() {
    const storedLang = localStorage.getItem('lang');
    const defaultLang = 'EN';
    if (!storedLang) {
      return defaultLang;
    }
    return storedLang;
  }
}


