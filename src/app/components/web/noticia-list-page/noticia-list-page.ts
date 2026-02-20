import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {NoticiaService} from '../../../services/noticia-service';
import {Noticia} from '../../../common/interfaces';
import {RouterLink} from '@angular/router';
import {DatePipe, SlicePipe} from '@angular/common';
import {LoadingSpinner} from '../../structure/loading-spinner/loading-spinner';
import Swal from 'sweetalert2';

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

  noticiaList: WritableSignal<Noticia[]> = signal<Noticia[]>([]);
  loaded = false;

  ngOnInit() {
    this.loadNoticias();
  }

  private loadNoticias() {
    this.noticiaService.getNoticias().subscribe({
      next: result => {
        this.noticiaList.set(result.noticias);
        this.loaded = true;
      },
      error: error => {
        console.error(error);
      }
    });
  }


  deleteNoticia(id: string) {
    //innovacion sweetalerts
    Swal.fire({
      title: '¿Eliminar noticia?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-danger me-2',
        cancelButton: 'btn btn-secondary',
        loader: 'custom-loader'
      },
      loaderHtml: '<div class="spinner-border text-danger"></div>',
      preConfirm: () => {
        Swal.showLoading();

        return this.noticiaService.deleteNoticia(id).toPromise()
          .then(result => {
            return result;
          })
          .catch(error => {
            Swal.showValidationMessage(`Error: ${error.message || 'No se pudo eliminar'}`);
            throw error;
          });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadNoticias();

        Swal.fire({
          title: 'Noticia eliminada',
          text: result.value?.message || 'Noticia eliminada con éxito',
          icon: 'success',
          buttonsStyling: false,
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn btn-success'
          }
        });
      }
    });
  }

  search(event: any) {
    const word = event.target.value.toLowerCase() as string;

    if (word === '') {
      this.loadNoticias();
      return;
    }

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
