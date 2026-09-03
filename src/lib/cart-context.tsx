"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductVariant, StoreCurrency } from "@/types";
import { getHeroUrl } from "@/lib/product-mapper";
import { currencyForCountry, defaultCurrency, getVariantPrice } from "@/lib/utils";

const CART_STORAGE_KEY = "peak-activewear-cart";
const WISHLIST_STORAGE_KEY = "peak-activewear-wishlist";
const CURRENCY_STORAGE_KEY = "peak-activewear-currency";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  wishlist: string[];
  currency: StoreCurrency;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      product: Product;
      variant: ProductVariant;
      size: string;
      quantity: number;
      currency: StoreCurrency;
    }
  | { type: "REMOVE_ITEM"; variantId: string; size: string }
  | { type: "UPDATE_QUANTITY"; variantId: string; size: string; quantity: number }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "TOGGLE_WISHLIST"; productId: string }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; items: CartItem[] }
  | { type: "LOAD_WISHLIST"; ids: string[] }
  | { type: "SET_CURRENCY"; currency: StoreCurrency };

interface CartContextValue extends CartState {
  addItem: (
    product: Product,
    variant: ProductVariant,
    size: string,
    quantity: number
  ) => void;
  removeItem: (variantId: string, size: string) => void;
  updateQuantity: (variantId: string, size: string, quantity: number) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setCurrency: (currency: StoreCurrency) => void;
  totalItems: number;
  totalPriceCents: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(variantId: string, size: string) {
  return `${variantId}:${size}`;
}

function toCartItem(
  product: Product,
  variant: ProductVariant,
  size: string,
  quantity: number,
  currency: StoreCurrency
): CartItem {
  return {
    productId: product.id,
    variantId: variant.id,
    productSlug: product.slug,
    productName: product.name,
    colorName: variant.colorName,
    priceCents: getVariantPrice(variant, currency),
    currency,
    imageUrl: getHeroUrl(product, variant.id),
    size,
    quantity,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = toCartItem(
        action.product,
        action.variant,
        action.size,
        action.quantity,
        action.currency
      );
      const existing = state.items.find(
        (i) => itemKey(i.variantId, i.size) === itemKey(newItem.variantId, newItem.size)
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            itemKey(i.variantId, i.size) === itemKey(newItem.variantId, newItem.size)
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
          isOpen: true,
        };
      }
      return { ...state, items: [...state.items, newItem], isOpen: true };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) => itemKey(i.variantId, i.size) !== itemKey(action.variantId, action.size)
        ),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          itemKey(i.variantId, i.size) === itemKey(action.variantId, action.size)
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "TOGGLE_WISHLIST": {
      const inList = state.wishlist.includes(action.productId);
      return {
        ...state,
        wishlist: inList
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "LOAD_CART":
      return { ...state, items: action.items };
    case "LOAD_WISHLIST":
      return { ...state, wishlist: action.ids };
    case "SET_CURRENCY":
      return { ...state, currency: action.currency };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    wishlist: [],
    currency: defaultCurrency(),
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        dispatch({ type: "LOAD_CART", items: JSON.parse(savedCart) as CartItem[] });
      }
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        dispatch({ type: "LOAD_WISHLIST", ids: JSON.parse(savedWishlist) as string[] });
      }
      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency === "pkr" || savedCurrency === "usd") {
        dispatch({ type: "SET_CURRENCY", currency: savedCurrency });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.wishlist));
  }, [state.wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CURRENCY_STORAGE_KEY, state.currency);
  }, [state.currency, hydrated]);

  const addItem = useCallback(
    (product: Product, variant: ProductVariant, size: string, quantity: number) =>
      dispatch({
        type: "ADD_ITEM",
        product,
        variant,
        size,
        quantity,
        currency: state.currency,
      }),
    [state.currency]
  );

  const removeItem = useCallback(
    (variantId: string, size: string) =>
      dispatch({ type: "REMOVE_ITEM", variantId, size }),
    []
  );

  const updateQuantity = useCallback(
    (variantId: string, size: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", variantId, size, quantity }),
    []
  );

  const toggleCart = useCallback(() => dispatch({ type: "TOGGLE_CART" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);
  const toggleWishlist = useCallback(
    (productId: string) => dispatch({ type: "TOGGLE_WISHLIST", productId }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const setCurrency = useCallback(
    (currency: StoreCurrency) => dispatch({ type: "SET_CURRENCY", currency }),
    []
  );

  const isWishlisted = useCallback(
    (productId: string) => state.wishlist.includes(productId),
    [state.wishlist]
  );

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPriceCents = state.items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        toggleCart,
        openCart,
        closeCart,
        toggleWishlist,
        isWishlisted,
        setCurrency,
        totalItems,
        totalPriceCents,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useCheckoutCurrency(countryCode?: string): StoreCurrency {
  const { currency, setCurrency } = useCart();
  useEffect(() => {
    if (countryCode) {
      setCurrency(currencyForCountry(countryCode));
    }
  }, [countryCode, setCurrency]);
  return currency;
}
