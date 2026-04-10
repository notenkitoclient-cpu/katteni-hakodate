import { motion } from 'motion/react';

export default function MainPhilosophy() {
  return (
    <section className="py-32 md:py-64 px-6 bg-spicato-white text-spicato-black">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[clamp(2.5rem,8vw,7rem)] font-serif mb-32 tracking-widest [font-feature-settings:'palt']"
        >
          まっすぐな愛を、<br />まんなかに。
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 font-serif text-lg md:text-2xl leading-loose tracking-widest">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            向き合う。考える。つくる。
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            若者が去る街に、未来はあるか。<br />
            私たちは、データと愛で函館を再定義する。
          </motion.p>
        </div>
      </div>
    </section>
  );
}
