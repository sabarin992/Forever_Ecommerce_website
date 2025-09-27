import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets";
import { toast } from "react-toastify";
import api from "../api";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 100;

  // product
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // cart
  const [cartItems, setCartItems] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [isRomoveCartItem, setIsRomoveCartItem] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartData, setCartData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [cartId, setCartId] = useState(0);
  const [isChangeQuantity, setIsChangeQuantity] = useState(false);
  const [isAddToCart, setIsAddToCart] = useState(false);

  // wishlist
  const [wishlistItems, setWishListItems] = useState([]);
  const [isChangeWishList, setIsChangeWishList] = useState(false);
  const [wishListCount, setWishListCount] = useState(0);

  const [activePage, setActivePage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [cartError, setCartError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch products when ShopContextProvider mounts
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await api.get("/products/", { withCredentials: true });

        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    // console.log('update cart data');

    const updateCart = async () => {
      if (cartId !== 0) {
        try {
          const res = await api.put(
            `/update_cart/${cartId}/`,
            { quantity: quantity },
            { withCredentials: true } // 👈 here too
          );

          setIsChangeQuantity(!isChangeQuantity);
          setCartError(false);
          // console.log(res.data);
        } catch (error) {
          // catch (error) {
          //   setCartError(true)
          //   if (error?.response?.data?.error) {
          //     const match = error?.response?.data?.error.match(/'([^']+)'/);
          //     const cleanMessage = match
          //       ? match[1]
          //       : error?.response?.data?.error;

          //     console.log(cleanMessage);
          //     toast.error(cleanMessage);
          //   }
          // }
          setCartError(true);
          const errorData = error?.response?.data;

          if (errorData?.error) {
            // Handle string or array type error messages
            const cleanMessage = Array.isArray(errorData.error)
              ? errorData.error[0] // take first error message
              : errorData.error;

            console.log(cleanMessage);
            toast.error(cleanMessage);
          } else {
            toast.error("Failed to update cart.");
          }
        }
      } else {
      }
    };
    updateCart();
  }, [quantity]);

  // useEffect for get all cart product
  useEffect(() => {
    // console.log('Get all cart data');
    const getCartDatas = async () => {
      try {
        const res = await api.get("/get_all_cart_products/", {
          params: { page: activePage },
          withCredentials: true, // 👈 here
        });

        // console.log(res.data.cart_data);
        console.log(res.data.cart_data.results);

        setCartData(res.data.cart_data.results);
        setHasNext(res.data.cart_data.has_next);
        setHasPrevious(res.data.cart_data.has_previous);
        setTotalPages(res.data.cart_data.total_pages);
        setTotalPrice(res.data.total_price);
        setTotalDiscount(res.data.total_discount);
        setCartCount(res.data.cart_count);
      } catch (error) {
        console.log("error");
      }
    };
    getCartDatas();

    // setCartData(tempData)
  }, [quantity, isRomoveCartItem, isChangeQuantity, isAddToCart, activePage]);

  // useEffect for get all wishlist product
  useEffect(() => {
    const getWishListItems = async () => {
      try {
        const res = await api.get("/get_all_wishlist_products/", {
          withCredentials: true,
        });

        setWishListItems(res.data.wishlist_data);
        setWishListCount(res.data.wishlist_count);
      } catch (error) {}
    };
    getWishListItems();
  }, [isAddToCart, isChangeWishList]);

  const removeCartItem = async (id) => {
    try {
      const res = await api.delete(`/remove_cartitem/${id}/`, {
        withCredentials: true,
      });

      setIsRomoveCartItem(!isRomoveCartItem);
      toast.success(res.data);
    } catch (error) {}
  };

  const value = {
    products,
    setProducts,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartData,
    totalPrice,
    totalDiscount,
    quantity,
    setQuantity,
    setCartId,
    removeCartItem,
    isRomoveCartItem,
    setIsRomoveCartItem,
    cartCount,
    isChangeQuantity,
    setIsChangeQuantity,
    isAddToCart,
    setIsAddToCart,
    activePage,
    setActivePage,
    hasNext,
    hasPrevious,
    totalPages,
    wishlistItems,
    setWishListItems,
    isChangeWishList,
    setIsChangeWishList,
    wishListCount,
    cartError,
    isAuthenticated,
    setIsAuthenticated,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
