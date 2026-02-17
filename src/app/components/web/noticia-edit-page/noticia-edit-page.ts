import {Component, inject, input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray} from '@angular/forms';
import {NoticiaService} from '../../../services/noticia-service';
import {Noticia, Seccion} from '../../../common/interfaces';
import {Router} from '@angular/router';
import {FormValidators} from '../../../validators/form-validators';
import {LoadingSpinner} from '../../structure/loading-spinner/loading-spinner';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-noticia-edit-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LoadingSpinner,
    DatePipe
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

  iconosDisponibles = [
    {nombre: 'Noticias', clase: 'bi-newspaper'},
    {nombre: 'Mundial', clase: 'bi-globe'},
    {nombre: 'Deportes', clase: 'bi-trophy'},
    {nombre: 'Tecnología', clase: 'bi-cpu'},
    {nombre: 'Economía', clase: 'bi-currency-dollar'},
    {nombre: 'Política', clase: 'bi-building'},
    {nombre: 'Cultura', clase: 'bi-palette'},
    {nombre: 'Ciencia', clase: 'bi-graph-up'},
    {nombre: 'Salud', clase: 'bi-heart-pulse'},
    {nombre: 'Educación', clase: 'bi-book'},
    {nombre: 'Clima', clase: 'bi-cloud-sun'},
    {nombre: 'Música', clase: 'bi-music-note-beamed'}
  ];

  formNoticia: FormGroup = this.formBuilder.group({
    _id: [''],
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
      _id: [null], // <--- IMPORTANTE: Si no está aquí, Angular lo borra al enviar
      nombre: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
      icono: ['bi-newspaper', [Validators.required]]
    }),
    imagenes: this.formBuilder.array([
      this.formBuilder.control('', [
        Validators.required,
        FormValidators.notOnlyWhiteSpace,
        FormValidators.isImageUrl
      ])
    ])
  });

  get titulo(): any {
    return this.formNoticia.get('titulo');
  }

  get subtitulo(): any {
    return this.formNoticia.get('subtitulo');
  }

  get autor(): any {
    return this.formNoticia.get('autor');
  }

  get contenido(): any {
    return this.formNoticia.get('contenido');
  }

  get imagenes(): FormArray {
    return this.formNoticia.get('imagenes') as FormArray;
  }

  get seccion(): FormGroup {
    return this.formNoticia.get('seccion') as FormGroup;
  }

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

        // Seleccionar la primera sección por defecto al cargar
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
        const noticia = result.data;

        // Sincronizamos el FormArray de imágenes
        while (this.imagenes.length < noticia.imagenes.length) {
          this.addImagen();
        }

        this.formNoticia.patchValue(noticia);
        this.loaded = true;
      },
      error: error => console.error(error)
    });
  }


  cambiarTipoSeccion(esNueva: boolean): void {
    this.mostrarNuevaSeccion = esNueva;

    if (esNueva) {
      this.seccion.patchValue({
        _id: null, // Aseguramos que sea null para que el backend cree uno nuevo
        nombre: '',
        icono: 'bi-newspaper'
      });
      this.seccion.get('nombre')?.enable();
      this.seccion.get('icono')?.enable(); // Habilitar selectores de icono
    } else {
      if (this.seccionesDisponibles.length > 0) {
        this.seleccionarSeccionExistente(this.seccionesDisponibles[0]);
      }
    }
  }

  seleccionarSeccionExistente(sec: Seccion): void {
    this.seccion.patchValue({
      _id: sec._id,      // <-- Ahora incluimos el _id
      nombre: sec.nombre,
      icono: sec.icono
    });
    // Deshabilitar edición de sección existente
    this.seccion.get('nombre')?.disable();
    this.seccion.get('icono')?.disable();
  }

  seleccionarIcono(claseIcono: string): void {
    this.seccion.patchValue({
      icono: claseIcono
    });
  }


  addImagen() {
    this.imagenes.push(this.formBuilder.control('', [
      Validators.required,
      FormValidators.notOnlyWhiteSpace,
      FormValidators.isImageUrl
    ]));
  }

  removeImagen(index: number) {
    if (this.imagenes.length > 1) {
      this.imagenes.removeAt(index);
    }
  }


  onSubmit() {
    if (this.formNoticia.invalid) {
      this.formNoticia.markAllAsTouched();
      return;
    }

    const data = this.formNoticia.getRawValue();

    if (this.id()) {
      this.noticiaService.updateNoticia(this.id()!, data).subscribe({
        next: value => {
          alert(value.message);
          this.router.navigate(['/noticia/list']);
        },
        error: error => console.error(error)
      });
    } else {
      this.noticiaService.addNoticia(data).subscribe({
        next: value => {
          alert(value.message);
          this.router.navigate(['/noticia/list']);
        },
        error: error => console.error(error)
      });
    }
  }
}
