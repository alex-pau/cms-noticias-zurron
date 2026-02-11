import { Routes } from '@angular/router';
import { NoticiaListPage } from './components/web/noticia-list-page/noticia-list-page';
import { NoticiaEditPage } from './components/web/noticia-edit-page/noticia-edit-page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/noticias/list',
    pathMatch: 'full',
  },
  {
    path: 'noticias/list',
    component: NoticiaListPage
  },
  {
    path: 'noticias/add',
    component: NoticiaEditPage
  },
  {
    path: 'noticias/edit/:id',
    component: NoticiaEditPage
  },
  {
    path: '**',
    redirectTo: '/noticias/list',
    pathMatch: 'full',
  }
];
