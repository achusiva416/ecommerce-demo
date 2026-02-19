import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { Star, MessageSquare, Package, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserReviews = ({ userId, reviewsData }) => {
  const [page, setPage] = useState(1);

  // Use passed reviews or fallback to empty array
  const reviews = reviewsData || [];

  const isLoading = false;

  const renderStars = (rating) => {
    return (
      <div className="d-flex text-warning">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={14} fill={s <= rating ? "currentColor" : "none"} />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-0">
        <div className="px-4 py-3 border-bottom">
          <h5 className="fw-bold text-primary mb-0">Product Reviews & Ratings</h5>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-5 p-4 text-muted">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-25" />
            <p className="mb-0">This user hasn't reviewed any products yet.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="row g-4">
              {reviews.map((review) => (
                <div className="col-md-6" key={review.id}>
                  <div className="card border bg-white h-100 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <Package size={20} className="text-primary" />
                        <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                          {review.product?.name || 'Product ID: #' + review.product_id}
                        </span>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        {renderStars(review.rating)}
                        <small className="text-muted mt-1">{formatDate(review.created_at)}</small>
                      </div>
                    </div>
                    
                    <p className="text-muted small mb-0 mt-2 bg-white p-2 rounded border-start border-primary border-1 italic">
                      "{review.review || review.details || 'No written review'}"
                    </p>

                    <div className="mt-3 pt-2 d-flex justify-content-between align-items-center border-top">
                      <Link to={`/products/${review.product_id}`} className="text-primary d-flex align-items-center gap-1 cursor-pointer">
                        View Product <ExternalLink size={12} />
                      </Link>
                      <span className={`badge bg-${review.approved ? 'success' : 'warning'} bg-opacity-10 text-${review.approved ? 'success' : 'warning'}`}>
                        {review.approved ? 'Published' : 'Under Moderation'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews;
