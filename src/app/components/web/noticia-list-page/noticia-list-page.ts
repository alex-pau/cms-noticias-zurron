import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NoticiaService } from '../../../services/noticia-service';
import { Noticia } from '../../../common/interfaces';
import { RouterLink } from '@angular/router';
import {DatePipe, SlicePipe} from '@angular/common';
import { LoadingSpinner } from '../../structure/loading-spinner/loading-spinner';

@Component({
  selector: 'app-noticia-list-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    SlicePipe,
    LoadingSpinner
  ],
  templateUrl: './noticia-list-page.html',
  styleUrl: './noticia-list-page.css',
})
export class NoticiaListPage implements OnInit {
  private readonly noticiaService: NoticiaService = inject(NoticiaService);

  // Usamos el Signal con la interfaz Noticia
  noticiaList: WritableSignal<Noticia[]> = signal<Noticia[]>([]);
  loaded = false;

  ngOnInit() {
    this.loadNoticias();
  }

  private loadNoticias() {
    this.noticiaService.getNoticias().subscribe({
      next: result => {
        // CAMBIO CLAVE: Ahora usamos .data porque tu interfaz es ApiResponseNoticias
        // result es de tipo ApiResponseNoticias, y dentro tiene .data (el array)
        this.noticiaList.set(result.data);
        this.loaded = true;
      },
      error: error => {
        console.error('Error al cargar noticias:', error);
      }
    });
  }

  deleteNoticia(id: string) {
    if (confirm('¿Estás seguro de que deseas borrar esta noticia?')) {
      this.noticiaService.deleteNoticia(id).subscribe({
        next: result => {
          // Volvemos a cargar la lista
          this.loadNoticias();
          // CAMBIO: Usamos .message de la respuesta de tu API (ApiResponseMessage)
          alert(result.message);
        },
        error: error => {
          console.error('Error al borrar:', error);
        }
      });
    }
  }

  search(event: any) {
    const word = event.target.value.toLowerCase() as string;

    if (word === '') {
      this.loadNoticias();
      return;
    }

    // Filtro mejorado siguiendo la lógica del profesor pero aplicada a tus campos
    this.noticiaList.update(noticias => noticias.filter(
      n =>
        n.titulo.toLowerCase().includes(word) ||
        n.autor.toLowerCase().includes(word) ||
        n.seccion.nombre.toLowerCase().includes(word) ||
        n.subtitulo.toLowerCase().includes(word) ||
        n.contenido.toLowerCase().includes(word)
    ));
  }
}
