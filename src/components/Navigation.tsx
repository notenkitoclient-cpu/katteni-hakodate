import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { title: '情報収集',   path: '/news',         en: 'News' },
    { title: '調べた',     path: '/articles',     en: 'Articles' },
    { title: '応援',       path: '/crowdfunding', en: 'Support' },
    { title: '仕掛け人',   path: '/members',      en: 'Members' },
    { title: 'について',   path: '/about',        en: 'About' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
          scrolled || isOpen
            ? 'bg-white/90 backdrop-blur-md text-spicato-black'
            : 'bg-transparent text-white'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 md:px-10 md:py-6">
          <a
            href="/"
            className="relative z-50 flex flex-col uppercase font-serif tracking-widest leading-none"
          >
            <span className="text-xl md:text-2xl font-bold">カッテニハコダテ</span>
            <span className="text-[10px] mt-1 opacity-70">函館の不都合な真実</span>
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 flex items-center gap-2"
            aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
          >
            <span className="hidden md:block text-sm font-medium tracking-widest uppercase">
              {isOpen ? 'Close' : 'Menu'}
            </span>
            <div
              className={`p-2 rounded-full transition-colors ${
                scrolled && !isOpen
                  ? 'bg-spicato-black text-white'
                  : 'bg-white text-spicato-black'
              }`}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-spicato-black text-white flex flex-col justify-center px-6 md:px-20"
          >
            <nav className="max-w-4xl w-full mx-auto">
              <ul className="flex flex-col gap-6 md:gap-8">
                {menuItems.map((item, i) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <a
                      href={item.path}
                      className="group flex items-end gap-4 text-3xl md:text-5xl lg:text-6xl font-serif hover:text-gray-400 [font-feature-settings:'palt']"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="relative">
                        {item.title}
                        <span className="absolute left-0 -bottom-2 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                      </span>
                      <span className="text-sm md:text-xl font-sans font-light opacity-50 mb-1">
                        {item.en}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
