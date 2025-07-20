import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "@/context/ShopContext";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle, Trash, X } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../utils/alert";
import RazorpayCheckout from "@/components/RazorPayCheckout";
import Coupon from "@/components/Coupon";
import ShowALLValidCoupons from "@/components/ShowALLValidCoupons";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("COD");
  const [status,setStatus] = useState('PENDING')
  const [customer, setCustomer] = useState({});
  const [shipAddress, setShipAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const {totalPrice,totalDiscount,delivery_fee } = useContext(ShopContext);
  const [discount, setDiscount] = useState(null);
  const navigate = useNavigate();
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  
  // Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressData, setAddressData] = useState({
    name: "",
    phone_no: "",
    street_address: "",
    city: "",
    state: "",
    pin_code: "",
    country: "",
  });
  const [addressErrors, setAddressErrors] = useState({});

  // get total price 

  const getTotalPrice = ()=>{
    const total_price =
    totalDiscount && discount
      ? totalPrice - (totalDiscount + (((totalPrice-totalDiscount)*discount)/100))
      : totalDiscount
      ? totalPrice - totalDiscount
      : discount
      ? totalPrice - discount
      : totalPrice;
      return total_price
      
    }

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData({ ...addressData, [name]: value });
    
    // Clear error when user starts typing
    if (addressErrors[name]) {
      setAddressErrors({ ...addressErrors, [name]: "" });
    }
  };

  const validateAddressForm = () => {
    const errors = {};
    
    // Name validation
    if (!addressData.name.trim()) {
      errors.name = "Name is required";
    } else if (addressData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(addressData.name.trim())) {
      errors.name = "Name can only contain letters and spaces";
    }
    
    // Phone number validation
    if (!addressData.phone_no.trim()) {
      errors.phone_no = "Phone number is required";
    } else if (!/^\d{10}$/.test(addressData.phone_no.trim())) {
      errors.phone_no = "Phone number must be exactly 10 digits";
    }
    
    // Street address validation
    if (!addressData.street_address.trim()) {
      errors.street_address = "Street address is required";
    } else if (addressData.street_address.trim().length < 5) {
      errors.street_address = "Street address must be at least 5 characters long";
    }
    
    // City validation
    if (!addressData.city.trim()) {
      errors.city = "City is required";
    } else if (addressData.city.trim().length < 2) {
      errors.city = "City must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(addressData.city.trim())) {
      errors.city = "City can only contain letters and spaces";
    }
    
    // State validation
    if (!addressData.state.trim()) {
      errors.state = "State is required";
    } else if (addressData.state.trim().length < 2) {
      errors.state = "State must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(addressData.state.trim())) {
      errors.state = "State can only contain letters and spaces";
    }
    
    // Pin code validation
    if (!addressData.pin_code.trim()) {
      errors.pin_code = "Pin code is required";
    } else if (!/^\d{6}$/.test(addressData.pin_code.trim())) {
      errors.pin_code = "Pin code must be exactly 6 digits";
    }
    
    // Country validation
    if (!addressData.country.trim()) {
      errors.country = "Country is required";
    } else if (addressData.country.trim().length < 2) {
      errors.country = "Country must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(addressData.country.trim())) {
      errors.country = "Country can only contain letters and spaces";
    }
    
    return errors;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateAddressForm();
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    
    try {
      const response = await api.post("/add_address/", addressData);
      console.log(addressData);
      
      toast.success("Address added successfully!");
      
      // Reset form data
      setAddressData({
        name: "",
        phone_no: "",
        street_address: "",
        city: "",
        state: "",
        pin_code: "",
        country: "",
      });
      
      // Clear errors
      setAddressErrors({});
      
      // Close modal
      setShowAddressModal(false);
      
      // Refresh addresses
      getAddresses();
      
    } catch (error) {
      console.log(error);
      toast.error("Failed to add address.");
    }
  };

  const handlePlaceOrder = async () => {
    console.log(method);
    try {
      const res = await api.post(`/place_order/`, {
        // address_id: shipAddress,
        // total:totalAmount,
        // discounted_amount: totalAmount * (discount / 100),
        address_id: shipAddress,
        total_price:totalPrice,
        total_discount:totalDiscount,
        coupon_discount:discount,
        final_amount:getTotalPrice(),
   


        // totalAmount - (Discounted amount)
        // ===================================

        // total: discount
        //   ? (totalAmount) - (totalAmount * (discount / 100))
        //   : totalAmount,

          couponCode:couponCode,
          payment_method:method,
          payment_status:status
      });
      console.log(res.data);
      showSuccessAlert(
        "Order Placed",
        "Your order has been successfully placed!"
      );
      navigate("/order-success", { state: { orderId: res.data.order_id,discount:discount } });
    } catch (error) {
      // console.log(error)
      // console.log(error?.response?.data);
      toast.error(error?.response?.data?.error)
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const response = await api.post("create_order/", {

        // totalAmount only
        // ================

        // totalAmount:totalAmount

        // totalAmount - (Discounted amount)
        // ===================================

        totalAmount: getTotalPrice()
      });

      const data = response.data;
      const createdOrderId = data.order_id;

      const options = {
        key: data.razorpay_key,
        amount: data.amount,
        currency: "INR",
        name: "My Shop",
        description: "Purchase Payment",
        order_id: createdOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/verify_payment/", {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            const res = await api.post(`/place_order/`, {
              address_id: shipAddress,

              // totalAmount - (Discounted amount)
              // ===================================

              // total: discount
              //   ? (totalAmount ) - (totalAmount * (discount / 100))
              //   : totalAmount,

              // totalAmount only
              address_id: shipAddress,
              total_price:totalPrice,
              total_discount:totalDiscount,
              coupon_discount:discount,
              final_amount:getTotalPrice(),
              payment_method: method,
              payment_status: 'CONFIRMED',
              couponCode: couponCode,
            });

            showSuccessAlert(
              "Order Placed",
              "Your order has been successfully placed!"
            );
            navigate("/order-success", { state: { orderId: res.data.order_id } });
          } catch (error) {
            console.log(error)
            console.log(error?.response?.data);
            toast.error(error?.response?.data?.error);
          }
        },
        prefill: {
          name: customer.first_name || "Customer Name",
          email: customer.email || "customer@example.com",
          contact: customer.phone_number || "9999999999",
        },
        theme: {
          color: "#0d6efd",
        },
        modal: {
          ondismiss: async function () {
            try {
              const res = await api.post(`/place_order/`, {
                address_id: shipAddress,
                // total: discount
                //   ? (totalAmount ) - (totalAmount * (discount / 100))
                //   : totalAmount,

                total:totalAmount,
                discounted_amount: totalAmount * (discount / 100),
                payment_method: method,
                payment_status: 'PAYMENT_PENDING',
                couponCode: couponCode,
              });

              toast.info("Payment was cancelled. Order placed with payment pending status.");
              navigate("/payment-failed", { 
                state: { 
                  orderId: res.data.order_id,
                  message: "Payment was cancelled but your order has been placed with payment pending status."
                } 
              });
            } catch (error) {
              console.log(error.response?.data);
              toast.error("Failed to place order with pending payment status.");
              navigate("/payment-failed", { 
                state: { 
                  orderId: createdOrderId,
                  error: "Failed to place order"
                } 
              });
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Unable to start payment");
    }
  };

  const getAddresses = async () => {
    try {
      const res = await api.get("/get_all_addresses/");
      setAddresses(res.data.addresses_data);
      setCustomer(res.data.customer);
      setShipAddress(res.data.primary_address_id);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getAddresses();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* ---------------- Left Side ------------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"Choose"} text2={"Address"} />
        </div>
        <div className="flex justify-end mb-4">
          <Button
            variant="default"
            onClick={() => setShowAddressModal(true)}
            className="bg-black text-white rounded-md hover:bg-black/90 w-52"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            ADD NEW ADDRESS
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {addresses?.map((address) => (
            <div
              key={address.id}
              className="flex justify-between items-center border p-4 rounded-md"
            >
              <div>
                <h2 className="text-lg font-semibold">{address.name}</h2>
                <p>{address.address}</p>
                <p>
                  {address.city}, {address.state} - {address.zipcode}
                </p>
              </div>
              <div className="flex gap-4"></div>
              <p
                onClick={() => {
                  setShipAddress(address.id);
                }}
                className={`min-w-3.5 h-3.5 border rounded-full cursor-pointer ${
                  shipAddress === address.id ? "bg-black" : ""
                }`}
              ></p>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Right Side -------------- */}
      <div className="mt-8">
        <div className="my-8 min-w-80 ">
          <CartTotal totalPrice = {totalPrice} totalDiscount={totalDiscount} discount={discount} />
        </div>
        {/* coupon */}
        <div className="flex gap-4 items-center">
          <Coupon
            cartTotal={totalPrice}
            discount={discount}
            setDiscount={setDiscount}
            couponCode = {couponCode}
            setCouponCode = {setCouponCode}
          />
          <Button
            variant="outline"
            className="border border-black text-black hover:bg-gray-100"
            onClick={() => setShowCoupons(!showCoupons)}
          >
            {showCoupons ? "Hide Coupons" : "Show Coupons"}
          </Button>
        </div>
        {discount && (
          <p className="text-green-600 mt-2">
            Coupon applied! You get {discount}% off.
          </p>
        )}

        {showCoupons && <ShowALLValidCoupons />}

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          {/* ------ Payment Method Selection ------ */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => {
                setMethod("WALLET");
                setStatus('CONFIRMED')
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "WALLET" ? "bg-black" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                WALLET
              </p>
            </div>
            <div
              onClick={() => {
                setMethod("RAZORPAY");
                setStatus('CONFIRMED')
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "RAZORPAY" ? "bg-black" : ""
                }`}
              ></p>
              <img className="h-5 mx-4 " src={assets.razorpay_logo} alt="" />
            </div>
            <div
              onClick={() => {
                setMethod("COD");
                setStatus('PENDING')
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "COD" ? "bg-black" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button
              onClick={
                method === "COD" || method === 'WALLET'
                  ? handlePlaceOrder
                  : method === "RAZORPAY"
                  ? handlePayment
                  : () => {}
              }
              className="bg-black text-white text-sm my-8 px-16 py-3"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Add Address Modal -------------- */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Add Address</h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <input
                  className={`w-full px-3 py-2 border rounded ${
                    addressErrors.name ? 'border-red-500' : 'border-gray-800'
                  }`}
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={addressData.name}
                  onChange={handleAddressChange}
                />
                {addressErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{addressErrors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <input
                  className={`w-full px-3 py-2 border rounded ${
                    addressErrors.phone_no ? 'border-red-500' : 'border-gray-800'
                  }`}
                  type="text"
                  name="phone_no"
                  placeholder="Phone Number"
                  value={addressData.phone_no}
                  onChange={handleAddressChange}
                />
                {addressErrors.phone_no && (
                  <p className="text-red-500 text-sm mt-1">{addressErrors.phone_no}</p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <input
                  className={`w-full px-3 py-2 border rounded ${
                    addressErrors.street_address ? 'border-red-500' : 'border-gray-800'
                  }`}
                  type="text"
                  name="street_address"
                  placeholder="Street Address"
                  value={addressData.street_address}
                  onChange={handleAddressChange}
                />
                {addressErrors.street_address && (
                  <p className="text-red-500 text-sm mt-1">{addressErrors.street_address}</p>
                )}
              </div>

              {/* City */}
              <div>
                <input
                  className={`w-full px-3 py-2 border rounded ${
                    addressErrors.city ? 'border-red-500' : 'border-gray-800'
                  }`}
                  type="text"
                  name="city"
                  placeholder="City"
                  value={addressData.city}
                  onChange={handleAddressChange}
                />
                {addressErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{addressErrors.city}</p>
                )}
              </div>

              {/* State */}
              <div>
                <input
                  className={`w-full px-3 py-2 border rounded ${
                    addressErrors.state ? 'border-red-500' : 'border-gray-800'
                  }`}
                  type="text"
                  name="state"
                  placeholder="State"
                  value={addressData.state}
                  onChange={handleAddressChange}
                />
                {addressErrors.state && (
                  <p className="text-red-500 text-sm mt-1">{addressErrors.state}</p>
                )}
              </div>

              {/* Pin Code */}
              <div>
                <input
                  className={`w-full px-3 py-2 border rounded ${
                    addressErrors.pin_code ? 'border-red-500' : 'border-gray-800'
                  }`}
                  type="text"
                  name="pin_code"
                  placeholder="Pin Code"
                  value={addressData.pin_code}
                  onChange={handleAddressChange}
                />
                {addressErrors.pin_code && (
                  <p className="text-red-500 text-sm mt-1">{addressErrors.pin_code}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <input
                  className={`w-full px-3 py-2 border rounded ${
                    addressErrors.country ? 'border-red-500' : 'border-gray-800'
                  }`}
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={addressData.country}
                  onChange={handleAddressChange}
                />
                {addressErrors.country && (
                  <p className="text-red-500 text-sm mt-1">{addressErrors.country}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Add Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;

// import React, { useContext, useEffect, useState } from "react";
// import Title from "../components/Title";
// import CartTotal from "../components/CartTotal";
// import { assets } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { ShopContext } from "@/context/ShopContext";
// import api from "@/api";
// import { Button } from "@/components/ui/button";
// import { Edit, PlusCircle, Trash, X } from "lucide-react";
// import { showSuccessAlert, showErrorAlert } from "../utils/alert";
// import RazorpayCheckout from "@/components/RazorPayCheckout";
// import Coupon from "@/components/Coupon";
// import ShowALLValidCoupons from "@/components/ShowALLValidCoupons";
// import { toast } from "react-toastify";

// const PlaceOrder = () => {
//   const [method, setMethod] = useState("COD");
//   const [status,setStatus] = useState('PENDING')
//   const [customer, setCustomer] = useState({});
//   const [shipAddress, setShipAddress] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const { totalAmount,delivery_fee } = useContext(ShopContext);
//   const [discount, setDiscount] = useState(null);
//   const navigate = useNavigate();
//   const [showCoupons, setShowCoupons] = useState(false);
//   const [couponCode, setCouponCode] = useState("");
  
//   // Modal state
//   const [showAddressModal, setShowAddressModal] = useState(false);
//   const [addressData, setAddressData] = useState({
//     name: "",
//     phone_no: "",
//     street_address: "",
//     city: "",
//     state: "",
//     pin_code: "",
//     country: "",
//   });

//   const handleAddressChange = (e) => {
//     setAddressData({ ...addressData, [e.target.name]: e.target.value });
//   };

//   const handleAddAddress = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post("/add_address/", addressData);
//       console.log(addressData);
      
//       toast.success("Address added successfully!");
      
//       // Reset form data
//       setAddressData({
//         name: "",
//         phone_no: "",
//         street_address: "",
//         city: "",
//         state: "",
//         pin_code: "",
//         country: "",
//       });
      
//       // Close modal
//       setShowAddressModal(false);
      
//       // Refresh addresses
//       getAddresses();
      
//     } catch (error) {
//       console.log(error);
//       toast.error("Failed to add address.");
//     }
//   };

//   const handlePlaceOrder = async () => {
//     console.log(method);
//     try {
//       const res = await api.post(`/place_order/`, {
//         address_id: shipAddress,
//         total: discount
//           ? (totalAmount+delivery_fee) - (totalAmount * (discount / 100))
//           : totalAmount+delivery_fee,
//           couponCode:couponCode,
//           payment_method:method,
//           payment_status:status
//       });
//       console.log(res.data);
//       showSuccessAlert(
//         "Order Placed",
//         "Your order has been successfully placed!"
//       );
//       navigate("/order-success", { state: { orderId: res.data.order_id } });
//     } catch (error) {
//       console.log(error.response.data);
//       toast.error(error?.response?.data?.error)
//     }
//   };

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handlePayment = async () => {
//     const res = await loadRazorpayScript();
//     if (!res) {
//       alert("Razorpay SDK failed to load.");
//       return;
//     }

//     try {
//       const response = await api.post("create_order/", {
//         totalAmount: discount
//           ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//           : totalAmount + delivery_fee,
//       });

//       const data = response.data;
//       const createdOrderId = data.order_id;

//       const options = {
//         key: data.razorpay_key,
//         amount: data.amount,
//         currency: "INR",
//         name: "My Shop",
//         description: "Purchase Payment",
//         order_id: createdOrderId,
//         handler: async function (response) {
//           try {
//             const verifyRes = await api.post("/verify_payment/", {
//               order_id: response.razorpay_order_id,
//               payment_id: response.razorpay_payment_id,
//               signature: response.razorpay_signature,
//             });

//             const res = await api.post(`/place_order/`, {
//               address_id: shipAddress,
//               total: discount
//                 ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//                 : totalAmount + delivery_fee,
//               payment_method: method,
//               payment_status: 'CONFIRMED',
//               couponCode: couponCode,
//             });

//             showSuccessAlert(
//               "Order Placed",
//               "Your order has been successfully placed!"
//             );
//             navigate("/order-success", { state: { orderId: res.data.order_id } });
//           } catch (error) {
//             console.log(error.response?.data);
//             toast.error(error?.response?.data?.error);
//           }
//         },
//         prefill: {
//           name: customer.first_name || "Customer Name",
//           email: customer.email || "customer@example.com",
//           contact: customer.phone_number || "9999999999",
//         },
//         theme: {
//           color: "#0d6efd",
//         },
//         modal: {
//           ondismiss: async function () {
//             try {
//               const res = await api.post(`/place_order/`, {
//                 address_id: shipAddress,
//                 total: discount
//                   ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//                   : totalAmount + delivery_fee,
//                 payment_method: method,
//                 payment_status: 'PAYMENT_PENDING',
//                 couponCode: couponCode,
//               });

//               toast.info("Payment was cancelled. Order placed with payment pending status.");
//               navigate("/payment-failed", { 
//                 state: { 
//                   orderId: res.data.order_id,
//                   message: "Payment was cancelled but your order has been placed with payment pending status."
//                 } 
//               });
//             } catch (error) {
//               console.log(error.response?.data);
//               toast.error("Failed to place order with pending payment status.");
//               navigate("/payment-failed", { 
//                 state: { 
//                   orderId: createdOrderId,
//                   error: "Failed to place order"
//                 } 
//               });
//             }
//           },
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("Order creation failed:", err);
//       alert("Unable to start payment");
//     }
//   };

//   const getAddresses = async () => {
//     try {
//       const res = await api.get("/get_all_addresses/");
//       setAddresses(res.data.addresses_data);
//       setCustomer(res.data.customer);
//       setShipAddress(res.data.primary_address_id);
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

//   useEffect(() => {
//     getAddresses();
//   }, []);

//   return (
//     <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
//       {/* ---------------- Left Side ------------- */}
//       <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
//         <div className="text-xl sm:text-2xl my-3">
//           <Title text1={"Choose"} text2={"Address"} />
//         </div>
//         <div className="flex justify-end mb-4">
//           <Button
//             variant="default"
//             onClick={() => setShowAddressModal(true)}
//             className="bg-black text-white rounded-md hover:bg-black/90 w-52"
//           >
//             <PlusCircle className="h-5 w-5 mr-2" />
//             ADD NEW ADDRESS
//           </Button>
//         </div>
//         <div className="flex flex-col gap-4">
//           {addresses.map((address) => (
//             <div
//               key={address.id}
//               className="flex justify-between items-center border p-4 rounded-md"
//             >
//               <div>
//                 <h2 className="text-lg font-semibold">{address.name}</h2>
//                 <p>{address.address}</p>
//                 <p>
//                   {address.city}, {address.state} - {address.zipcode}
//                 </p>
//               </div>
//               <div className="flex gap-4"></div>
//               <p
//                 onClick={() => {
//                   setShipAddress(address.id);
//                 }}
//                 className={`min-w-3.5 h-3.5 border rounded-full cursor-pointer ${
//                   shipAddress === address.id ? "bg-black" : ""
//                 }`}
//               ></p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ---------------- Right Side -------------- */}
//       <div className="mt-8">
//         <div className="mt-8 min-w-80 ">
//           <CartTotal totalAmount={totalAmount} discount={discount} />
//         </div>
//         {/* coupon */}
//         <div className="flex gap-4 items-center">
//           <Coupon
//             cartTotal={totalAmount}
//             discount={discount}
//             setDiscount={setDiscount}
//             couponCode = {couponCode}
//             setCouponCode = {setCouponCode}
//           />
//           <Button
//             variant="outline"
//             className="border border-black text-black hover:bg-gray-100"
//             onClick={() => setShowCoupons(!showCoupons)}
//           >
//             {showCoupons ? "Hide Coupons" : "Show Coupons"}
//           </Button>
//         </div>
//         {discount && (
//           <p className="text-green-600 mt-2">
//             Coupon applied! You get {discount}% off.
//           </p>
//         )}

//         {showCoupons && <ShowALLValidCoupons />}

//         <div className="mt-12">
//           <Title text1={"PAYMENT"} text2={"METHOD"} />

//           {/* ------ Payment Method Selection ------ */}
//           <div className="flex gap-3 flex-col lg:flex-row">
//             <div
//               onClick={() => {
//                 setMethod("WALLET");
//                 setStatus('CONFIRMED')
//               }}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "WALLET" ? "bg-black" : ""
//                 }`}
//               ></p>
//               <p className="text-gray-500 text-sm font-medium mx-4">
//                 WALLET
//               </p>
//             </div>
//             <div
//               onClick={() => {
//                 setMethod("RAZORPAY");
//                 setStatus('CONFIRMED')
//               }}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "RAZORPAY" ? "bg-black" : ""
//                 }`}
//               ></p>
//               <img className="h-5 mx-4 " src={assets.razorpay_logo} alt="" />
//             </div>
//             <div
//               onClick={() => {
//                 setMethod("COD");
//                 setStatus('PENDING')
//               }}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "COD" ? "bg-black" : ""
//                 }`}
//               ></p>
//               <p className="text-gray-500 text-sm font-medium mx-4">
//                 CASH ON DELIVERY
//               </p>
//             </div>
//           </div>
//           <div className="w-full text-end mt-8">
//             <button
//               onClick={
//                 method === "COD" || method === 'WALLET'
//                   ? handlePlaceOrder
//                   : method === "RAZORPAY"
//                   ? handlePayment
//                   : () => {}
//               }
//               className="bg-black text-white text-sm my-8 px-16 py-3"
//             >
//               PLACE ORDER
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ---------------- Add Address Modal -------------- */}
//       {showAddressModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-semibold">Add Address</h2>
//               <button
//                 onClick={() => setShowAddressModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X className="h-6 w-6" />
//               </button>
//             </div>

//             <form onSubmit={handleAddAddress} className="flex flex-col gap-4">
//               {/* Name */}
//               <input
//                 className="w-full px-3 py-2 border border-gray-800 rounded"
//                 type="text"
//                 name="name"
//                 placeholder="Name"
//                 value={addressData.name}
//                 onChange={handleAddressChange}
//                 required
//               />

//               {/* Phone Number */}
//               <input
//                 className="w-full px-3 py-2 border border-gray-800 rounded"
//                 type="text"
//                 name="phone_no"
//                 placeholder="Phone Number"
//                 value={addressData.phone_no}
//                 onChange={handleAddressChange}
//                 required
//               />

//               {/* Street Address */}
//               <input
//                 className="w-full px-3 py-2 border border-gray-800 rounded"
//                 type="text"
//                 name="street_address"
//                 placeholder="Street Address"
//                 value={addressData.street_address}
//                 onChange={handleAddressChange}
//                 required
//               />

//               {/* City */}
//               <input
//                 className="w-full px-3 py-2 border border-gray-800 rounded"
//                 type="text"
//                 name="city"
//                 placeholder="City"
//                 value={addressData.city}
//                 onChange={handleAddressChange}
//                 required
//               />

//               {/* State */}
//               <input
//                 className="w-full px-3 py-2 border border-gray-800 rounded"
//                 type="text"
//                 name="state"
//                 placeholder="State"
//                 value={addressData.state}
//                 onChange={handleAddressChange}
//                 required
//               />

//               {/* Pin Code */}
//               <input
//                 className="w-full px-3 py-2 border border-gray-800 rounded"
//                 type="text"
//                 name="pin_code"
//                 placeholder="Pin Code"
//                 value={addressData.pin_code}
//                 onChange={handleAddressChange}
//                 required
//               />

//               {/* Country */}
//               <input
//                 className="w-full px-3 py-2 border border-gray-800 rounded"
//                 type="text"
//                 name="country"
//                 placeholder="Country"
//                 value={addressData.country}
//                 onChange={handleAddressChange}
//                 required
//               />

//               {/* Form Actions */}
//               <div className="flex gap-3 mt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddressModal(false)}
//                   className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
//                 >
//                   Add Address
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlaceOrder;


// import React, { useContext, useEffect, useState } from "react";
// import Title from "../components/Title";
// import CartTotal from "../components/CartTotal";
// import { assets } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { ShopContext } from "@/context/ShopContext";
// import api from "@/api";
// import { Button } from "@/components/ui/button";
// import { Edit, PlusCircle, Trash } from "lucide-react";
// import { showSuccessAlert, showErrorAlert } from "../utils/alert";
// import RazorpayCheckout from "@/components/RazorPayCheckout";
// import Coupon from "@/components/Coupon";
// import ShowALLValidCoupons from "@/components/ShowALLValidCoupons";
// import { toast } from "react-toastify";

// const PlaceOrder = () => {
//   const [method, setMethod] = useState("COD");
//   const [status,setStatus] = useState('PENDING')
//   const [customer, setCustomer] = useState({});
//   const [shipAddress, setShipAddress] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const { totalAmount,delivery_fee } = useContext(ShopContext);
//   const [discount, setDiscount] = useState(null);
//   const navigate = useNavigate();
//   const [showCoupons, setShowCoupons] = useState(false);
//   const [couponCode, setCouponCode] = useState("");






//  const handlePlaceOrder = async () => {
//     console.log(method);
//     try {
//       const res = await api.post(`/place_order/`, {
//         address_id: shipAddress,
//         total: discount
//           ? (totalAmount+delivery_fee) - (totalAmount * (discount / 100))
//           : totalAmount+delivery_fee,
//           couponCode:couponCode,
//           payment_method:method,
//           payment_status:status
//       });
//       console.log(res.data);
//       showSuccessAlert(
//         "Order Placed",
//         "Your order has been successfully placed!"
//       );
//       navigate("/order-success", { state: { orderId: res.data.order_id } });
//     } catch (error) {
//       console.log(error.response.data);
//       toast.error(error?.response?.data?.error)
//     }
//   };

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };
  

// const handlePayment = async () => {
//   const res = await loadRazorpayScript();
//   if (!res) {
//     alert("Razorpay SDK failed to load.");
//     return;
//   }

//   try {
//     const response = await api.post("create_order/", {
//       totalAmount: discount
//         ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//         : totalAmount + delivery_fee,
//     });

//     const data = response.data;
//     const createdOrderId = data.order_id; // Store it here

//     const options = {
//       key: data.razorpay_key,
//       amount: data.amount,
//       currency: "INR",
//       name: "My Shop",
//       description: "Purchase Payment",
//       order_id: createdOrderId,
//       handler: async function (response) {
//         try {
//           const verifyRes = await api.post("/verify_payment/", {
//             order_id: response.razorpay_order_id,
//             payment_id: response.razorpay_payment_id,
//             signature: response.razorpay_signature,
//           });

//           // place order with successful payment
//           const res = await api.post(`/place_order/`, {
//             address_id: shipAddress,
//             total: discount
//               ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//               : totalAmount + delivery_fee,
//             payment_method: method,
//             payment_status: 'CONFIRMED', // Payment successful
//             couponCode: couponCode,
//           });

//           showSuccessAlert(
//             "Order Placed",
//             "Your order has been successfully placed!"
//           );
//           navigate("/order-success", { state: { orderId: res.data.order_id } });
//         } catch (error) {
//           console.log(error.response?.data);
//           toast.error(error?.response?.data?.error);
//         }
//       },
//       prefill: {
//         name: customer.first_name || "Customer Name",
//         email: customer.email || "customer@example.com",
//         contact: customer.phone_number || "9999999999",
//       },
//       theme: {
//         color: "#0d6efd",
//       },
//       modal: {
//         ondismiss: async function () {
//           // This function is called when payment modal is closed/cancelled
//           try {
//             // Place order with PAYMENT_PENDING status
//             const res = await api.post(`/place_order/`, {
//               address_id: shipAddress,
//               total: discount
//                 ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//                 : totalAmount + delivery_fee,
//               payment_method: method,
//               payment_status: 'PAYMENT_PENDING', // Payment failed/cancelled
//               couponCode: couponCode,
//             });

//             // Show appropriate message and navigate
//             toast.info("Payment was cancelled. Order placed with payment pending status.");
//             navigate("/payment-failed", { 
//               state: { 
//                 orderId: res.data.order_id,
//                 message: "Payment was cancelled but your order has been placed with payment pending status."
//               } 
//             });
//           } catch (error) {
//             console.log(error.response?.data);
//             toast.error("Failed to place order with pending payment status.");
//             navigate("/payment-failed", { 
//               state: { 
//                 orderId: createdOrderId,
//                 error: "Failed to place order"
//               } 
//             });
//           }
//         },
//       },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   } catch (err) {
//     console.error("Order creation failed:", err);
//     alert("Unable to start payment");
//   }
// };



 

//   // const handlePayment = async () => {
//   //   const res = await loadRazorpayScript();
//   //   if (!res) {
//   //     alert("Razorpay SDK failed to load.");
//   //     return;
//   //   }
  
//   //   try {
//   //     const response = await api.post("create_order/", {
//   //       totalAmount: discount
//   //         ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//   //         : totalAmount + delivery_fee,
//   //     });
  
//   //     const data = response.data;
//   //     const createdOrderId = data.order_id; // Store it here
  
//   //     const options = {
//   //       key: data.razorpay_key,
//   //       amount: data.amount,
//   //       currency: "INR",
//   //       name: "My Shop",
//   //       description: "Purchase Payment",
//   //       order_id: createdOrderId,
//   //       handler: async function (response) {
//   //         try {
//   //           const verifyRes = await api.post("/verify_payment/", {
//   //             order_id: response.razorpay_order_id,
//   //             payment_id: response.razorpay_payment_id,
//   //             signature: response.razorpay_signature,
//   //           });
  
//   //           // place order
//   //           const res = await api.post(`/place_order/`, {
//   //             address_id: shipAddress,
//   //             total: discount
//   //               ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
//   //               : totalAmount + delivery_fee,
//   //             payment_method: method,
//   //             payment_status: method === 'COD' ? 'PENDING' : 'CONFIRMED',
//   //             couponCode:couponCode,
//   //           });
  
//   //           showSuccessAlert(
//   //             "Order Placed",
//   //             "Your order has been successfully placed!"
//   //           );
//   //           navigate("/order-success", { state: { orderId: res.data.order_id } });
//   //         } catch (error) {
//   //           console.log(error.response?.data);
//   //           toast.error(error?.response?.data?.error);
//   //         }
//   //       },
//   //       prefill: {
//   //         name: customer.first_name || "Customer Name",
//   //         email: customer.email || "customer@example.com",
//   //         contact: customer.phone_number || "9999999999",
//   //       },
//   //       theme: {
//   //         color: "#0d6efd",
//   //       },
//   //       modal: {
//   //         ondismiss: function () {
            
//   //           navigate("/payment-failed", { state: { orderId: createdOrderId } });
//   //         },
//   //       },
//   //     };
  
//   //     const rzp = new window.Razorpay(options);
//   //     rzp.open();
//   //   } catch (err) {
//   //     console.error("Order creation failed:", err);
//   //     alert("Unable to start payment");
//   //   }
//   // };

//   // const handlePayment = async () => {
//   //   const res = await loadRazorpayScript();
//   //   if (!res) {
//   //     alert("Razorpay SDK failed to load.");
//   //     return;
//   //   }

//   //   try {
//   //     const response = await api.post("create_order/", {
//   //       totalAmount: discount ? (totalAmount+delivery_fee) - (totalAmount * (discount / 100)) : totalAmount
//   //     });
//   //     const data = response.data;
//   //     console.log(response);

//   //     const options = {
//   //       key: data.razorpay_key,
//   //       amount: data.amount,
//   //       currency: "INR",
//   //       name: "My Shop",
//   //       description: "Purchase Payment",
//   //       order_id: data.order_id,
//   //       handler: async function (response) {
//   //         try {
//   //           const verifyRes = await api.post("/verify_payment/", {
//   //             order_id: response.razorpay_order_id,
//   //             payment_id: response.razorpay_payment_id,
//   //             signature: response.razorpay_signature,
//   //           });
//   //           alert(verifyRes.data.status);
//   //           // place order
//   //           try {
//   //             const res = await api.post(`/place_order/`, {
//   //               address_id: shipAddress,
//   //               total: discount
//   //                 ? (totalAmount+delivery_fee) - (totalAmount * (discount / 100))
//   //                 : totalAmount+delivery_fee,
//   //                 payment_method : method,
//   //                 payment_status : method === 'COD'?'PENDING':'CONFIRMED'
//   //             });
//   //             setOrderId(res.data.res.data.order_id)
//   //             console.log(res.data);
//   //             showSuccessAlert(
//   //               "Order Placed",
//   //               "Your order has been successfully placed!"
//   //             );
//   //             navigate("/order-success", { state: { orderId: res.data.order_id } });
//   //           } catch (error) {
//   //             console.log(error.response.data);
//   //             toast.error(error?.response?.data?.error)
//   //           }
//   //         } catch (err) {
//   //           console.error("Payment verification failed", err);
//   //           alert("Payment verification failed");
//   //         }
//   //       },
//   //       prefill: {
//   //         name: customer.first_name || "Customer Name",
//   //         email: customer.email || "customer@example.com",
//   //         contact: customer.phone_number || "9999999999",
//   //       },
//   //       theme: {
//   //         color: "#0d6efd",
//   //       },
//   //       modal: {
//   //         ondismiss: function () {
//   //           // User closed the Razorpay popup
            
//   //           navigate("/payment-failed",{ state: { orderId: orderId} });// order id used here
//   //         }
//   //       }
//   //     };

//   //     const rzp = new window.Razorpay(options);
//   //     rzp.open();
//   //   } catch (err) {
//   //     console.error("Order creation failed:", err);
//   //     alert("Unable to start payment");
//   //   }
//   // };

//   useEffect(() => {
//     const getAddresses = async () => {
//       try {
//         const res = await api.get("/get_all_addresses/");
//         setAddresses(res.data.addresses_data);
//         setCustomer(res.data.customer);
//         setShipAddress(res.data.primary_address_id);
//       } catch (error) {
//         console.log(error.message);
//       }
//     };
//     getAddresses();
//   }, []);

//   return (
//     <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
//       {/* ---------------- Left Side ------------- */}
//       <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
//         <div className="text-xl sm:text-2xl my-3">
//           <Title text1={"Choose"} text2={"Address"} />
//         </div>
//         <div className="flex justify-end mb-4">
//           <Button
//             variant="default"
//             onClick={() => navigate("/profile/add-address")}
//             className="bg-black text-white rounded-md hover:bg-black/90 w-52" // Set width here
//           >
//             <PlusCircle className="h-5 w-5 mr-2" />
//             ADD NEW ADDRESS
//           </Button>
//         </div>
//         <div className="flex flex-col gap-4">
//           {addresses.map((address) => (
//             <div
//               key={address.id}
//               className="flex justify-between items-center border p-4 rounded-md"
//             >
//               <div>
//                 <h2 className="text-lg font-semibold">{address.name}</h2>
//                 <p>{address.address}</p>
//                 <p>
//                   {address.city}, {address.state} - {address.zipcode}
//                 </p>
//               </div>
//               <div className="flex gap-4"></div>
//               <p
//                 onClick={() => {
//                   setShipAddress(address.id);
//                 }}
//                 className={`min-w-3.5 h-3.5 border rounded-full cursor-pointer ${
//                   shipAddress === address.id ? "bg-black" : ""
//                 }`}
//               ></p>
//             </div>
//           ))}
//         </div>
//         {/* <div className="flex gap-3">
//           <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='First Name' />
//           <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Last Name' />
//         </div>
//         <input type="email" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Email Address'/>
//         <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder="Street"/>
//         <div className="flex gap-3">
//           <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='City' />
//           <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='States' />
//         </div>
//         <div className="flex gap-3">
//           <input type="number" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Zipcode' />
//           <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Country' />
//         </div>
//         <input type="number" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Phone' /> */}
//       </div>

//       {/* ---------------- Right Side -------------- */}
//       <div className="mt-8">
//         <div className="mt-8 min-w-80 ">
//           <CartTotal totalAmount={totalAmount} discount={discount} />
//         </div>
//         {/* coupon */}
//         <div className="flex gap-4 items-center">
//           <Coupon
//             cartTotal={totalAmount}
//             discount={discount}
//             setDiscount={setDiscount}
//             couponCode = {couponCode}
//             setCouponCode = {setCouponCode}
//           />
//           <Button
//             variant="outline"
//             className="border border-black text-black hover:bg-gray-100"
//             onClick={() => setShowCoupons(!showCoupons)}
//           >
//             {showCoupons ? "Hide Coupons" : "Show Coupons"}
//           </Button>
//         </div>
//         {discount && (
//           <p className="text-green-600 mt-2">
//             Coupon applied! You get {discount}% off.
//           </p>
//         )}

//         {showCoupons && <ShowALLValidCoupons />}

//         <div className="mt-12">
//           <Title text1={"PAYMENT"} text2={"METHOD"} />

//           {/* ------ Payment Method Selection ------ */}
//           <div className="flex gap-3 flex-col lg:flex-row">
//             <div
//               onClick={() => {
//                 setMethod("WALLET");
//                 setStatus('CONFIRMED')
//               }}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "WALLET" ? "bg-black" : ""
//                 }`}
//               ></p>
//               <p className="text-gray-500 text-sm font-medium mx-4">
//                 WALLET
//               </p>
//             </div>
//             <div
//               onClick={() => {
//                 setMethod("RAZORPAY");
//                 setStatus('CONFIRMED')
//               }}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "RAZORPAY" ? "bg-black" : ""
//                 }`}
//               ></p>
//               <img className="h-5 mx-4 " src={assets.razorpay_logo} alt="" />
//             </div>
//             <div
//               onClick={() => {
//                 setMethod("COD");
//                 setStatus('PENDING')
//               }}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "COD" ? "bg-black" : ""
//                 }`}
//               ></p>
//               <p className="text-gray-500 text-sm font-medium mx-4">
//                 CASH ON DELIVERY
//               </p>
//             </div>
//           </div>
//           {/* <div>{method === 'razorpay'?<RazorpayCheckout amount = {totalAmount} name = {customer.first_name} email = {customer.email} phone = {customer.phone_number} />:null}</div> */}
//           <div className="w-full text-end mt-8">
//             <button
//               onClick={
//                 method === "COD" || method === 'WALLET'
//                   ? handlePlaceOrder
//                   : method === "RAZORPAY"
//                   ? handlePayment
//                   : () => {}
//               }
//               className="bg-black text-white text-sm my-8 px-16 py-3"
//             >
//               PLACE ORDER
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlaceOrder;
