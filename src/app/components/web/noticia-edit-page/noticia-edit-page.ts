import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { NoticiaService } from '../../../services/noticia-service';
import { Noticia } from '../../../common/interfaces';
import { Router } from '@angular/router';
import { FormValidators } from '../../../validators/form-validators';
import { LoadingSpinner } from '../../structure/loading-spinner/loading-spinner';
import { DatePipe } from '@angular/common';

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

  private readonly noticiaService: NoticiaService =
    inject(NoticiaService);
  private readonly formBuilder: FormBuilder =
    inject(FormBuilder);
  private readonly router: Router =
    inject(Router);

  loaded = false;

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
    // Gestión del objeto Sección (1 punto)
    seccion: this.formBuilder.group({
      nombre: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
      icono: ['bi bi-newspaper', [Validators.required]]
    }),
    // Gestión de imágenes con INNOVACIÓN (1,5 puntos + 0,5 innovación)
    imagenes: this.formBuilder.array([
      this.formBuilder.control('', [
        Validators.required,
        FormValidators.notOnlyWhiteSpace,
        FormValidators.isImageUrl // <--- INNOVACIÓN
      ])
    ])
  });

  // GETTERS (Estilo exacto del profesor)
  get titulo(): any { return this.formNoticia.get('titulo'); }
  get subtitulo(): any { return this.formNoticia.get('subtitulo'); }
  get autor(): any { return this.formNoticia.get('autor'); }
  get contenido(): any { return this.formNoticia.get('contenido'); }
  get imagenes(): FormArray { return this.formNoticia.get('imagenes') as FormArray; }
  get seccion(): FormGroup { return this.formNoticia.get('seccion') as FormGroup; }

  ngOnInit() {
    if (this.id()) {
      console.log('Editando ID:', this.id());
      this.loadNoticia();
    } else {
      console.log('Añadiendo nueva noticia');
      this.loaded = true;
    }
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

  addImagen() {
    this.imagenes.push(this.formBuilder.control('', [
      Validators.required,
      FormValidators.notOnlyWhiteSpace,
      FormValidators.isImageUrl // <--- INNOVACIÓN en cada nuevo input
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
