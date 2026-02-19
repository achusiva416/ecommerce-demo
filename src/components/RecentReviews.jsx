import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { Star, MessageSquare, Package, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { IMAGE_PATH } from '../utils/constants';

const RecentReviews = ({ limit = 5, reviewsData = null }) => {
  // Use passed reviews or fetch them internally
  const { data: internalReviews = [], isLoading } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: async () => {
      const response = await apiClient.get('/reviews', {
        params: { per_page: limit, sort_by: 'created_at', sort_order: 'desc' }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !reviewsData,
  });

  const reviews = reviewsData || internalReviews || [];

  const renderStars = (rating) => {
    const r = parseInt(rating) || 0;
    return (
      <div className="d-flex text-warning gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={10} 
            fill={s <= r ? "currentColor" : "none"} 
            strokeWidth={s <= r ? 0 : 2} 
          />
        ))}
      </div>
    );
  };

  if (isLoading && !reviewsData) {
    return (
      <div 
        className="card border-0 shadow-sm"
        style={{ height: '500px' }}
      >
        <div className="card-body p-4 text-center">
          <div className="spinner-border text-primary spinner-border-sm" role="status">
            <span className="visually-hidden">Loading reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card border-0 shadow-sm"
      style={{ height: '500px' }}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="card-title m-0 text-primary fw-bold">Recent Reviews</h5>
            <small className="text-muted">Latest customer feedback</small>
          </div>
          <MessageSquare size={20} className="text-primary opacity-50" />
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-5">
            <MessageSquare size={40} className="text-muted mb-3 opacity-20" />
            <p className="text-muted small">No recent reviews found</p>
          </div>
        ) : (
          <div 
            className="vstack gap-3 pe-2"
            style={{
              maxHeight: '380px',
              overflowY: 'auto'
            }}
          >
            {reviews.slice(0, limit).map((review) => (
              <div key={review.id} className="p-3 rounded-4 bg-light bg-opacity-50 border border-white hover-shadow-sm transition-all">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Link 
                    to={`/users/${review.user?.id || review.user_id}`} 
                    className="d-flex align-items-center gap-2 text-decoration-none cursor-pointer"
                  >
                    <div 
                      className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                      style={{ width: 32, height: 32, fontSize: 11 }}
                    >
                      {(review.user?.name || review.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold text-dark small lh-1 mb-1">{review.user?.name || review.name || 'Anonymous User'}</div>
                      {renderStars(review.rating)}
                    </div>
                  </Link>
                  <small className="text-muted fw-medium" style={{ fontSize: '10px' }}>
                    {review.created_at ? new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today'}
                  </small>
                </div>
                
                <p className="text-muted small mb-2 line-clamp-2 px-1">
                  "{review.details || review.review || review.comment || 'No written review'}"
                </p>

                {/* Optional Review Image */}
                {review.image && review.image.length > 0 && (
                  <div className="mb-2 px-1">
                    <img 
                      src={IMAGE_PATH + review.image[0].image_path} 
                      alt="Review" 
                      className="rounded-3 border border-white shadow-sm"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-white">
                  <div className="d-flex align-items-center gap-1 overflow-hidden">
                    <Package size={12} className="text-primary flex-shrink-0" />
                    <small className="text-primary text-truncate fw-semibold" style={{ fontSize: '11px' }}>
                      {review.product?.name || review.product_name || 'Product Feedback'}
                    </small>
                  </div>
                  <Link to={`/products/${review.product_id || ''}`} className="text-muted hover-primary transition-all">
                    <Star size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {reviews.length > limit && (
          <div className="mt-4 text-center">
            <Link to="/reviews" className="btn btn-sm btn-outline-primary rounded-pill px-4" style={{ fontSize: '10px' }}>
              View All Reviews
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentReviews;
