import api from "@/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductReview = ({productId}) => {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const getReviews = async () => {
        console.log(productId);
        
      try {
        const res = await api.get(`/reviews/${productId}/`);
        setReviews(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getReviews();
  }, [productId]);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
        <button className="bg-black hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200" onClick={()=>{navigate('/add-review-ratings',{state:{productId:productId}})}}>
          Write a Review
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div key={review.id} className="bg-gray-50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, j) => (
                  <svg
                    key={j}
                    className={`w-4 h-4 ${
                      j < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <span className="text-sm text-gray-500">{review.time_ago}</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{review.title}</h4>
              <p className="text-gray-600 mt-2">{review.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {review.user.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-900">{review.user}</span>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Verified Purchase
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReview;
