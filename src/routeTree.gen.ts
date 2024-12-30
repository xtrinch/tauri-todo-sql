/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SellersImport } from './routes/sellers'
import { Route as InventoryImport } from './routes/inventory'
import { Route as BuyersImport } from './routes/buyers'
import { Route as IndexImport } from './routes/index'
import { Route as TreeSpeciesEditImport } from './routes/treeSpecies/edit'
import { Route as SellersSellerIdImport } from './routes/sellers/$sellerId'
import { Route as InventoryListImport } from './routes/inventory/list'
import { Route as InventoryEditImport } from './routes/inventory/edit'
import { Route as BuyersBuyerIdImport } from './routes/buyers/$buyerId'
import { Route as SellersSellerIdWoodPiecesListImport } from './routes/sellers/$sellerId/wood-pieces-list'
import { Route as SellersSellerIdSoldPiecesListImport } from './routes/sellers/$sellerId/sold-pieces-list'
import { Route as BuyersBuyerIdWoodPieceOffersListImport } from './routes/buyers/$buyerId/wood-piece-offers-list'
import { Route as BuyersBuyerIdBoughtPiecesListImport } from './routes/buyers/$buyerId/bought-pieces-list'

// Create/Update Routes

const SellersRoute = SellersImport.update({
  id: '/sellers',
  path: '/sellers',
  getParentRoute: () => rootRoute,
} as any)

const InventoryRoute = InventoryImport.update({
  id: '/inventory',
  path: '/inventory',
  getParentRoute: () => rootRoute,
} as any)

const BuyersRoute = BuyersImport.update({
  id: '/buyers',
  path: '/buyers',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const TreeSpeciesEditRoute = TreeSpeciesEditImport.update({
  id: '/treeSpecies/edit',
  path: '/treeSpecies/edit',
  getParentRoute: () => rootRoute,
} as any)

const SellersSellerIdRoute = SellersSellerIdImport.update({
  id: '/$sellerId',
  path: '/$sellerId',
  getParentRoute: () => SellersRoute,
} as any)

const InventoryListRoute = InventoryListImport.update({
  id: '/list',
  path: '/list',
  getParentRoute: () => InventoryRoute,
} as any)

const InventoryEditRoute = InventoryEditImport.update({
  id: '/edit',
  path: '/edit',
  getParentRoute: () => InventoryRoute,
} as any)

const BuyersBuyerIdRoute = BuyersBuyerIdImport.update({
  id: '/$buyerId',
  path: '/$buyerId',
  getParentRoute: () => BuyersRoute,
} as any)

const SellersSellerIdWoodPiecesListRoute =
  SellersSellerIdWoodPiecesListImport.update({
    id: '/wood-pieces-list',
    path: '/wood-pieces-list',
    getParentRoute: () => SellersSellerIdRoute,
  } as any)

const SellersSellerIdSoldPiecesListRoute =
  SellersSellerIdSoldPiecesListImport.update({
    id: '/sold-pieces-list',
    path: '/sold-pieces-list',
    getParentRoute: () => SellersSellerIdRoute,
  } as any)

const BuyersBuyerIdWoodPieceOffersListRoute =
  BuyersBuyerIdWoodPieceOffersListImport.update({
    id: '/wood-piece-offers-list',
    path: '/wood-piece-offers-list',
    getParentRoute: () => BuyersBuyerIdRoute,
  } as any)

const BuyersBuyerIdBoughtPiecesListRoute =
  BuyersBuyerIdBoughtPiecesListImport.update({
    id: '/bought-pieces-list',
    path: '/bought-pieces-list',
    getParentRoute: () => BuyersBuyerIdRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/buyers': {
      id: '/buyers'
      path: '/buyers'
      fullPath: '/buyers'
      preLoaderRoute: typeof BuyersImport
      parentRoute: typeof rootRoute
    }
    '/inventory': {
      id: '/inventory'
      path: '/inventory'
      fullPath: '/inventory'
      preLoaderRoute: typeof InventoryImport
      parentRoute: typeof rootRoute
    }
    '/sellers': {
      id: '/sellers'
      path: '/sellers'
      fullPath: '/sellers'
      preLoaderRoute: typeof SellersImport
      parentRoute: typeof rootRoute
    }
    '/buyers/$buyerId': {
      id: '/buyers/$buyerId'
      path: '/$buyerId'
      fullPath: '/buyers/$buyerId'
      preLoaderRoute: typeof BuyersBuyerIdImport
      parentRoute: typeof BuyersImport
    }
    '/inventory/edit': {
      id: '/inventory/edit'
      path: '/edit'
      fullPath: '/inventory/edit'
      preLoaderRoute: typeof InventoryEditImport
      parentRoute: typeof InventoryImport
    }
    '/inventory/list': {
      id: '/inventory/list'
      path: '/list'
      fullPath: '/inventory/list'
      preLoaderRoute: typeof InventoryListImport
      parentRoute: typeof InventoryImport
    }
    '/sellers/$sellerId': {
      id: '/sellers/$sellerId'
      path: '/$sellerId'
      fullPath: '/sellers/$sellerId'
      preLoaderRoute: typeof SellersSellerIdImport
      parentRoute: typeof SellersImport
    }
    '/treeSpecies/edit': {
      id: '/treeSpecies/edit'
      path: '/treeSpecies/edit'
      fullPath: '/treeSpecies/edit'
      preLoaderRoute: typeof TreeSpeciesEditImport
      parentRoute: typeof rootRoute
    }
    '/buyers/$buyerId/bought-pieces-list': {
      id: '/buyers/$buyerId/bought-pieces-list'
      path: '/bought-pieces-list'
      fullPath: '/buyers/$buyerId/bought-pieces-list'
      preLoaderRoute: typeof BuyersBuyerIdBoughtPiecesListImport
      parentRoute: typeof BuyersBuyerIdImport
    }
    '/buyers/$buyerId/wood-piece-offers-list': {
      id: '/buyers/$buyerId/wood-piece-offers-list'
      path: '/wood-piece-offers-list'
      fullPath: '/buyers/$buyerId/wood-piece-offers-list'
      preLoaderRoute: typeof BuyersBuyerIdWoodPieceOffersListImport
      parentRoute: typeof BuyersBuyerIdImport
    }
    '/sellers/$sellerId/sold-pieces-list': {
      id: '/sellers/$sellerId/sold-pieces-list'
      path: '/sold-pieces-list'
      fullPath: '/sellers/$sellerId/sold-pieces-list'
      preLoaderRoute: typeof SellersSellerIdSoldPiecesListImport
      parentRoute: typeof SellersSellerIdImport
    }
    '/sellers/$sellerId/wood-pieces-list': {
      id: '/sellers/$sellerId/wood-pieces-list'
      path: '/wood-pieces-list'
      fullPath: '/sellers/$sellerId/wood-pieces-list'
      preLoaderRoute: typeof SellersSellerIdWoodPiecesListImport
      parentRoute: typeof SellersSellerIdImport
    }
  }
}

// Create and export the route tree

interface BuyersBuyerIdRouteChildren {
  BuyersBuyerIdBoughtPiecesListRoute: typeof BuyersBuyerIdBoughtPiecesListRoute
  BuyersBuyerIdWoodPieceOffersListRoute: typeof BuyersBuyerIdWoodPieceOffersListRoute
}

const BuyersBuyerIdRouteChildren: BuyersBuyerIdRouteChildren = {
  BuyersBuyerIdBoughtPiecesListRoute: BuyersBuyerIdBoughtPiecesListRoute,
  BuyersBuyerIdWoodPieceOffersListRoute: BuyersBuyerIdWoodPieceOffersListRoute,
}

const BuyersBuyerIdRouteWithChildren = BuyersBuyerIdRoute._addFileChildren(
  BuyersBuyerIdRouteChildren,
)

interface BuyersRouteChildren {
  BuyersBuyerIdRoute: typeof BuyersBuyerIdRouteWithChildren
}

const BuyersRouteChildren: BuyersRouteChildren = {
  BuyersBuyerIdRoute: BuyersBuyerIdRouteWithChildren,
}

const BuyersRouteWithChildren =
  BuyersRoute._addFileChildren(BuyersRouteChildren)

interface InventoryRouteChildren {
  InventoryEditRoute: typeof InventoryEditRoute
  InventoryListRoute: typeof InventoryListRoute
}

const InventoryRouteChildren: InventoryRouteChildren = {
  InventoryEditRoute: InventoryEditRoute,
  InventoryListRoute: InventoryListRoute,
}

const InventoryRouteWithChildren = InventoryRoute._addFileChildren(
  InventoryRouteChildren,
)

interface SellersSellerIdRouteChildren {
  SellersSellerIdSoldPiecesListRoute: typeof SellersSellerIdSoldPiecesListRoute
  SellersSellerIdWoodPiecesListRoute: typeof SellersSellerIdWoodPiecesListRoute
}

const SellersSellerIdRouteChildren: SellersSellerIdRouteChildren = {
  SellersSellerIdSoldPiecesListRoute: SellersSellerIdSoldPiecesListRoute,
  SellersSellerIdWoodPiecesListRoute: SellersSellerIdWoodPiecesListRoute,
}

const SellersSellerIdRouteWithChildren = SellersSellerIdRoute._addFileChildren(
  SellersSellerIdRouteChildren,
)

interface SellersRouteChildren {
  SellersSellerIdRoute: typeof SellersSellerIdRouteWithChildren
}

const SellersRouteChildren: SellersRouteChildren = {
  SellersSellerIdRoute: SellersSellerIdRouteWithChildren,
}

const SellersRouteWithChildren =
  SellersRoute._addFileChildren(SellersRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/buyers': typeof BuyersRouteWithChildren
  '/inventory': typeof InventoryRouteWithChildren
  '/sellers': typeof SellersRouteWithChildren
  '/buyers/$buyerId': typeof BuyersBuyerIdRouteWithChildren
  '/inventory/edit': typeof InventoryEditRoute
  '/inventory/list': typeof InventoryListRoute
  '/sellers/$sellerId': typeof SellersSellerIdRouteWithChildren
  '/treeSpecies/edit': typeof TreeSpeciesEditRoute
  '/buyers/$buyerId/bought-pieces-list': typeof BuyersBuyerIdBoughtPiecesListRoute
  '/buyers/$buyerId/wood-piece-offers-list': typeof BuyersBuyerIdWoodPieceOffersListRoute
  '/sellers/$sellerId/sold-pieces-list': typeof SellersSellerIdSoldPiecesListRoute
  '/sellers/$sellerId/wood-pieces-list': typeof SellersSellerIdWoodPiecesListRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/buyers': typeof BuyersRouteWithChildren
  '/inventory': typeof InventoryRouteWithChildren
  '/sellers': typeof SellersRouteWithChildren
  '/buyers/$buyerId': typeof BuyersBuyerIdRouteWithChildren
  '/inventory/edit': typeof InventoryEditRoute
  '/inventory/list': typeof InventoryListRoute
  '/sellers/$sellerId': typeof SellersSellerIdRouteWithChildren
  '/treeSpecies/edit': typeof TreeSpeciesEditRoute
  '/buyers/$buyerId/bought-pieces-list': typeof BuyersBuyerIdBoughtPiecesListRoute
  '/buyers/$buyerId/wood-piece-offers-list': typeof BuyersBuyerIdWoodPieceOffersListRoute
  '/sellers/$sellerId/sold-pieces-list': typeof SellersSellerIdSoldPiecesListRoute
  '/sellers/$sellerId/wood-pieces-list': typeof SellersSellerIdWoodPiecesListRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/buyers': typeof BuyersRouteWithChildren
  '/inventory': typeof InventoryRouteWithChildren
  '/sellers': typeof SellersRouteWithChildren
  '/buyers/$buyerId': typeof BuyersBuyerIdRouteWithChildren
  '/inventory/edit': typeof InventoryEditRoute
  '/inventory/list': typeof InventoryListRoute
  '/sellers/$sellerId': typeof SellersSellerIdRouteWithChildren
  '/treeSpecies/edit': typeof TreeSpeciesEditRoute
  '/buyers/$buyerId/bought-pieces-list': typeof BuyersBuyerIdBoughtPiecesListRoute
  '/buyers/$buyerId/wood-piece-offers-list': typeof BuyersBuyerIdWoodPieceOffersListRoute
  '/sellers/$sellerId/sold-pieces-list': typeof SellersSellerIdSoldPiecesListRoute
  '/sellers/$sellerId/wood-pieces-list': typeof SellersSellerIdWoodPiecesListRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/buyers'
    | '/inventory'
    | '/sellers'
    | '/buyers/$buyerId'
    | '/inventory/edit'
    | '/inventory/list'
    | '/sellers/$sellerId'
    | '/treeSpecies/edit'
    | '/buyers/$buyerId/bought-pieces-list'
    | '/buyers/$buyerId/wood-piece-offers-list'
    | '/sellers/$sellerId/sold-pieces-list'
    | '/sellers/$sellerId/wood-pieces-list'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/buyers'
    | '/inventory'
    | '/sellers'
    | '/buyers/$buyerId'
    | '/inventory/edit'
    | '/inventory/list'
    | '/sellers/$sellerId'
    | '/treeSpecies/edit'
    | '/buyers/$buyerId/bought-pieces-list'
    | '/buyers/$buyerId/wood-piece-offers-list'
    | '/sellers/$sellerId/sold-pieces-list'
    | '/sellers/$sellerId/wood-pieces-list'
  id:
    | '__root__'
    | '/'
    | '/buyers'
    | '/inventory'
    | '/sellers'
    | '/buyers/$buyerId'
    | '/inventory/edit'
    | '/inventory/list'
    | '/sellers/$sellerId'
    | '/treeSpecies/edit'
    | '/buyers/$buyerId/bought-pieces-list'
    | '/buyers/$buyerId/wood-piece-offers-list'
    | '/sellers/$sellerId/sold-pieces-list'
    | '/sellers/$sellerId/wood-pieces-list'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  BuyersRoute: typeof BuyersRouteWithChildren
  InventoryRoute: typeof InventoryRouteWithChildren
  SellersRoute: typeof SellersRouteWithChildren
  TreeSpeciesEditRoute: typeof TreeSpeciesEditRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  BuyersRoute: BuyersRouteWithChildren,
  InventoryRoute: InventoryRouteWithChildren,
  SellersRoute: SellersRouteWithChildren,
  TreeSpeciesEditRoute: TreeSpeciesEditRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/buyers",
        "/inventory",
        "/sellers",
        "/treeSpecies/edit"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/buyers": {
      "filePath": "buyers.tsx",
      "children": [
        "/buyers/$buyerId"
      ]
    },
    "/inventory": {
      "filePath": "inventory.tsx",
      "children": [
        "/inventory/edit",
        "/inventory/list"
      ]
    },
    "/sellers": {
      "filePath": "sellers.tsx",
      "children": [
        "/sellers/$sellerId"
      ]
    },
    "/buyers/$buyerId": {
      "filePath": "buyers/$buyerId.tsx",
      "parent": "/buyers",
      "children": [
        "/buyers/$buyerId/bought-pieces-list",
        "/buyers/$buyerId/wood-piece-offers-list"
      ]
    },
    "/inventory/edit": {
      "filePath": "inventory/edit.tsx",
      "parent": "/inventory"
    },
    "/inventory/list": {
      "filePath": "inventory/list.tsx",
      "parent": "/inventory"
    },
    "/sellers/$sellerId": {
      "filePath": "sellers/$sellerId.tsx",
      "parent": "/sellers",
      "children": [
        "/sellers/$sellerId/sold-pieces-list",
        "/sellers/$sellerId/wood-pieces-list"
      ]
    },
    "/treeSpecies/edit": {
      "filePath": "treeSpecies/edit.tsx"
    },
    "/buyers/$buyerId/bought-pieces-list": {
      "filePath": "buyers/$buyerId/bought-pieces-list.tsx",
      "parent": "/buyers/$buyerId"
    },
    "/buyers/$buyerId/wood-piece-offers-list": {
      "filePath": "buyers/$buyerId/wood-piece-offers-list.tsx",
      "parent": "/buyers/$buyerId"
    },
    "/sellers/$sellerId/sold-pieces-list": {
      "filePath": "sellers/$sellerId/sold-pieces-list.tsx",
      "parent": "/sellers/$sellerId"
    },
    "/sellers/$sellerId/wood-pieces-list": {
      "filePath": "sellers/$sellerId/wood-pieces-list.tsx",
      "parent": "/sellers/$sellerId"
    }
  }
}
ROUTE_MANIFEST_END */
