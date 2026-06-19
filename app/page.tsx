import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsTicker from '@/components/NewsTicker'

const API = 'https://api2.diarioinfo.com'

interface ArticleData {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  category?: { name: string; slug?: string; color?: string } | string;
  createdAt?: string;
  priority?: number;
  status?: string;
}

interface BlockTemplate {
  name: string;
  layout: string;
  columns: { type: string }[];
}

interface PortadaBlock {
  id: string;
  name: string;
  template?: BlockTemplate;
  order: number;
  isVisible: boolean;
  config?: { destination?: string };
  content: { destination?: string; article?: ArticleData; playlist?: { name: string } }[];
}

async function getPortadaData() {
  try {
    const [blocksRes, articlesRes] = await Promise.all([
      fetch(`${API}/blocks?limit=100`, { next: { revalidate: 60 } }),
      fetch(`${API}/articles/public?page=1&pageSize=100`, { next: { revalidate: 60 } }),
    ]);
    const blocksData = await blocksRes.json();
    const articlesData = await articlesRes.json();
    const blocks: PortadaBlock[] = (blocksData.blocks || [])
      .filter((b: PortadaBlock) => b.isVisible && b.template)
      .sort((a: PortadaBlock, b: PortadaBlock) => (a.order || 0) - (b.order || 0));
    const articles: ArticleData[] = articlesData.articles || articlesData.data || [];
    return { blocks, articles };
  } catch {
    return { blocks: [], articles: [] };
  }
}

function getArticleId(a: ArticleData) { return a.id || a._id || ''; }
function getArticleHref(a: ArticleData) { return '/noticia/' + (a.slug || getArticleId(a)); }
function getCatName(a: ArticleData) { return typeof a.category === 'string' ? a.category : a.category?.name || ''; }
function getCatColor(a: ArticleData) { return typeof a.category === 'object' ? a.category?.color || '#6b7280' : '#6b7280'; }
function getCatSlug(a: ArticleData) { return typeof a.category === 'object' ? a.category?.slug || '' : ''; }
function formatDate(d?: string) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function getImageUrl(a: ArticleData) {
  const img = a.image || a.imageUrl || '';
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${API}/uploads/${img}`;
}

function ArticleCardLg({ article }: { article: ArticleData }) {
  const imgUrl = getImageUrl(article);
  const catName = getCatName(article);
  const catColor = getCatColor(article);
  return (
    <Link href={getArticleHref(article)} className='block relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-[16/9] group'>
      {imgUrl ? (
        <Image src={imgUrl} alt={article.title} fill className='object-cover group-hover:scale-105 transition-transform duration-300' unoptimized />
      ) : (
        <div className='absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800' />
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
      <div className='absolute bottom-0 left-0 right-0 p-4'>
        <div className='flex items-center gap-2 mb-2'>
          {catName && <span className='text-xs font-bold px-2 py-0.5 rounded' style={{backgroundColor: catColor, color: '#fff'}}>{catName}</span>}
          {article.createdAt && <span className='text-xs text-gray-300'>{formatDate(article.createdAt)}</span>}
        </div>
        <h2 className='text-white font-bold text-lg leading-tight line-clamp-3'>{article.title}</h2>
      </div>
    </Link>
  );
}

function ArticleCardSm({ article }: { article: ArticleData }) {
  const imgUrl = getImageUrl(article);
  const catName = getCatName(article);
  const catColor = getCatColor(article);
  return (
    <Link href={getArticleHref(article)} className='block relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-[16/9] group'>
      {imgUrl ? (
        <Image src={imgUrl} alt={article.title} fill className='object-cover group-hover:scale-105 transition-transform duration-300' unoptimized />
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
    <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 aspect-[16/9] bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'>
      <svg xmlns='http://www.w3.org/2000/svg' className='w-10 h-10 mb-2 opacity-40' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-1-4H7' /></svg>
      <span className='text-xs'>Espacio disponible</span>
    </div>
  );
}

function PlaylistSlot({ name }: { name?: string }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 aspect-[16/9] bg-blue-50 dark:bg-blue-900/20 text-blue-400'>
      <svg xmlns='http://www.w3.org/2000/svg' className='w-10 h-10 mb-2 opacity-60' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
      <span className='text-xs font-medium'>{name || 'Playlist'}</span>
    </div>
  );
}

function renderSlot(col: { type: string }, article?: ArticleData, size: 'lg' | 'sm' = 'sm') {
  if (col.type.toLowerCase().includes('playlist') || col.type.toLowerCase().includes('publicidad')) {
    return <PlaylistSlot name={col.type} />;
  }
  if (!article) return <EmptySlot />;
  return size === 'lg' ? <ArticleCardLg article={article} /> : <ArticleCardSm article={article} />;
}

function PortadaBlockRenderer({ block, articlePool, usedIds }: {
  block: PortadaBlock;
  articlePool: ArticleData[];
  usedIds: Set<string>;
}) {
  const layout = block.template?.layout || 'Full-width';
  const cols = block.template?.columns || [{ type: 'Noticia' }];
  const isSpecial = block.config?.destination && block.config.destination !== 'general';

  // Tomar artículos del pool (no repetir)
  const getNext = (type: string): ArticleData | undefined => {
    if (type.toLowerCase().includes('playlist') || type.toLowerCase().includes('publicidad')) return undefined;
    const art = articlePool.find(a => !usedIds.has(getArticleId(a)));
    if (art) usedIds.add(getArticleId(art));
    return art;
  };

  const wrapperCls = isSpecial
    ? 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-4 mb-6'
    : 'mb-6';

  const title = isSpecial ? (
    <div className='flex items-center justify-between mb-3'>
      <h2 className='font-bold text-lg text-blue-800 dark:text-blue-200'>{block.name}</h2>
    </div>
  ) : null;

  // Full-width
  if (layout === 'Full-width') {
    const art = getNext(cols[0]?.type || 'Noticia');
    return <div className={wrapperCls}>{title}{renderSlot(cols[0] || {type:'Noticia'}, art, 'lg')}</div>;
  }

  // Hero Principal Izquierda: 2/3 + 1/3
  if (layout.includes('Izquierda')) {
    const main = getNext(cols[0]?.type || 'Noticia');
    const sec1 = getNext(cols[1]?.type || 'Noticia');
    const sec2 = cols[2] ? getNext(cols[2]?.type || 'Noticia') : undefined;
    return (
      <div className={wrapperCls}>{title}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
          <div className='lg:col-span-2'>{renderSlot(cols[0]||{type:'Noticia'}, main, 'lg')}</div>
          <div className='flex flex-col gap-3'>
            <div className='flex-1'>{renderSlot(cols[1]||{type:'Noticia'}, sec1, 'sm')}</div>
            {cols[2] && <div className='flex-1'>{renderSlot(cols[2], sec2, 'sm')}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Hero Principal Derecha: 1/3 + 2/3
  if (layout.includes('Derecha')) {
    const sec1 = getNext(cols[0]?.type || 'Noticia');
    const sec2 = cols[1] ? getNext(cols[1]?.type || 'Noticia') : undefined;
    const main = getNext(cols[2]?.type || 'Noticia');
    return (
      <div className={wrapperCls}>{title}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
          <div className='flex flex-col gap-3'>
            <div className='flex-1'>{renderSlot(cols[0]||{type:'Noticia'}, sec1, 'sm')}</div>
            {cols[1] && <div className='flex-1'>{renderSlot(cols[1], sec2, 'sm')}</div>}
          </div>
          <div className='lg:col-span-2'>{renderSlot(cols[2]||{type:'Noticia'}, main, 'lg')}</div>
        </div>
      </div>
    );
  }

  // 2, 3, 4 Cols
  const colCount = layout === '4 Cols' ? 4 : layout === '3 Cols' ? 3 : 2;
  const gridCls = colCount === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : colCount === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
  const slots = cols.slice(0, colCount);
  return (
    <div className={wrapperCls}>{title}
      <div className={`grid ${gridCls} gap-3`}>
        {slots.map((col, i) => <div key={i}>{renderSlot(col, getNext(col.type), 'sm')}</div>)}
      </div>
    </div>
  );
}

export const revalidate = 60

export default async function Home() {
  const { blocks, articles } = await getPortadaData();
  const usedIds = new Set<string>();

  // Separar bloques por destino
  const generalBlocks = blocks.filter(b => !b.config?.destination || b.config.destination === 'general');
  const specialBlocks = blocks.filter(b => b.config?.destination && b.config.destination !== 'general');

  // Artículos ordenados: mayor prioridad primero, luego más reciente
  const sortedArticles = [...articles].sort((a, b) => {
    if ((b.priority || 0) !== (a.priority || 0)) return (b.priority || 0) - (a.priority || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const tickerArticles = sortedArticles.slice(0, 10);

  return (
    <main className='min-h-screen bg-white dark:bg-gray-950'>
      <Header />
      <NewsTicker articles={tickerArticles} />

      <div className='max-w-7xl mx-auto px-4 py-6'>
        {blocks.length === 0 && articles.length === 0 && (
          <div className='text-center py-20'>
            <p className='text-gray-500 dark:text-gray-400'>No hay art\u00edculos disponibles</p>
          </div>
        )}

        {/* Bloques de portada general */}
        {generalBlocks.map(block => (
          <PortadaBlockRenderer key={block.id} block={block} articlePool={sortedArticles} usedIds={usedIds} />
        ))}

        {/* Bloques especiales (otras secciones) */}
        {specialBlocks.length > 0 && (
          <div className='mt-8 space-y-6'>
            {specialBlocks.map(block => (
              <PortadaBlockRenderer key={block.id} block={block} articlePool={sortedArticles} usedIds={usedIds} />
            ))}
          </div>
        )}

        {/* Si no hay bloques, mostrar grid genérico */}
        {blocks.length === 0 && articles.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {sortedArticles.slice(0, 9).map(a => (
              <ArticleCardSm key={getArticleId(a)} article={a} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}