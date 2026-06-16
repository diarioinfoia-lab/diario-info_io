# CONTEXT.md - Proyecto DiarioInfo Dashboard Clone

## INSTRUCCIONES CRITICAS PARA CLAUDE

Cuando leas este archivo, sigue estas instrucciones exactamente:
1. SIEMPRE responder en espanol
2. SIEMPRE apuntar al API en https://api2.diarioinfo.com
3. Clonar el dashboard original de https://ia.diarioinfo.com/dashboard
4. GitHub repo: diarioinfoia-lab/diario-info_io
5. GitHub token: ghp_[TOKEN - ver en tu gestor de contrasenas] (expira Jul 2026)
6. Credenciales admin: admin@diarioinfo.com / Admin1234! / role: Admin
7. Target domain: ia2.diarioinfo.com (Vercel deployment)
8. Vincular siempre con MongoDB
9. Generar registros de prueba para verificar funcionamiento

## ESTADO DEL PROYECTO (Actualizado: Jun 16, 2026)

### Paginas implementadas en ia2.diarioinfo.com

| Pagina | Ruta | Estado |
|--------|------|--------|
| Panel de Control | /dashboard | Completado |
| Articulos/Noticias | /dashboard/articles | Completado |
| Categorias | /dashboard/categories | Completado |
| Usuarios | /dashboard/users | Completado |
| Logs del Sistema | /dashboard/logs | Completado |
| Notificaciones | /dashboard/notifications | Completado |
| Mi Perfil | /dashboard/profile | Completado |
| Ajustes | /dashboard/settings | Completado |
| Plantillas de Bloque | /dashboard/blocks | Completado |
| Editor de Portada | /dashboard/layout | Completado |
| Playlists | /dashboard/playlists | Completado |

### Datos en MongoDB (diario-info-db)

- 3 categorias (Politica, Economia, Deportes)
- 2 articulos (1 draft, 1 publicado)
- 5 block-templates (N Full, M M M, N N, Playlist Full, Hero N P)
- 2 bloques de portada
- 3 playlists (Deportes Destacados, Entrevistas Exclusivas, Noticias de la Semana)

### Ultimo build exitoso: commit 7cd0de1

## ENDPOINTS DEL API (api2.diarioinfo.com)

### Autenticacion
- POST /signin -> {email, password}

### Categorias
- GET /categories, POST /categories
- PUT /category/:id, DELETE /category/:id

### Articulos
- GET /articles, POST /articles
- PUT /article/:id, DELETE /article/:id

### Usuarios
- GET /users, POST /users
- PUT /user/:id, DELETE /user/:id

### Block Templates (Plantillas)
- GET /block-templates, POST /block-templates
- PUT /block-template/:id, DELETE /block-template/:id

### Blocks (Portada)
- GET /blocks, POST /blocks
- PUT /block/:id, DELETE /block/:id

### Playlists
- GET /playlists, POST /playlists
- PUT /playlist/:id, DELETE /playlist/:id

## ESTRUCTURAS DE DATOS

### BlockTemplate
{name, code, layout, columns: [{type}], status, icon, type, id}
- layout values: 'Full-width' | '2 Cols' | '3 Cols' | '4 Cols' | 'Hero (Principal Izquierda)' | 'Hero (Principal Derecha)'
- column types: 'Noticia' | 'Publicidad' | 'Multimedia' | 'Playlist de Videos'

### Block
{name, template (id populated), order, isVisible, destination, content[], id}

### Playlist
{name, description, slug (auto), orientation: 'horizontal'|'vertical', isVisible, items: [{url, description, platform, isVisible}], id}

## HELPER JS PARA PUSH A GITHUB

Ejecutar en tab ia2.diarioinfo.com:

const TOKEN = 'ghp_[TOKEN]';
const REPO = 'diarioinfoia-lab/diario-info_io';
window._ghPush = async (path, content, message) => {
  let sha = undefined;
  const r = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
    headers: {Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github.v3+json'}
  });
  if(r.ok) { const j = await r.json(); sha = j.sha; }
  const body = {message, content: btoa(unescape(encodeURIComponent(content)))};
  if(sha) body.sha = sha;
  const put = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
    method: 'PUT',
    headers: {Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  const d = await put.json();
  return d.content ? 'ok' : 'error: ' + JSON.stringify(d).substring(0,200);
};

## REGLAS CRITICAS TypeScript

1. No usar Record<string, string> para params que pueden ser numeros -> usar Record<string, string | number | undefined>
2. No eliminar funciones exportadas del api.ts sin verificar que no las usen otros archivos
3. Los escapes uXXXX en template literals se convierten en texto literal -> usar caracteres UTF-8 directamente
4. Usar btoa(unescape(encodeURIComponent(content))) para encode UTF-8

## FUNCIONES EXPORTADAS EN lib/api.ts (TODAS NECESARIAS)

signIn, login (alias), getMe, updateMe, updateProfile, updatePassword,
getUsers, createUser, updateUser, deleteUser,
getCategories, getCategory, createCategory, updateCategory, deleteCategory,
getPublicArticles, getPublicArticle, getArticles, getArticle, createArticle, updateArticle, deleteArticle,
getLogs, getNotifications, markNotificationRead,
getSettings, updateSettings,
getBlockTemplates, createBlockTemplate, updateBlockTemplate, deleteBlockTemplate,
getBlocks, createBlock, updateBlock, deleteBlock,
getPlaylists, createPlaylist, updatePlaylist, deletePlaylist

## PROXIMAS FUNCIONALIDADES PENDIENTES

- Mejorar el campo de contenido de cada bloque en la portada (permitir asignar noticias reales a columnas)
- Mejorar BlockPreview para bloques con template desconocido
- Agregar paginacion en tablas largas (articulos, usuarios)
- Agregar filtros avanzados por categoria en articulos
