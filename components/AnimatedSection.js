'use client'

import { motion } from 'framer-motion'

export default function AnimatedSection({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98] // Custom cubic-bezier for "premium" feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
