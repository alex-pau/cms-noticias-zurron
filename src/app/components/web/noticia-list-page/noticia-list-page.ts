import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NoticiaService } from '../../../services/noticia-service';
import { Noticia } from '../../../common/interfaces';
import { RouterLink } from '@angular/router';
import {DatePipe, SlicePipe} from '@angular/common';
import { LoadingSpinner } from '../../structure/loading-spinner/loading-spinner';
import 'bootstrap/dist/css/bootstrap.css'
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
    Swal.fire({
      title: '¿Eliminar noticia?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false, // ← Desactiva los estilos predeterminados de SweetAlert2
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-danger me-2', // ← Aplica clases de Bootstrap al botón confirmar
        cancelButton: 'btn btn-secondary',     // ← Aplica clases de Bootstrap al botón cancelar
        loader: 'custom-loader'                // ← Clase personalizada para el spinner (opcional)
      },
      loaderHtml: '<div class="spinner-border text-danger"></div>', // ← Spinner de Bootstrap mientras carga
      preConfirm: () => { // ← Función que se ejecuta al confirmar, ANTES de cerrar el modal
        Swal.showLoading(); // ← Muestra el spinner (loaderHtml)

        // Aquí va tu lógica de eliminación
        return this.noticiaService.deleteNoticia(id).toPromise()
          .then(result => {
            return result; // ← Devuelve el resultado para usarlo en .then()
          })
          .catch(error => {
            Swal.showValidationMessage(`Error: ${error.message || 'No se pudo eliminar'}`);
            throw error; // ← Muestra error sin cerrar el modal
          });
      }
    }).then((result) => {
      if (result.isConfirmed) { // ← Solo entra aquí si preConfirm se completó exitosamente
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
  }  search(event: any) {
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
