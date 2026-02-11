import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {
  ApiResponseNoticia,
  ApiResponseNoticias,
  ApiResponseMessage,
  Noticia
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

  addNoticia(noticia: Noticia): Observable<ApiResponseMessage> {
    const { _id, ...noticiaSinId } = noticia;

    return this.httpClient.post<any>(this.urlBase, noticiaSinId).pipe(
      map(res => ({
        status: true,
        message: 'Noticia creada con éxito'
      }))
    );
  }

  updateNoticia(id: string, noticia: Noticia): Observable<ApiResponseMessage> {
    return this.httpClient.put<any>(`${this.urlBase}update/${id}`, noticia).pipe(
      map(res => ({
        status: true,
        message: 'Noticia actualizada correctamente'
      }))
    );
  }

  deleteNoticia(id: string): Observable<ApiResponseMessage> {
    return this.httpClient.delete<ApiResponseMessage>(
      this.urlBase + 'delete/' + id
    );
  }
}
