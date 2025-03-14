import { Role } from "../Enumeraciones/role.enum";

export interface UserDetailsResponseDTO{
    uuid:string;
    name:string;
    email:string;
    phone:string;
    rol:Role;
}

// Se utiliza para recibir información completa de un usuario (CRUD).

