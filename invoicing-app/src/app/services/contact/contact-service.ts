import { inject, Injectable } from '@angular/core';
import { Api } from '../api/api';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  api = inject(Api);

  async submitForm(submitForm: { name: string; email: string; message: string }): Promise<string> {
    const url = `${environment.apiUrl}/contact/send`;
    let resp = await this.api.PostPublic(url, submitForm);
    console.log('email response', resp);

    return resp;
  }
}
