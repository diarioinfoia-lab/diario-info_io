import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PollWidget from '@/components/PollWidget'

const e = React.createElement

export default function EncuestaDemoPage() {
  return e('main', { className: 'min-h-screen bg-gray-50 dark:bg-gray-950' },
           e(Header),
           e('div', { className: 'max-w-2xl mx-auto px-4 py-10' },
             e('h1', { className: 'text-xl font-bold text-gray-900 dark:text-white mb-1' }, 'Demo: Sistema de Encuestas'),
             e('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-6' },
               'Pagina de prueba interna (solo en ia2) para validar el widget de encuestas contra el backend real.'
               ),
             e(PollWidget, { pollId: 'encuesta-demo-ia2' })
             ),
           e(Footer)
           )
}
