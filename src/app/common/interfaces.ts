export interface ApiResponseNoticias {
  status: boolean;
  data: Noticia[];
}

export interface ApiResponseNoticia {
  status: boolean;
  data: Noticia;
}

export interface ApiResponseSecciones {
  status: boolean;
  secciones: Seccion[];
}

export interface ApiResponseMessage {
  status: boolean;
  message: string;
}

export interface ResponsePaginated {
  status: boolean;
  data: Noticia[];
  info: {
    totalNoticias: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}


export interface Noticia {
  _id?: string;
  imagenes: string[];
  titulo: string;
  subtitulo: string;
  seccion: Seccion;
  autor: string;
  fecha?: Date;
  contenido: string;
  comentarios?: Comentario[];
}

export interface Seccion {
  nombre: string;
  icono: string;
}

export interface Comentario {
  nombre: string;
  correo: string;
  texto: string;
  fecha?: Date;
}
