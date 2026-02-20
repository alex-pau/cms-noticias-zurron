import {Component, inject, input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray} from '@angular/forms';
import {NoticiaService} from '../../../services/noticia-service';
import {Seccion} from '../../../common/interfaces';
import {Router} from '@angular/router';
import {FormValidators} from '../../../validators/form-validators';
import {LoadingSpinner} from '../../structure/loading-spinner/loading-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-noticia-edit-page',
  imports: [
    ReactiveFormsModule,
    LoadingSpinner,
  ],
  templateUrl: './noticia-edit-page.html',
  styleUrl: './noticia-edit-page.css',
})
export class NoticiaEditPage implements OnInit {
  id = input<string>();

  private readonly noticiaService: NoticiaService = inject(NoticiaService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly router: Router = inject(Router);

  loaded = false;
  seccionesDisponibles: Seccion[] = [];
  mostrarNuevaSeccion = false;

  fechaTexto: string = new Date().toLocaleDateString('es-ES');

  get contenidoPreview(): string {
    const texto = this.contenido.value || '';
    return texto.length > 100 ? texto.substring(0, 100) + '...' : texto;
  }

  iconosDisponibles = [
    'newspaper-outline',
    'globe-outline',
    'trophy-outline',
    'hardware-chip-outline',
    'cash-outline',
    'business-outline',
    'color-palette-outline',
    'flask-outline',
    'heart-outline',
    'book-outline',
    'cloudy-night-outline'
  ];
  formNoticia: FormGroup = this.formBuilder.group({
    _id: [null],
    titulo: ['', [
      Validators.required,
      Validators.minLength(5),
      FormValidators.notOnlyWhiteSpace
    ]],
    subtitulo: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
    autor: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
    contenido: ['', [
      Validators.required,
      Validators.minLength(10),
      FormValidators.notOnlyWhiteSpace
    ]],
    fecha: [new Date()],
    seccion: this.formBuilder.group({
      _id: [null],
      nombre: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
      icono: ['newspaper', [Validators.required]]
    }),
    imagenes: this.formBuilder.array([
      this.formBuilder.control('', [Validators.required, FormValidators.notOnlyWhiteSpace, FormValidators.isImageUrl]),
      this.formBuilder.control('', [Validators.required, FormValidators.notOnlyWhiteSpace, FormValidators.isImageUrl]),
      this.formBuilder.control('', [Validators.required, FormValidators.notOnlyWhiteSpace, FormValidators.isImageUrl])
    ])
  });

  get titulo(): any { return this.formNoticia.get('titulo') };
  get subtitulo(): any { return this.formNoticia.get('subtitulo') };
  get autor(): any { return this.formNoticia.get('autor') };
  get contenido(): any { return this.formNoticia.get('contenido') };
  get imagenes(): FormArray { return this.formNoticia.get('imagenes') as FormArray };
  get seccion(): FormGroup { return this.formNoticia.get('seccion') as FormGroup };

  ngOnInit() {
    this.loadSecciones();

    if (this.id()) {
      console.log('Editando ID:', this.id());
      this.loadNoticia();
    } else {
      console.log('Añadiendo nueva noticia');
      this.loaded = true;
    }
  }

  private loadSecciones() {
    this.noticiaService.getSecciones().subscribe({
      next: result => {
        console.log('Secciones disponibles:', result);
        this.seccionesDisponibles = result.secciones;

        if (this.seccionesDisponibles.length > 0 && !this.mostrarNuevaSeccion) {
          this.seleccionarSeccionExistente(this.seccionesDisponibles[0]);
        }
      },
      error: error => console.error(error)
    });
  }

  private loadNoticia() {
    const id: string = this.id() as string;
    this.noticiaService.getNoticia(id).subscribe({
      next: result => {
        console.log(result);
        const noticia = result.noticia;

        this.formNoticia.patchValue(noticia);
        this.seleccionarSeccionExistente(noticia.seccion);
        this.loaded = true;
      },
      error: error => console.error(error)
    });
  }

  cambiarTipoSeccion(esNueva: boolean): void {
    this.mostrarNuevaSeccion = esNueva;

    if (esNueva) {
      this.seccion.patchValue({
        _id: null,
        nombre: '',
        icono: 'newspaper'
      });
      this.seccion.get('nombre')?.enable();
      this.seccion.get('icono')?.enable();
    } else {
      if (this.seccionesDisponibles.length > 0) {
        this.seleccionarSeccionExistente(this.seccionesDisponibles[0]);
      }
    }
  }

  seleccionarSeccionExistente(sec: Seccion): void {
    this.seccion.patchValue({
      _id: sec._id,
      nombre: sec.nombre,
      icono: sec.icono
    });
    this.seccion.get('nombre')?.disable();
    this.seccion.get('icono')?.disable();
  }

  onSubmit() {
    if (this.formNoticia.invalid) {
      this.formNoticia.markAllAsTouched();
      return;
    }

    if (this.id()) {
      this.noticiaService.updateNoticia(
        this.formNoticia.get('_id')?.value,
        this.formNoticia.getRawValue()
      ).subscribe({
        next: value => {
          Swal.fire({
            title: 'Noticia actualizada',
            text: value.message,
            icon: 'success',
            buttonsStyling: false,
            confirmButtonText: 'Aceptar',
            customClass: { confirmButton: 'btn btn-success' }
          }).then(() => { this.router.navigate(['/noticias/list']); });
        },
        error: error => {
          console.error(error);
          Swal.fire({
            title: 'Error',
            text: 'Error al actualizar: ' + error.message,
            icon: 'error',
            buttonsStyling: false,
            confirmButtonText: 'Aceptar',
            customClass: { confirmButton: 'btn btn-danger' }
          });
        }
      });
    } else {
      this.noticiaService.addNoticia(this.formNoticia.getRawValue()).subscribe({
        next: value => {
          Swal.fire({
            title: 'Noticia guardada',
            text: value.message,
            icon: 'success',
            buttonsStyling: false,
            confirmButtonText: 'Aceptar',
            customClass: { confirmButton: 'btn btn-success' }
          }).then(() => { this.router.navigate(['/noticias/list']); });
        },
        error: error => {
          console.error(error);
          Swal.fire({
            title: 'Error',
            text: 'Error al guardar: ' + error.message,
            icon: 'error',
            buttonsStyling: false,
            confirmButtonText: 'Aceptar',
            customClass: { confirmButton: 'btn btn-danger' }
          });
        }
      });
    }
  }
}
