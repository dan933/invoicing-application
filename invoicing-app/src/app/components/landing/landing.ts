import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactService } from '../../services/contact/contact-service';

@Component({
  selector: 'app-landing',
  imports: [FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  router: Router = inject(Router);
  fb = inject(FormBuilder);
  contactService = inject(ContactService);
  // 753 px and above desktop 145px padding top 195px padding bottom
  screenWidth = signal(window.innerWidth);
  contactLoading = signal(false);
  contactSuccess = signal(false);
  contactError = signal(false);

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    message: ['', Validators.required],
  });

  private toggleFormState(disabled: boolean) {
    if (disabled) {
      this.contactForm.disable();
    } else {
      this.contactForm.enable();
    }
  }

  tryDemo() {
    this.router.navigate(['/customers']);
  }

  async submitForm() {
    this.contactLoading.set(true);
    this.contactSuccess.set(false);
    this.contactError.set(false);
    this.toggleFormState(true);
    let formControls = this.contactForm.controls;
    if (!formControls.name.value || !formControls.email.value || !formControls.message.value) {
      return;
    }

    let resp = await this.contactService
      .submitForm({
        name: formControls.name.value,
        email: formControls.email.value,
        message: formControls.message.value,
      })
      .finally(() => {
        this.toggleFormState(false);
        this.contactLoading.set(false);
      })
      .catch(() => {
        this.contactError.set(true);
      });

    if (resp) {
      this.contactForm.reset();
      this.contactSuccess.set(true);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}
