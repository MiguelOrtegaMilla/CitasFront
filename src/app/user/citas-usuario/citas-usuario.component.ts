import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../services/citas/citas.service'; 
import { Appointment } from '../../models/cita.model';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Calendar, CalendarOptions , DateSelectArg, EventClickArg, EventInput  } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CitasModalComponent } from '../../modals/citas-modal/citas-modal.component';
import { ServiciosService } from '../../services/servicios/servicios.service';
import { catchError, map, Observable, of } from 'rxjs';
import { AppointmentResponseDTO } from '../../models/Appointment/AppointmentResponseDTO.model';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-citas-usuario',
  standalone: true,
  imports: [CommonModule , FullCalendarModule],
  templateUrl: './citas-usuario.component.html',
  styleUrl: './citas-usuario.component.css'
})
export class CitasUsuarioComponent implements OnInit{

  calendarOptions: CalendarOptions;

  citas: EventInput[] = [];

  occupiedTimes: EventInput[] = []; // Para horarios ocupados

  constructor(
    private citasService: CitasService, 
    private modalService: NgbModal , 
    private serviciosService: ServiciosService,
    private authService: AuthService) {

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
      slotDuration: '01:00:00',
      slotLabelInterval: '01:00',
      headerToolbar:{left: 'prev,next today', center: '', right: ''},
      slotLabelFormat:{hour: '2-digit', minute: '2-digit', hour12:false },
      eventTimeFormat:{minute: '2-digit', second: '2-digit', hour12:false},
      businessHours: [ 
        {daysOfWeek: [ 1, 2, 3 , 4 , 5], startTime: '10:00', endTime: '14:00' },
        {daysOfWeek: [ 1 , 2, 3 ,4 , 5], startTime: '17:00', endTime: '21:00' }
      ],
      buttonText: {today: 'Hoy'}, //Cambiar el texto del botón 'Today'
      select: this.handleSelect.bind(this),
      height: 'auto' ,
      longPressDelay: 50, // Mejora la sensibilidad táctil
      eventLongPressDelay: 50,
      selectLongPressDelay: 50,
    };
  }

  ngOnInit() {
    this.loadAppointments();
  }

  /*
  Metodo reemplazado por loadOccupiedTimes

  loadAppointments(): void {
    this.citasService.getCitas().subscribe({
      next: (appointments: AppointmentResponseDTO[]) => {
        if (!appointments || !Array.isArray(appointments)) {
          console.error("Error: Datos de citas inválidos recibidos");
          return;
        }
  
        this.citas = appointments
          .filter(appointment => appointment.uuid && appointment.dateTime && appointment.duration) // Validar campos esenciales
          .map(appointment => ({
            uuid: appointment.uuid,
            title: `Servicio ${appointment.serviceName || 'Desconocido'}`,
            start: appointment.dateTime,
            end: new Date(new Date(appointment.dateTime).getTime() + appointment.duration * 60000).toISOString()
          }));
  
        // Asigna las citas a los eventos del calendario
        this.calendarOptions.events = this.citas;
      },
      error: (error) => {
        console.error("Error al cargar las citas:", error);
        alert("Hubo un problema al cargar las citas. Por favor, intenta nuevamente.");
      }
    });
  }
  */

  /* Metodo reemplazado por loadAppointments
  private async loadOccupiedTimes(): Promise<void> {
    try {
      const occupiedTimes = await this.citasService.getOccupiedTimes().toPromise();
      if (occupiedTimes && Array.isArray(occupiedTimes)) {
        this.occupiedTimes = occupiedTimes.map(time => ({
          start: time.start,
          end: time.end,
          display: 'background', // Para que aparezcan como fondo
          color: 'red' // Color para horarios ocupados
        }));
      } else {
        this.occupiedTimes = []; // Inicializa como un array vacío si no hay ocupados
        console.warn('No se encontraron horarios ocupados o el formato es incorrecto.');
      }
      this.calendarOptions.events = [...this.citas, ...this.occupiedTimes]; // Combina eventos y horarios ocupados
    } catch (error) {
      console.error('Error loading occupied times:', error);
      alert('No se pudieron cargar los horarios ocupados. Por favor, intenta más tarde.');
    }
  }
  */

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

  loadAppointments(): void {
    this.citasService.getCitas().subscribe({
      next: (appointments: AppointmentResponseDTO[]) => {
        if (!appointments || !Array.isArray(appointments)) {
          console.error("Error: Datos de citas inválidos");
          return;
        }
  
        // Ordenar citas por hora de inicio
        const sortedAppointments = appointments
          .filter(app => app.dateTime && app.duration)
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  
        this.citas = sortedAppointments.map(appointment => ({
          uuid: appointment.uuid,
          title: `Servicio ${appointment.serviceName || 'Desconocido'}`,
          start: appointment.dateTime,
          end: new Date(new Date(appointment.dateTime).getTime() + appointment.duration * 60000).toISOString()
        }));
  
        // Calcular los horarios disponibles basados en citas previas
        this.calculateAvailableSlots(sortedAppointments);
  
        // Asigna las citas al calendario
        this.calendarOptions.events = this.citas;
      },
      error: (error) => {
        console.error("Error al cargar las citas:", error);
        alert("Hubo un problema al cargar las citas. Por favor, intenta nuevamente.");
      }
    });
  }
  
  
  // Maneja la selección de una fecha para crear una cita
  handleSelect(selectInfo: DateSelectArg): void {

    const selectedTime = selectInfo.start;
    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();

    if ((hour === 14 && minute >= 0) || (hour === 15)) {
      alert('El horario seleccionado está fuera del horario de atención. Por favor, selecciona otro.');
      return;
    }

    if (!this.isWithinBusinessHours(selectInfo)) {
      alert('El horario seleccionado está fuera del horario de atención. Por favor, selecciona otro.');
      return;
    }
    this.openCreateAppointmentModal(selectInfo);
    
  }

  openCreateAppointmentModal (selectInfo: DateSelectArg): void {

    const modalRef = this.modalService.open(CitasModalComponent, { centered: true });
    modalRef.componentInstance.dateTime = selectInfo.startStr; // Pasar fecha seleccionada al modal

    modalRef.result.then(
      (result) => {
        if (result === 'created') {
          this.loadAppointments(); // Recarga las citas en el calendario
        }
      },
      (reason) => {}
    );

  }

  //Inutil con el uso de los DTO
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

  private calculateAvailableSlots(appointments: AppointmentResponseDTO[]): void {
    const availableSlots: Date[] = [];
    const workDayStart = [8, 0]; // 08:00
    const workDayAfternoon = [17, 0]; // 17:00
    const workDayEnd = [20, 0]; // 20:00 (hora máxima para citas)
  
    // Agrupar citas por día (Map con clave de fecha y valor de lista de AppointmentResponseDTO)
    const groupedByDay = new Map<string, AppointmentResponseDTO[]>();
  
    appointments.forEach(app => {
      const dayKey = new Date(app.dateTime).toISOString().split('T')[0]; // YYYY-MM-DD
  
      if (!groupedByDay.has(dayKey)) groupedByDay.set(dayKey, []);
      groupedByDay.get(dayKey)?.push(app);
    });
  
    // Generar horarios permitidos
    const today = new Date();
    for (let i = 0; i < 5; i++) { // 5 días de la semana
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + i);
      currentDay.setHours(workDayStart[0], workDayStart[1], 0, 0);
  
      const dayKey = currentDay.toISOString().split('T')[0];
  
      // Siempre permitir los horarios iniciales (08:00 y 17:00)
      availableSlots.push(new Date(currentDay));
      const afternoonSlot = new Date(currentDay);
      afternoonSlot.setHours(workDayAfternoon[0], workDayAfternoon[1]);
      availableSlots.push(afternoonSlot);
  
      if (groupedByDay.has(dayKey)) {
        // Ordenar citas del día por hora de inicio
        const appointmentsOfDay = groupedByDay.get(dayKey)!;
        appointmentsOfDay.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  
        // Tomar la última cita del día
        const lastAppointment = appointmentsOfDay[appointmentsOfDay.length - 1];
        const lastAppointmentEnd = new Date(new Date(lastAppointment.dateTime).getTime() + lastAppointment.duration * 60000);
  
        // Agregar el siguiente hueco disponible
        if (lastAppointmentEnd.getHours() < workDayEnd[0]) { // Asegurar que no pase del final del día
          availableSlots.push(lastAppointmentEnd);
        }
      }
    }
  
    // Configurar FullCalendar para permitir solo los horarios disponibles
    this.calendarOptions.selectAllow = (selectInfo) => {
      return availableSlots.some(slot =>
        slot.getTime() === selectInfo.start.getTime()
      );
    };
  }


  private async getServiceDuration(serviceUuid: string): Promise<number | undefined> {
    return this.serviciosService.getServiceById(serviceUuid).pipe(
      map(service => service.duration),
      catchError(error => {
        console.error(`Error obteniendo duración del servicio ${serviceUuid}:`, error);
        return of(45); // Duración en min por defecto si hay error
      })
    ).toPromise();
  }

}
  

