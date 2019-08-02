import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from './post.model';
import { environment } from 'src/environments/environment';

// global variable for url
const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>(); // create a copy of the array

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map(post => {
              return {
                titleHu: post.titleHu,
                titleEn: post.titleEn,
                contentHu: post.contentHu,
                contentEn: post.contentEn,
                id: post._id,
                imagePath: post.imagePath,
                owner: post.owner
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        }); // update the copy of the array, spread it through the app
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable(); // listens to requests, returns the copy of the array
  }

  // to get a single post for edit
  getPost(id: string) {
    return this.http.get<{
      _id: string,
      titleHu: string,
      titleEn: string,
      contentHu: string,
      contentEn: string,
      imagePath: string,
      owner: string
    }>(BACKEND_URL + id);
  }

  addPost(titleHu: string, titleEn: string, contentHu: string, contentEn: string, image: File) {
    // get data with formData method
    const postData = new FormData();
    postData.append('titleHu', titleHu);
    postData.append('titleEn', titleEn);
    postData.append('contentHu', contentHu);
    postData.append('contentEn', contentEn);
    postData.append('image', image, titleEn); // title will be the filename of the image
    postData.append('owner', null); // send empty string as owner (handled on backend)
    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.router.navigate(['/']); // redirect -- onInit() will reload the posts anyhow (here was a reload script but no more needed)
      });
  }

  updatePost(
    id: string,
    titleHu: string,
    titleEn: string,
    contentHu: string,
    contentEn: string,
    image: File | string
  ) {

    // check whether we have a new file or only a link in image
    let postData: FormData | Post;
    if (typeof(image) === 'object' ) {
      // get data with formData method
      postData = new FormData();
      postData.append('id', id); // this is to keep the old id in mongo
      postData.append('titleHu', titleHu);
      postData.append('titleEn', titleEn);
      postData.append('contentHu', contentHu);
      postData.append('contentEn', contentEn);
      postData.append('image', image, titleEn); // title will be the filename of the image
    } else {
        postData = {
          id,
          titleHu,
          titleEn,
          contentHu,
          contentEn,
          imagePath: image,
          owner: null
        };
    }

    this.http.put(BACKEND_URL + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']); // redirect -- onInit() will reload the posts anyhow (here was a reload script but no more needed)
      });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
    // continue in list.ts onDelete() as we need to refetch posts there
  }
}
