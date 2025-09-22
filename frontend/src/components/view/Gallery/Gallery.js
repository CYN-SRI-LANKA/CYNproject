import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import Header from '../Headers/Header';
import Footer from '../Footer';
import './Gallery.css'; // We'll create this for additional styling

const Gallery = () => {
    // State management
    const [galleryItems, setGalleryItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [loadingMore, setLoadingMore] = useState(false);

    const API_BASE_URL = 'http://localhost/CYNproject/backend/api';

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
        fetchGalleryItems();
    }, []);

    // Fetch new items when category changes
    useEffect(() => {
        if (selectedCategory !== 'all') {
            fetchGalleryItems(0, true);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gallery/categories.php`);
            if (response.data.success) {
                setCategories([
                    { category: 'all', count: 0 },
                    ...response.data.data
                ]);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchGalleryItems = async (offset = 0, reset = false) => {
        try {
            if (offset === 0) setLoading(true);
            else setLoadingMore(true);

            const params = {
                limit: 12,
                offset: offset
            };

            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            const response = await axios.get(`${API_BASE_URL}/gallery/index.php`, { params });

            if (response.data.success) {
                if (reset || offset === 0) {
                    setGalleryItems(response.data.data);
                } else {
                    setGalleryItems(prev => [...prev, ...response.data.data]);
                }
                setPagination(response.data.pagination);
                setError(null);
            }
        } catch (err) {
            setError('Failed to fetch gallery items. Please try again later.');
            console.error('Error fetching gallery:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setGalleryItems([]);
    };

    const loadMore = () => {
        if (pagination.has_more) {
            fetchGalleryItems(pagination.offset + pagination.limit);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const generateSlug = (title) => {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Loading component
    const LoadingSpinner = () => (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    // Error component
    const ErrorMessage = ({ message }) => (
        <div className="alert alert-danger text-center mx-auto" style={{ maxWidth: '600px' }}>
            <h5>Oops! Something went wrong</h5>
            <p>{message}</p>
            <button className="btn btn-outline-danger" onClick={() => fetchGalleryItems()}>
                Try Again
            </button>
        </div>
    );

    // Gallery card component
    const GalleryCard = ({ item }) => (
        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div 
                className="card gallery-card h-100"
                style={{
                    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease-in-out"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
                <div className="position-relative">
                    <img 
                        src={item.thumbnail_url || item.image_url} 
                        className="card-img-top" 
                        alt={item.title}
                        style={{ 
                            height: '200px', 
                            objectFit: 'cover',
                            width: '100%'
                        }}
                        loading="lazy"
                    />
                    {item.category && (
                        <span 
                            className="badge bg-primary position-absolute top-0 start-0 m-2"
                            style={{ fontSize: '0.75rem' }}
                        >
                            {item.category}
                        </span>
                    )}
                </div>
                
                <div className="card-body d-flex flex-column">
                    <h6 
                        className="card-title" 
                        style={{ 
                            fontWeight: "bold", 
                            textAlign: "left",
                            marginBottom: "15px",
                            lineHeight: "1.4"
                        }}
                    >
                        {item.title}
                    </h6>
                    
                    {item.description && (
                        <p 
                            className="card-text text-muted small"
                            style={{ 
                                flexGrow: 1,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {item.description}
                        </p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                        <div className="mb-3">
                            {item.tags.slice(0, 3).map((tag, index) => (
                                <span 
                                    key={index}
                                    className="badge bg-light text-dark me-1 mb-1"
                                    style={{ fontSize: '0.7rem' }}
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                        <Link 
                            to={`/gallery/${generateSlug(item.title)}`}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.875rem' }}
                        >
                            See More
                        </Link>
                        <small className="text-muted">
                            {formatDate(item.created_at)}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <Header />
            
            <div className="container">
                {/* Page Header */}
                <div className="row">
                    <div className="col-12">
                        <h3 
                            className="text-uppercase text-center" 
                            style={{ 
                                margin: "130px 0px 60px 0px", 
                                fontWeight: "800",
                                color: "#2c3e50"
                            }}
                        >
                            Gallery
                        </h3>
                    </div>
                </div>

                {/* Category Filter */}
                {categories.length > 1 && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.category}
                                        className={`btn ${selectedCategory === cat.category 
                                            ? 'btn-primary' 
                                            : 'btn-outline-primary'
                                        } btn-sm`}
                                        onClick={() => handleCategoryChange(cat.category)}
                                        style={{ 
                                            borderRadius: '20px',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {cat.category === 'all' ? 'All Events' : cat.category}
                                        {cat.count > 0 && ` (${cat.count})`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Gallery Content */}
                {loading && galleryItems.length === 0 ? (
                    <LoadingSpinner />
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : galleryItems.length === 0 ? (
                    <div className="row">
                        <div className="col-12 text-center">
                            <div className="alert alert-info">
                                <h5>No Events Found</h5>
                                <p>No events are available in this category at the moment.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Gallery Grid */}
                        <div className="row">
                            {galleryItems.map((item, index) => (
                                <GalleryCard key={`${item.id}-${index}`} item={item} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {pagination.has_more && (
                            <div className="row">
                                <div className="col-12 text-center mb-5">
                                    <button 
                                        className="btn btn-outline-primary btn-lg"
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        style={{ 
                                            borderRadius: '25px',
                                            padding: '12px 30px'
                                        }}
                                    >
                                        {loadingMore ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More Events'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Gallery Stats */}
                        <div className="row">
                            <div className="col-12 text-center mb-4">
                                <small className="text-muted">
                                    Showing {galleryItems.length} of {pagination.total} events
                                    {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
                                </small>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Gallery;
