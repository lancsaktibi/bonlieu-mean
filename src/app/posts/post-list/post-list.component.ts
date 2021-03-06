import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { LanguageService } from '../../language/language.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0; // total posts initial value for paginator
  postsPerPage = 2; // items per page for paginator
  pageSizeOptions = [1, 2, 5, 10]; // options for user to show items for paginator
  currentPage = 1; // initial value for paginator
  userIsAuthenticated = false; // public authStatus
  userId: string; // public userId
  private postsSub: Subscription;
  private authStatusSub: Subscription; // private authStatus
  private listLangListenerSubs: Subscription; // to handle lang change
  listLang: any; // to store language string

  constructor(
    public postsService: PostsService,
    private authService: AuthService,
    private languageService: LanguageService) {}

  ngOnInit() {
    this.isLoading = true; // to show spinner
    this.postsService.getPosts(this.postsPerPage, this.currentPage); // triggers getPost -- with paginator init params
    this.userId = this.authService.getUserId(); // get userID from login/backend
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], postCount: number}) => {
        this.isLoading = false; // to hide spinner once subscribe completed
        this.totalPosts = postData.postCount; // to set total posts as received from backend
        this.posts = postData.posts; // replace original posts with the received array, store data in subscription property (no mem leak)
      });

    // get and store authStatus -- for intial load
    this.userIsAuthenticated = this.authService.getIsAuth();

    // get and store authStatus -- works only for status changes
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId(); // look for updates in userID
    });

    // set languageSubs to the current value from the subscription
    this.listLangListenerSubs = this.languageService.getListLangListener()
      .subscribe(
        listLang => {
          this.listLang = listLang; // load values from the service subscription
        }
      );

    // get default language settings from service
    this.languageService.onLang('EN');
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true; // to show spinner
    this.currentPage = pageData.pageIndex + 1; // user input, but +1 as backend starts with 1 not 0
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage); // trigger getPosts with user params
  }

  onDelete(postId: string) {
    this.isLoading = true; // to show spinner
    this.postsService.deletePost(postId).subscribe(() => {
      // as we used a return function in service.ts deletePost(), on completion we run a getPosts() here
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      // second argument for error handling
      this.isLoading = false; // close spinner in case of error
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe(); // deactivate subscription when component destroyed
    this.authStatusSub.unsubscribe(); // clear subscription of authStatus (own method)
    this.listLangListenerSubs.unsubscribe();
  }
}
