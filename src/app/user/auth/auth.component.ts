import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRequestDTO } from '../../models/Users/UserRequestDTO.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  authForm: FormGroup;
  isLogin: boolean = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)]]
    });

    this.toggleFormFields();
  }

  toggleMode(preventRedirect: boolean = false) {
    this.isLogin = !this.isLogin;
    this.toggleFormFields();
    if (!preventRedirect) {
      // Esto evita que el formulario se cierre automáticamente
      this.router.navigate(['/auth']);
    }
  }

  toggleFormFields() {
    if (this.isLogin) {
      this.authForm.get('username')?.disable();
      this.authForm.get('phoneNumber')?.disable();
    } else {
      this.authForm.get('username')?.enable();
      this.authForm.get('phoneNumber')?.enable();
    }
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password, username, phoneNumber } = this.authForm.value;

    if (this.isLogin) {
      this.authService.login(email, password).subscribe(
        () => {
          const role = this.authService.getRoleFromToken();
          const destination = role === 'ADMIN' ? '/admin/dashboard' : '/citas-usuario';
          this.router.navigate([destination]);
        },
        (error) => {
          console.error('Login error:', error);
          // Handle login error (e.g., show error message)
        }
      );
    } else {
      const payload: UserRequestDTO = this.getRegistrationPayload();
      this.authService.register(payload).subscribe(
        () => {
          this.router.navigate(['/citas-usuario']);
        },
        (error) => {
          console.error('Registration error:', error);
          // Handle registration error (e.g., show error message)
        }
      );
    }
  }

  private getRegistrationPayload(): UserRequestDTO {
    const { email, password, username, phoneNumber } = this.authForm.value;
    return { email, password, name:username, phone:phoneNumber };
  }

  getFieldError(fieldName: string): string {
    const field = this.authForm.get(fieldName);
    if (field?.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) return `Por favor, ingresa tu ${this.getFieldName(fieldName)} .`;
      if (field.errors?.['email']) return 'Correo electrónico inválido.';
      if (field.errors?.['minlength']) return `${this.getFieldName(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres.`;
      if (field.errors?.['maxlength']) return `${this.getFieldName(fieldName)} no puede tener más de ${field.errors['maxlength'].requiredLength} caracteres.`;
      if (field.errors?.['pattern']) {
        if (fieldName === 'password') return 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial.';
        if (fieldName === 'phoneNumber') return 'Número de teléfono inválido.';
      }
    }
    return '';
  }

  private getFieldName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'correo electrónico',
      password: 'contraseña',
      username: 'nombre de usuario',
      phoneNumber: 'número de teléfono',
    };

    return fieldNames[field] || field;
  }
}
