'use client';

import { motion, useReducedMotion, Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
    children: ReactNode;
    /** Direction the content travels in from as it reveals. @default 'up' */
    direction?: Direction;
    /** Delay before the animation starts, in seconds. @default 0 */
    delay?: number;
    /** Animation duration, in seconds. @default 0.5 */
    duration?: number;
    /** Distance travelled during the reveal, in pixels. @default 24 */
    distance?: number;
    /** Replay every time the element re-enters the viewport instead of once. @default false */
    repeat?: boolean;
    /** Fraction of the element that must be visible before it reveals. @default 0.15 */
    amount?: number;
    className?: string;
}

const offsetFor = (direction: Direction, distance: number) => {
    switch (direction) {
        case 'up': return { y: distance };
        case 'down': return { y: -distance };
        case 'left': return { x: distance };
        case 'right': return { x: -distance };
        default: return {};
    }
};

/**
 * Fades and slides content into view the first time it scrolls into the
 * viewport. Respects prefers-reduced-motion by skipping the transform.
 */
export function ScrollReveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.5,
    distance = 24,
    repeat = false,
    amount = 0.15,
    className,
}: ScrollRevealProps) {
    const shouldReduceMotion = useReducedMotion();
    const offset = offsetFor(direction, distance);

    const variants: Variants = {
        hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, ...offset },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: !repeat, amount }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface ScrollRevealGroupProps {
    children: ReactNode;
    /** Delay between each direct child's reveal, in seconds. @default 0.1 */
    stagger?: number;
    direction?: Direction;
    duration?: number;
    distance?: number;
    amount?: number;
    className?: string;
}

/**
 * Reveals direct children one after another as the group scrolls into view —
 * for grids/lists of cards where a staggered cascade reads better than every
 * item animating at once.
 */
export function ScrollRevealGroup({
    children,
    stagger = 0.1,
    direction = 'up',
    duration = 0.5,
    distance = 24,
    amount = 0.15,
    className,
}: ScrollRevealGroupProps) {
    const shouldReduceMotion = useReducedMotion();
    const offset = offsetFor(direction, distance);

    const container: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: stagger },
        },
    };

    const item: Variants = {
        hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, ...offset },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: { duration, ease: [0.21, 0.47, 0.32, 0.98] },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount }}
            variants={container}
            className={className}
        >
            {Array.isArray(children)
                ? children.map((child, i) => (
                    <motion.div key={i} variants={item}>
                        {child}
                    </motion.div>
                ))
                : <motion.div variants={item}>{children}</motion.div>}
        </motion.div>
    );
}
