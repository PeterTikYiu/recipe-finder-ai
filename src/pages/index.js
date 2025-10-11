import React from 'react';
import { lazy } from 'react';
import { withSuspense } from '../components/common/Loading';

const HomePage = withSuspense(lazy(() => import('./Home')));
const FavoritesPage = withSuspense(lazy(() => import('./Favorites')));
const CalculatorPage = withSuspense(lazy(() => import('./Calculator')));
const NotFoundPage = withSuspense(lazy(() => import('./NotFound')));

export {
  HomePage,
  FavoritesPage,
  CalculatorPage,
  NotFoundPage,
};
