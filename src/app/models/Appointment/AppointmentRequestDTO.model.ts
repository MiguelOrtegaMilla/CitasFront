export interface AppointmentRequestDTO{
    userUuid:string;
    serviceUuid:string;
    dateTime:string;
}

//TODO y hacer compatible el formato LocalDateTime del backend con el string del frontend

/*
EL TODO de arriba no es necesario ya que el campo LocalDateTime se serializa automaticamente
a un formato ISO String:  "2023-01-09T12:34:56"
*/