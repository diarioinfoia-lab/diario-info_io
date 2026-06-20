import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsTicker from '@/components/NewsTicker'
import type { Article } from '@/types'

const API = 'https://api2.diarioinfo.com'

interface ArticleData {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  featuredImage?: string;
  category?: { name: string; slug?: string; color?: string } | string;
  createdAt?: string;
  priority?: number;
  destination?: string;
  status?: string;
  updatedAt?: string;
}

interface BlockColumn {
  type: string;
}

interface BlockTemplate {
  name: string;
  layout: string;
  columns: BlockColumn[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockCI = { type: string; url?: string; fileId?: string; playlistId?: string } | null;
type PlaylistIt = { url: string; description?: string; platform?: string; isVisible?: boolean };
type PlaylistDt = { _id: string; name: string; description?: string; items: PlaylistIt[] };

interface PortadaBlock {
  id: string;
  name: string;
  template?: BlockTemplate;
  order: number;
  isVisible: boolean;
  config?: { destination?: string };
  content: BlockCI[];
}

async function fetchAllPublicArticles(): Promise<ArticleData[]> {
  const all: ArticleData[] = [];
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages && page <= 40) {
      const r = await fetch(`${API}/articles/public?page=${page}&pageSize=10`, { next: { revalidate: 60 } });
      if (!r.ok) break;
      const d = await r.json();
      const arts: ArticleData[] = d.articles || d.data || [];
      all.push(...arts);
      totalPages = d.totalPages || 1;
      if (!d.nextPage) break;
      page++;
    }
  } catch {
    // ignore
  }
  return all;
}

async function getPortadaData() {
  try {
    const [blocksRes, articles, plRes] = await Promise.all([
      fetch(`${API}/blocks?limit=100`, { next: { revalidate: 60 } }).then(r => r.json()),
      fetchAllPublicArticles(),
      fetch(`${API}/playlists`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => ({ playlists: [] })),
    ]);
    const playlists: PlaylistDt[] = plRes.playlists || [];
    const blocks: PortadaBlock[] = (blocksRes.blocks || [])
      .filter((b: PortadaBlock) => b.isVisible && b.template && b.template.layout)
      .sort((a: PortadaBlock, b: PortadaBlock) => (a.order || 0) - (b.order || 0));
    return { blocks, articles, playlists };
  } catch {
    return { blocks: [], articles: [], playlists: [] };
  }
}

function getArticleId(a: ArticleData): string { return a.id || a._id || ''; }
function getArticleHref(a: ArticleData): string { return '/noticia/' + (a.slug || getArticleId(a)); }
function getCatName(a: ArticleData): string {
  if (!a.category) return '';
  if (typeof a.category === 'string') return a.category;
  return a.category.name || '';
}
function getCatColor(a: ArticleData): string {
  if (!a.category || typeof a.category === 'string') return '#6b7280';
  return a.category.color || '#6b7280';
}
function formatDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function getImageUrl(a: ArticleData): string {
  const img = a.featuredImage || a.image || a.imageUrl || '';
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${API}/uploads/${img}`;
}

function ArticleCardLg({ article }: { article: ArticleData }) {
  const imgUrl = getImageUrl(article);
  const catName = getCatName(article);
  const catColor = getCatColor(article);
  return (
    <Link href={getArticleHref(article)} className='block relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-video group'>
      {imgUrl ? (
        <Image src={imgUrl} alt={article.title} fill className='object-cover group-hover:scale-105 transition-transform duration-300' unoptimized sizes='(max-width:768px) 100vw, 66vw' />
      ) : (
        <div className='absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800' />
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
      <div className='absolute bottom-0 left-0 right-0 p-4'>
        <div className='flex items-center gap-2 mb-2'>
          {catName && <span className='text-xs font-bold px-2 py-0.5 rounded' style={{backgroundColor: catColor, color: '#fff'}}>{catName}</span>}
          {article.createdAt && <span className='text-xs text-gray-300'>{formatDate(article.createdAt)}</span>}
        </div>
        <h2 className='text-white font-bold text-xl leading-tight line-clamp-3'>{article.title}</h2>
        {article.description && <p className='text-gray-300 text-sm mt-1 line-clamp-2 hidden sm:block'>{article.description}</p>}
      </div>
    </Link>
  );
}

function ArticleCardSm({ article }: { article: ArticleData }) {
  const imgUrl = getImageUrl(article);
  const catName = getCatName(article);
  const catColor = getCatColor(article);
  return (
    <Link href={getArticleHref(article)} className='block relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-video group'>
      {imgUrl ? (
        <Image src={imgUrl} alt={article.title} fill className='object-cover group-hover:scale-105 transition-transform duration-300' unoptimized sizes='(max-width:768px) 100vw, 33vw' />
      ) : (
        <div className='absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800' />
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
      <div className='absolute bottom-0 left-0 right-0 p-3'>
        <div className='flex items-center gap-2 mb-1'>
          {catName && <span className='text-xs font-bold px-1.5 py-0.5 rounded' style={{backgroundColor: catColor, color: '#fff'}}>{catName}</span>}
          {article.createdAt && <span className='text-xs text-gray-300'>{formatDate(article.createdAt)}</span>}
        </div>
        <h3 className='text-white font-bold text-sm leading-tight line-clamp-2'>{article.title}</h3>
      </div>
    </Link>
  );
}

function EmptySlot() {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 aspect-video bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'>
      <svg xmlns='http://www.w3.org/2000/svg' className='w-10 h-10 mb-2 opacity-40' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-1-4H7' />
      </svg>
      <span className='text-xs'>Espacio disponible</span>
    </div>
  );
}

function PlaylistSlot({ label }: { label?: string }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 aspect-video bg-blue-50 dark:bg-blue-900/20 text-blue-400'>
      <svg xmlns='http://www.w3.org/2000/svg' className='w-10 h-10 mb-2 opacity-60' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
      <span className='text-xs font-medium'>{label || 'Playlist'}</span>
    </div>
  );
}

function getYTId(url: string): string | null {
  const m = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/) || url.match(/shorts\/([^?]+)/);
  return m ? m[1] : null;
}

function renderSlot(col: BlockColumn, article?: ArticleData, size: 'lg' | 'sm' = 'sm', ci?: BlockCI, playlists: PlaylistDt[] = []) {
  const t = col.type.toLowerCase();
  if (t.includes('playlist') || t.includes('publicidad') || t.includes('multimedia')) {
    if (!ci) return <PlaylistSlot label={col.type} />;
    if (ci.type === 'image' && ci.url) {
      return (
        <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center aspect-video">
          <img src={ci.url} alt="Publicidad" className="w-full h-full object-contain" />
        </div>
      );
    }
    if (ci.type === 'audio' && ci.url) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 w-full">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">ESCUCHAR AUDIO</span>
          <p className="text-xs text-gray-400 mb-2">Toca para reproducir</p>
          <audio controls src={ci.url} className="w-full max-w-xs" />
        </div>
      );
    }
    if (ci.type === 'external' && ci.url) {
      const ytId = getYTId(ci.url);
      const thumb = ytId ? 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg' : null;
      return (
        <a href={ci.url} target="_blank" rel="noopener noreferrer" className="relative block w-full aspect-video rounded-xl overflow-hidden bg-gray-900 group">
          {thumb ? <img src={thumb} alt="Video" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><span className="text-white text-sm">Ver Video</span></div>}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </a>
      );
    }
    if (ci.type === 'playlist' && ci.playlistId) {
      const pl = playlists.find(p => p._id === ci.playlistId);
      if (!pl) return <PlaylistSlot label={col.type} />;
      const items = pl.items.filter(it => it.isVisible !== false).slice(0, 3);
      return (
        <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">diario info | {pl.name}</span>
              {pl.description && <p className="text-xs text-gray-400 truncate">{pl.description}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 p-2">
            {items.map((it, idx) => {
              const vid = getYTId(it.url);
              const thumb2 = vid ? 'https://img.youtube.com/vi/' + vid + '/mqdefault.jpg' : null;
              return (
                <a key={idx} href={it.url} target="_blank" rel="noopener noreferrer" className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded overflow-hidden group">
                  {thumb2 ? <img src={thumb2} alt={it.description || ''} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><span className="text-white text-xs p-1 text-center line-clamp-2">{it.description || 'Video'}</span></div>}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  {it.description && <p className="absolute bottom-0 left-0 right-0 text-white text-xs p-1 bg-black/60 line-clamp-1">{it.description}</p>}
                </a>
              );
            })}
          </div>
          {pl.items.length > 3 && <p className="text-xs text-center text-gray-400 py-1">+{pl.items.length - 3} más videos</p>}
        </div>
      );
    }
    return <PlaylistSlot label={col.type} />;
  }
  if (!article) return <EmptySlot />;
  return size === 'lg' ? <ArticleCardLg article={article} /> : <ArticleCardSm article={article} />;
}

function PortadaBlockRenderer({
  block,
  generalPool,
  specialPool,
  usedIds,
  playlists,
}: {
  block: PortadaBlock;
  generalPool: ArticleData[];
  specialPool: Map<string, ArticleData[]>;
  usedIds: Set<string>;
  playlists: PlaylistDt[];
}) {
  const layout = block.template?.layout || 'Full-width';
  const cols = block.template?.columns || [{ type: 'Noticia' }];
  const blockDest = block.config?.destination || 'general';
  const isSpecial = blockDest !== 'general';

  // Select the right pool for this block
  const pool = isSpecial
    ? (specialPool.get(blockDest) || generalPool)
    : generalPool;

  const getNext = (colType: string): ArticleData | undefined => {
    const t = colType.toLowerCase();
    if (t.includes('playlist') || t.includes('publicidad') || t.includes('multimedia')) return undefined;
    const art = pool.find(a => !usedIds.has(getArticleId(a)));
    if (art) usedIds.add(getArticleId(art));
    return art;
  };

  const wrapperCls = isSpecial
    ? 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-4 mb-6'
    : 'mb-6';

  const blockTitle = isSpecial ? (
    <div className='flex items-center justify-between mb-3'>
      <h2 className='font-bold text-lg text-blue-800 dark:text-blue-200'>{block.name}</h2>
    </div>
  ) : null;

  // Full-width: 1 col wide
  if (layout === 'Full-width') {
    const art = getNext(cols[0]?.type || 'Noticia');
    return (
      <div className={wrapperCls}>
        {blockTitle}
        {renderSlot(cols[0] || { type: 'Noticia' }, art, 'lg', block.content[0], playlists)}
      </div>
    );
  }

  // Hero (Principal Izquierda): 2/3 left + 1/3 right
  if (layout.includes('Izquierda')) {
    const main = getNext(cols[0]?.type || 'Noticia');
    const sec1 = getNext(cols[1]?.type || 'Noticia');
    const sec2 = cols[2] ? getNext(cols[2].type) : undefined;
    return (
      <div className={wrapperCls}>
        {blockTitle}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
          <div className='lg:col-span-2'>{renderSlot(cols[0] || { type: 'Noticia' }, main, 'lg', block.content[0], playlists)}</div>
          <div className='flex flex-col gap-3'>
            <div className='flex-1'>{renderSlot(cols[1] || { type: 'Noticia' }, sec1, 'sm', block.content[1], playlists)}</div>
            {cols[2] && <div className='flex-1'>{renderSlot(cols[2], sec2, 'sm', block.content[2], playlists)}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Hero (Principal Derecha): 1/3 left + 2/3 right
  if (layout.includes('Derecha')) {
    const sec1 = getNext(cols[0]?.type || 'Noticia');
    const sec2 = cols[1] ? getNext(cols[1].type) : undefined;
    const main = getNext(cols[cols.length - 1]?.type || 'Noticia');
    return (
      <div className={wrapperCls}>
        {blockTitle}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
          <div className='flex flex-col gap-3'>
            <div className='flex-1'>{renderSlot(cols[0] || { type: 'Noticia' }, sec1, 'sm', block.content[0], playlists)}</div>
            {cols[1] && cols.length > 2 && <div className='flex-1'>{renderSlot(cols[1], sec2, 'sm', block.content[1], playlists)}</div>}
          </div>
          <div className='lg:col-span-2'>{renderSlot(cols[cols.length - 1] || { type: 'Noticia' }, main, 'lg', block.content[cols.length - 1], playlists)}</div>
        </div>
      </div>
    );
  }

  // 2, 3, 4 Cols grid
  const colCount = layout === '4 Cols' ? 4 : layout === '3 Cols' ? 3 : 2;
  const gridCls =
    colCount === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
    colCount === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
    'grid-cols-1 sm:grid-cols-2';
  const slotCols = cols.slice(0, colCount);
  return (
    <div className={wrapperCls}>
      {blockTitle}
      <div className={`grid ${gridCls} gap-3`}>
        {slotCols.map((col, i) => (
          <div key={i}>{renderSlot(col, getNext(col.type), 'sm', block.content[i], playlists)}</div>
        ))}
      </div>
    </div>
  );
}

export const revalidate = 60

export default async function Home() {
  const { blocks, articles, playlists } = await getPortadaData();

  // Sort articles: higher priority first, then most recent
  const sorted = [...articles].sort((a, b) => {
    const pa = a.priority || 0;
    const pb = b.priority || 0;
    if (pb !== pa) return pb - pa;
    const da = new Date(a.createdAt || 0).getTime();
    const db = new Date(b.createdAt || 0).getTime();
    return db - da;
  });

  // Separate articles by destination
  const generalArticles = sorted.filter(a => !a.destination || a.destination === 'general');
  // Map: destination -> articles for that destination
  const specialMap = new Map<string, ArticleData[]>();
  sorted.forEach(a => {
    const dest = a.destination || 'general';
    if (dest !== 'general') {
      if (!specialMap.has(dest)) specialMap.set(dest, []);
      specialMap.get(dest)!.push(a);
    }
  });

  const usedIds = new Set<string>();
  const tickerArticles = sorted.slice(0, 12);

  return (
    <main className='min-h-screen bg-white dark:bg-gray-950'>
      <Header />
      <NewsTicker articles={tickerArticles as unknown as Article[]} />
      <div className='max-w-7xl mx-auto px-4 py-6'>
        {blocks.length === 0 && articles.length === 0 && (
          <div className='text-center py-20'>
            <p className='text-gray-500 dark:text-gray-400'>No hay noticias disponibles</p>
          </div>
        )}
        {blocks.length === 0 && articles.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {sorted.slice(0, 9).map(a => (
              <ArticleCardSm key={getArticleId(a)} article={a} />
            ))}
          </div>
        )}
        {blocks.map(block => (
          <PortadaBlockRenderer
            key={block.id}
            block={block}
            generalPool={generalArticles}
            specialPool={specialMap}
            usedIds={usedIds}
            playlists={playlists}
          />
        ))}
      </div>
      <Footer />
    </main>
  );
}