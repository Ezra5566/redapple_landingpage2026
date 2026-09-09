import { lazy, Suspense } from 'react';

const HeroScene = lazy(() => import('./HeroScene'));

/** Renders the 3D hero after mount; falls back to a static gradient. */
export default function LazyHeroScene() {
  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,#2a0505_0%,#0a0a0c_70%)]" />
      }
    >
      <HeroScene />
    </Suspense>
  );
}
