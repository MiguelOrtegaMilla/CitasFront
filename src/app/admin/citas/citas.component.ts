import { ChangeDetectorRef, Component , OnInit} from '@angular/core';
import { CitasService } from '../../services/citas/citas.service'; 
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CitasModalComponent } from '../../modals/citas-modal/citas-modal.component';
import { Calendar , CalendarOptions , DateSelectArg, EventClickArg, EventInput  } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EditCitasModalComponent } from '../../modals/edit-citas-modal/edit-citas-modal.component';
import { Observable, of, map, catchError } from 'rxjs';
import { ServiciosService } from '../../services/servicios/servicios.service';
import { FormsModule } from '@angular/forms';
import { AppointmentResponseDTO } from '../../models/Appointment/AppointmentResponseDTO.model';



/*
this.calendarOptions = {
  // ... otras opciones ...
  eventDidMount: function(info) {
    // Cambia el color según el ID del servicio
    const serviceId = info.event.extendedProps.serviceId;
    if (serviceId === 1) {
      info.el.style.backgroundColor = '#ff9999'; // Color para servicioId 1
    } else if (serviceId === 2) {
      info.el.style.backgroundColor = '#99ff99'; // Color para servicioId 2
    } else if (serviceId === 3) {
      info.el.style.backgroundColor = '#9999ff'; // Color para servicioId 3
    }
    // Puedes añadir más condiciones para otros IDs de servicio
  },
  events: this.citas
};
*/

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule , FullCalendarModule , FormsModule],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit {

  calendarOptions: CalendarOptions;

  citas: EventInput[] = [];

  datetime: string = ''; // Modelo para el input de fecha y hora
  citasPorFecha: AppointmentResponseDTO[] = []; // Resultado de la búsqueda


  constructor(
    private citasService: CitasService ,  private modalService: NgbModal , 
    private changeDetectorRef: ChangeDetectorRef , private serviciosService: ServiciosService
  ) { 

    this.calendarOptions = {
      initialView: 'timeGridWeek',
      plugins:[dayGridPlugin , interactionPlugin , timeGridPlugin],
      events: this.citas,
      selectable: true,
      editable: true,
      locale:'es',
      weekends:false,
      allDaySlot:false, 
      slotMinTime: "10:00:00", 
      slotMaxTime: "21:00:00",
      slotDuration: '00:15:00',
      slotLabelInterval: '00:30',
      headerToolbar:{left: 'prev,next today', center: '', right: ''},
      slotLabelFormat:{hour: '2-digit', minute: '2-digit', hour12:false },
      eventTimeFormat:{minute: '2-digit', second: '2-digit', hour12:false},
      businessHours: [ 
        {daysOfWeek: [ 1, 2, 3 , 4 , 5], startTime: '10:00', endTime: '14:00' },
        {daysOfWeek: [ 1 , 2, 3 ,4 , 5], startTime: '17:00', endTime: '21:00' }
      ],
      buttonText: {today: 'Hoy'}, // ¡¡Cambiar el texto del botón 'Today'
      select: this.handleSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      height: 'auto' ,
      longPressDelay: 50, // Mejora la sensibilidad táctil
      eventLongPressDelay: 50,
      selectLongPressDelay: 50,
      eventDidMount: this.handleEventDidMount.bind(this),
    };
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.citasService.getCitas().subscribe({
      next: (appointments: AppointmentResponseDTO[]) => {
        if (!appointments || !Array.isArray(appointments)) {
          console.error("Error: Datos de citas inválidos recibidos");
          return;
        }

        this.citas = this.mapAppointmentsToEvents(appointments);
        this.updateCalendarEvents();
      },
      error: (error) => {
        console.error("Error al cargar las citas:", error);
        alert("Hubo un problema al cargar las citas. Por favor, intenta nuevamente.");
      }
    });
  }

  searchAppointments(): void {
    if (this.datetime) {
      this.citasService.getAppointmentsByDatetime(this.datetime).subscribe((results) => {
        this.citasPorFecha = results;
      });
    }
  }

  private mapAppointmentsToEvents(appointments: AppointmentResponseDTO[]): EventInput[] {
    return appointments
      .filter(appointment => appointment.uuid && appointment.dateTime && appointment.duration)
      .map(appointment => ({
        id: appointment.uuid,
        title: `Servicio ${appointment.serviceName|| 'Desconocido'}`,
        start: appointment.dateTime,
        end: new Date(new Date(appointment.dateTime).getTime() + appointment.duration * 60000).toISOString(),
      }));
  }

  private updateCalendarEvents(): void {
    if (this.calendarOptions.events !== this.citas) {
      this.calendarOptions.events = this.citas;
      this.changeDetectorRef.detectChanges();
    }
  }

  openEditAppointmentModal(appointmentUuid?: string): void {
    const modalRef = this.modalService.open(EditCitasModalComponent, { centered: true });
    modalRef.componentInstance.appointmentId = appointmentUuid;

    modalRef.result.then(
      (result) => {
        if (result === 'updated' || result === 'deleted' || result === 'created') {
          this.loadAppointments();
        }
      },
      () => {} // Dismiss
    );
  }

  // Maneja el clic en un hueco del calendario
  handleSelect(selectInfo: DateSelectArg): void {

    const selectedTime = selectInfo.start;
    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();

    if ((hour === 14 && minute >= 0) || (hour === 15)) {
      alert('El horario seleccionado está fuera del horario de atención. Por favor, selecciona otro.');
      return;
    }

    if (!this.isWithinBusinessHours(selectInfo)) {
      alert('LA horario seleccionado está fuera del horario de atención. Por favor, selecciona otro.');
      return;
    }
    this.openEditAppointmentModal();
    
  }

  // Maneja el clic en una cita existente para editarla
  handleEventClick(eventClickArg: EventClickArg): void {

    const appointmentUuid = eventClickArg.event.id;

    if (!appointmentUuid) {
      this.openEditAppointmentModal(appointmentUuid);
    } else {
      console.error('Invalid appointment ID');
    }
  }

  isWithinBusinessHours(selectInfo: DateSelectArg): boolean {
    const dayOfWeek = selectInfo.start.getDay();
    const hour = selectInfo.start.getHours();
    const minute = selectInfo.start.getMinutes();

    const businessHours = this.calendarOptions.businessHours as { daysOfWeek: number[], startTime: string, endTime: string }[];
    for (const hours of businessHours) {
      if (hours.daysOfWeek.includes(dayOfWeek)) {
        const [startHour, startMinute] = hours.startTime.split(':').map(Number);
        const [endHour, endMinute] = hours.endTime.split(':').map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        const selectedTime = hour * 60 + minute;

        if (selectedTime >= start && selectedTime <= end) {
          return true;
        }
      }
    }
    return false;
  }

  handleEventDidMount(info: any): void {
    const serviceId = info.event.extendedProps.serviceId;
    const colors = {
      1: '#ff9999',
      2: '#99ff99',
      3: '#9999ff'
    };
    info.el.style.backgroundColor = colors[serviceId as keyof typeof colors] || '#3788d8';
  }

  //Metodo inutil por los DTO
  getServiceName(uuid: string):  Observable<string>{

    if (!uuid) {
      console.warn('ID inválido:', uuid);
      return of('ID no válido');
    }

    return this.serviciosService.getServiceById(uuid).pipe(
      map(service => service.name),
      catchError(error => {
        console.error('Error al obtener el nombre del servicio:', error);
        return of('Nombre no disponible');
      })
    );
  }

}
