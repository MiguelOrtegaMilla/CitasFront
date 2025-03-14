export interface FullCalendarDTO{
    id: string; //UUID del evento (cita) que fullcalendar interpreta como id
    title: string; 
    start: String;
    end: String;
}

//DTO usado para cargar la informacion de los eventos de fullcalendar