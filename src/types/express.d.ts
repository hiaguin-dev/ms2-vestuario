
import { TipoUsuario } from "./usuario";

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id_usuario: number;
        tipo: TipoUsuario;
      };
    }
  }
}

export {};
