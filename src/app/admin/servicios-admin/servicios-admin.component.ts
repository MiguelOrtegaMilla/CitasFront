import { Component , OnInit } from '@angular/core';
import { Servicios } from '../../models/servicios.model'; 
import { ServiciosService } from '../../services/servicios/servicios.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceResponseDTO } from '../../models/Service/ServiceResponseDTO.model';
import { ServiceRequestDTO } from '../../models/Service/ServiceRequestDTO.model';


@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule , FormsModule , ReactiveFormsModule],
  templateUrl: './servicios-admin.component.html',
  styleUrl: './servicios-admin.component.css'
})
export class ServiciosAdminComponent implements OnInit{

  services: ServiceResponseDTO[] = [];
  selectedService: ServiceResponseDTO | null = null;
  serviceForm: FormGroup;

  constructor(private serviciosService: ServiciosService, private fb: FormBuilder) {
    // Inicializa el formulario con las validaciones necesarias
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      duration: [
        '',
        [Validators.required, Validators.min(1), Validators.max(480)],
      ], // 1-480 minutos
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.serviciosService.getAllServices().subscribe(
      (data) => (this.services = data.services),
      (error) => console.error('Error al cargar servicios', error)
    );
  }

 // Método para abrir el formulario en modo edición
  openEdit(service: ServiceResponseDTO): void {
    this.selectedService = service;
    this.serviceForm.patchValue(service); // Rellena el formulario con los datos del servicio seleccionado
  }

  // Método para limpiar el formulario y la selección
  clearForm(): void {
    this.selectedService = null;
    this.serviceForm.reset();
  }


  saveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      return;
    }

    const serviceData: ServiceRequestDTO = this.serviceForm.value;

    if (this.selectedService) {
      // Si hay un servicio seleccionado, realiza una actualización
      this.serviciosService
        .updateService(this.selectedService.uuid!, serviceData)
        .subscribe(
          () => {
            this.loadServices();
            this.clearForm();
          },
          (error) => console.error('Error al actualizar servicio', error)
        );
    } else {
      // Si no hay servicio seleccionado, crea un nuevo servicio
      this.serviciosService.createService(serviceData).subscribe(
        () => {
          this.loadServices();
          this.clearForm();
        },
        (error) => console.error('Error al crear servicio', error)
      );
    }
  }

  // Método para eliminar un servicio
  deleteService(uuid: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.serviciosService.deleteService(uuid).subscribe(
        () => this.loadServices(),
        (error) => console.error('Error al eliminar servicio', error)
      );
    }
  }

  // Métodos de validación para acceder a los errores de los campos desde la plantilla
  get name() {
    return this.serviceForm.get('name');
  }

  get description() {
    return this.serviceForm.get('description');
  }

  get duration() {
    return this.serviceForm.get('duration');
  }

  get price() {
    return this.serviceForm.get('price');
  }

}
