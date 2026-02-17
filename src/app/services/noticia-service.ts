import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApiResponseNoticia,
  ApiResponseNoticias,
  ApiResponseMessage,
  Noticia, ApiResponseSecciones
} from '../common/interfaces';

@Injectable({
  providedIn: 'root',
})
export class NoticiaService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly urlBase: string = 'http://localhost:3000/noticias/';

  getNoticias(): Observable<ApiResponseNoticias> {
    return this.httpClient.get<ApiResponseNoticias>(
      this.urlBase + 'page?page=1&limit=10'
    );
  }

  getNoticia(id: string): Observable<ApiResponseNoticia> {
    return this.httpClient.get<ApiResponseNoticia>(
      this.urlBase + 'noticia/' + id
    );
  }

  getSecciones(): Observable<ApiResponseSecciones> {
    return this.httpClient.get<ApiResponseSecciones>(
      this.urlBase + 'secciones'
    );
  }

  addNoticia(noticia: Noticia): Observable<ApiResponseMessage> {
    const { _id, ...noticiaSinId } = noticia;
    return this.httpClient.post<ApiResponseMessage>(
      this.urlBase,
      noticiaSinId
    );
  }

  updateNoticia(id: string, noticia: Noticia): Observable<ApiResponseMessage> {
    return this.httpClient.put<ApiResponseMessage>(
      this.urlBase + 'update/' + id,
      noticia
    );
  }

  deleteNoticia(id: string): Observable<ApiResponseMessage> {
    return this.httpClient.delete<ApiResponseMessage>(
      this.urlBase + 'delete/' + id
    );
  }


}
