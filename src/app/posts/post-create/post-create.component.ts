import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  post: Post; // intitalize only, should be public as we need to acess it in .html
  isLoading = false;
  form: FormGroup; // reactive form
  imagePreview: string; // for the image preview
  private mode = 'create'; // be in create mode by default, change it if postId exists
  private postId: string; // initialize only
  private authStatusSub: Subscription; // to store authStatus

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // auth status listener
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false; // any changes in authStatus means false (started with auth=true)
      });

    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true; // enable load spinner
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false; // disable load spinner once subscribe completed
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            owner: postData.owner
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file}); // update !only! image control with the extracted file
    this.form.get('image').updateValueAndValidity(); // call auto validator to check for correct type etc.
    const reader = new FileReader(); // to generate file url for the preview
    reader.onload = () => {
      this.imagePreview = reader.result as string; // after image loaded, store url
    };
    reader.readAsDataURL(file); // this is to trigger the load into a file url
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      console.log('ng create mode');
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image);
    } else {
      console.log('ng edit mode');
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset(); // to clear data after submission
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
