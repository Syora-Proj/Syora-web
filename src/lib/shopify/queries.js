/**
 * SYORA — Shopify Storefront API: GraphQL Queries & Mutations
 *
 * All GraphQL operations are centralised here.
 * Components and hooks import named exports from this file only —
 * they never construct inline query strings.
 *
 * API version: 2025-01
 */

/* ─────────────────────────────────────────────────────────────
   FRAGMENTS
───────────────────────────────────────────────────────────── */

const MONEY_FRAGMENT = `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

const IMAGE_FRAGMENT = `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

const PRODUCT_CARD_FRAGMENT = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  fragment ProductCardFields on Product {
    id
    title
    handle
    availableForSale
    featuredImage {
      ...ImageFields
    }
    images(first: 20) {
      edges {
        node {
          ...ImageFields
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyFields
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFields
      }
    }
    tags
  }
`;

const VARIANT_FRAGMENT = `
  ${MONEY_FRAGMENT}
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    sku
    price {
      ...MoneyFields
    }
    compareAtPrice {
      ...MoneyFields
    }
    selectedOptions {
      name
      value
    }
    image {
      ...ImageFields
    }
  }
`;

/* ─────────────────────────────────────────────────────────────
   SHOP — connection test
───────────────────────────────────────────────────────────── */

/**
 * Minimal shop query — used solely to verify API connectivity.
 * Returns the shop name. Does not expose any sensitive information.
 */
export const SHOP_QUERY = `
  query ShopInfo {
    shop {
      name
      primaryDomain {
        host
      }
    }
  }
`;

/* ─────────────────────────────────────────────────────────────
   COLLECTION — product listings for universe pages
───────────────────────────────────────────────────────────── */

/**
 * Fetch products in a collection by handle.
 * Variables: { handle: string, first: number, after?: string }
 */
export const COLLECTION_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(first: $first, after: $after, sortKey: BEST_SELLING) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...ProductCardFields
          }
        }
      }
    }
  }
`;

/* ─────────────────────────────────────────────────────────────
   PRODUCT — full product detail page
───────────────────────────────────────────────────────────── */

/**
 * Fetch a single product by handle for the PDP.
 * Variables: { handle: string }
 */
export const PRODUCT_BY_HANDLE_QUERY = `
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      description
      availableForSale
      tags
      vendor
      productType
      featuredImage {
        ...ImageFields
      }
      images(first: 20) {
        edges {
          node {
            ...ImageFields
          }
        }
      }
      options {
        id
        name
        values
      }
      priceRange {
        minVariantPrice {
          ...MoneyFields
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          ...MoneyFields
        }
      }
      variants(first: 50) {
        edges {
          node {
            ...VariantFields
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
`;

/* ─────────────────────────────────────────────────────────────
   CART — mutations and queries
   Uses the Storefront Cart API (not the deprecated checkoutCreate)
───────────────────────────────────────────────────────────── */

const CART_FRAGMENT = `
  ${MONEY_FRAGMENT}
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...MoneyFields
      }
      totalAmount {
        ...MoneyFields
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              ...MoneyFields
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              sku
              price {
                ...MoneyFields
              }
              product {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    discountCodes {
      code
      applicable
    }
  }
`;

/** Retrieve an existing cart by ID. */
export const CART_QUERY = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

/** Create a new cart with optional initial line items. */
export const CART_CREATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Add line items to an existing cart. */
export const CART_LINES_ADD_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Update quantity of an existing cart line. */
export const CART_LINES_UPDATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Remove line items from a cart. */
export const CART_LINES_REMOVE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;
