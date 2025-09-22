import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import './header.css';
import logo from '../../image/cyn.png';
import axios from "axios";
import swal from "sweetalert";

const Header = () => {
    const navigate = useNavigate();
    
    // Authentication state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    
    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    
    // Registration form state
    const [registerForm, setRegisterForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        organization: '',
        country: '',
        registration_type: 'individual',
        interests: [],
        how_heard: '',
        password: '',
        confirm_password: ''
    });
    
    // Loading and error states
    const [loading, setLoading] = useState({
        login: false,
        register: false
    });
    
    const [errors, setErrors] = useState({});
    
    const API_BASE_URL = 'http://localhost/CYNproject/backend/api';
    
    // Check if user is logged in on component mount
    useEffect(() => {
        const savedUser = localStorage.getItem('cynUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
    }, []);

    // Form validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateLoginForm = () => {
        const newErrors = {};
        
        if (!loginForm.email) {
            newErrors.loginEmail = 'Email is required';
        } else if (!validateEmail(loginForm.email)) {
            newErrors.loginEmail = 'Please enter a valid email';
        }
        
        if (!loginForm.password) {
            newErrors.loginPassword = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegisterForm = () => {
        const newErrors = {};
        
        if (!registerForm.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }
        
        if (!registerForm.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(registerForm.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!registerForm.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        
        if (!registerForm.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required';
        }
        
        if (!registerForm.gender) {
            newErrors.gender = 'Please select gender';
        }
        
        if (!registerForm.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(registerForm.password)) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (!registerForm.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
        } else if (registerForm.password !== registerForm.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input changes
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear specific error when user starts typing
        if (errors[`login${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
            setErrors(prev => ({
                ...prev,
                [`login${name.charAt(0).toUpperCase() + name.slice(1)}`]: ''
            }));
        }
    };

    const handleRegisterChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            const interest = value;
            setRegisterForm(prev => ({
                ...prev,
                interests: checked 
                    ? [...prev.interests, interest]
                    : prev.interests.filter(item => item !== interest)
            }));
        } else {
            setRegisterForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Login function
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateLoginForm()) {
            return;
        }
        
        setLoading(prev => ({ ...prev, login: true }));
        
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login.php`, loginForm);
            
            if (response.data.success) {
                const userData = response.data.user;
                
                // Save user data
                localStorage.setItem('cynUser', JSON.stringify(userData));
                localStorage.setItem('cynToken', response.data.token);
                
                setUser(userData);
                setIsLoggedIn(true);
                
                // Clear form
                setLoginForm({ email: '', password: '' });
                
                swal({
                    title: "Success!",
                    text: "Login successful!",
                    icon: 'success',
                    timer: 2000,
                    button: false,
                });
                
                // Close modal
                const modal = document.getElementById('signInModal');
                const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) bootstrapModal.hide();
                
            } else {
                swal({
                    title: "Login Failed",
                    text: response.data.message || "Invalid credentials",
                    icon: 'error',
                    button: "Try Again"
                });
            }
        } catch (error) {
            swal({
                title: "Error",
                text: error.response?.data?.message || "Login failed. Please try again.",
                icon: 'error',
                button: "Try Again"
            });
        } finally {
            setLoading(prev => ({ ...prev, login: false }));
        }
    };

    // Register function
    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateRegisterForm()) {
            return;
        }
        
        setLoading(prev => ({ ...prev, register: true }));
        
        try {
            const registerData = {
                ...registerForm,
                interests: registerForm.interests.join(',')
            };
            delete registerData.confirm_password;
            
            const response = await axios.post(`${API_BASE_URL}/users/register.php`, registerData);
            
            if (response.data.success) {
                // Clear form
                setRegisterForm({
                    full_name: '',
                    email: '',
                    phone: '',
                    date_of_birth: '',
                    gender: '',
                    address: '',
                    organization: '',
                    country: '',
                    registration_type: 'individual',
                    interests: [],
                    how_heard: '',
                    password: '',
                    confirm_password: ''
                });
                
                swal({
                    title: "Success!",
                    text: "Registration successful! Please check your email for verification.",
                    icon: 'success',
                    button: "Continue"
                });
                
                // Close modal
                const modal = document.getElementById('signUpModal');
                const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) bootstrapModal.hide();
                
            } else {
                swal({
                    title: "Registration Failed",
                    text: response.data.message || "Registration failed",
                    icon: 'error',
                    button: "Try Again"
                });
            }
        } catch (error) {
            swal({
                title: "Error",
                text: error.response?.data?.message || "Registration failed. Please try again.",
                icon: 'error',
                button: "Try Again"
            });
        } finally {
            setLoading(prev => ({ ...prev, register: false }));
        }
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('cynUser');
        localStorage.removeItem('cynToken');
        setUser(null);
        setIsLoggedIn(false);
        
        swal({
            title: "Logged Out",
            text: "You have been successfully logged out.",
            icon: 'success',
            timer: 2000,
            button: false,
        });
        
        navigate('/');
    };

    // Interest options for CYN project
    const interestOptions = [
        'Youth Development',
        'Education & Training',
        'Leadership Programs',
        'Community Service',
        'Cultural Exchange',
        'Professional Development',
        'Environmental Issues',
        'Social Entrepreneurship'
    ];

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary navbar" style={{ position: "fixed", width: "100%" }}>
                <div className="container-fluid">
                    <Link to="/" className="navbar-brand">
                        <img 
                            style={{ margin: "0px", width: "100px", height: "100px", objectFit: "cover" }} 
                            className="logoimg" 
                            src={logo} 
                            alt="CYN Logo"
                        />
                    </Link>
                           
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav nav-underline me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/program">Programs</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/partner">Partners</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/gallery">Gallery</NavLink>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#contactus">Contact Us</a>
                            </li>
                        </ul>

                        <div className="rightside">
                            {isLoggedIn ? (
                                <div className="d-flex align-items-center">
                                    <span className="me-3 text-muted">Welcome, {user?.full_name || user?.name}</span>
                                    <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <button 
                                            className="btn btn-primary me-2" 
                                            data-bs-toggle="modal"
                                            data-bs-target="#signInModal"
                                        >
                                            Sign In
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button 
                                            className="btn btn-outline-primary" 
                                            data-bs-toggle="modal"
                                            data-bs-target="#signUpModal"
                                        >
                                            Sign Up
                                        </button>
                                    </li>
                                </>
                            )}
                        </div>                 
                    </div>
                </div>
            </nav>

            {/* Sign In Modal */}
            <div className="modal fade" id="signInModal" tabIndex="-1" aria-labelledby="signInModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="signInModalLabel">Sign In to CYN</h5>   
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleLogin}>
                            <div className="modal-body">
                                <div className="form-floating mb-3">
                                    <input 
                                        type="email" 
                                        className={`form-control ${errors.loginEmail ? 'is-invalid' : ''}`}
                                        id="loginEmail" 
                                        name="email"
                                        value={loginForm.email} 
                                        onChange={handleLoginChange} 
                                        placeholder="name@example.com"
                                        required
                                    />
                                    <label htmlFor="loginEmail">Email address</label>
                                    {errors.loginEmail && <div className="invalid-feedback">{errors.loginEmail}</div>}
                                </div>
                                
                                <div className="form-floating mb-3">
                                    <input 
                                        type="password" 
                                        className={`form-control ${errors.loginPassword ? 'is-invalid' : ''}`}
                                        id="loginPassword"
                                        name="password"
                                        value={loginForm.password} 
                                        onChange={handleLoginChange} 
                                        placeholder="Password"
                                        required
                                    />
                                    <label htmlFor="loginPassword">Password</label>
                                    {errors.loginPassword && <div className="invalid-feedback">{errors.loginPassword}</div>}
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loading.login}
                                >
                                    {loading.login ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Sign Up Modal */}
            <div className="modal fade" id="signUpModal" tabIndex="-1" aria-labelledby="signUpModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="signUpModalLabel">Join Commonwealth Youth Network</h5>   
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        
                        <form onSubmit={handleRegister}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="text" 
                                                className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                                                id="fullName" 
                                                name="full_name"
                                                value={registerForm.full_name}
                                                onChange={handleRegisterChange} 
                                                placeholder="Full Name"
                                                required
                                            />
                                            <label htmlFor="fullName">Full Name *</label>
                                            {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                id="email" 
                                                name="email"
                                                value={registerForm.email}
                                                onChange={handleRegisterChange} 
                                                placeholder="name@example.com"
                                                required
                                            />
                                            <label htmlFor="email">Email Address *</label>
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="tel" 
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                id="phone" 
                                                name="phone"
                                                value={registerForm.phone}
                                                onChange={handleRegisterChange} 
                                                placeholder="Phone Number"
                                                required
                                            />
                                            <label htmlFor="phone">Phone Number *</label>
                                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="date" 
                                                className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                                                id="dateOfBirth" 
                                                name="date_of_birth"
                                                value={registerForm.date_of_birth}
                                                onChange={handleRegisterChange} 
                                                required
                                            />
                                            <label htmlFor="dateOfBirth">Date of Birth *</label>
                                            {errors.date_of_birth && <div className="invalid-feedback">{errors.date_of_birth}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <select 
                                            className={`form-select mb-3 ${errors.gender ? 'is-invalid' : ''}`}
                                            name="gender" 
                                            value={registerForm.gender}
                                            onChange={handleRegisterChange} 
                                            required
                                        >
                                            <option value="">Select Gender *</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                        {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="country" 
                                                name="country"
                                                value={registerForm.country}
                                                onChange={handleRegisterChange} 
                                                placeholder="Country"
                                            />
                                            <label htmlFor="country">Country</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-floating mb-3">
                                    <textarea 
                                        className="form-control" 
                                        id="address" 
                                        name="address"
                                        value={registerForm.address}
                                        onChange={handleRegisterChange} 
                                        placeholder="Address"
                                        style={{ height: '80px' }}
                                    />
                                    <label htmlFor="address">Address</label>
                                </div>

                                <div className="form-floating mb-3">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="organization" 
                                        name="organization"
                                        value={registerForm.organization}
                                        onChange={handleRegisterChange} 
                                        placeholder="Organization/Institution"
                                    />
                                    <label htmlFor="organization">Organization/Institution</label>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Areas of Interest:</label>
                                    <div className="row">
                                        {interestOptions.map((interest, index) => (
                                            <div key={index} className="col-md-6">
                                                <div className="form-check">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        value={interest}
                                                        id={`interest${index}`}
                                                        checked={registerForm.interests.includes(interest)}
                                                        onChange={handleRegisterChange}
                                                    />
                                                    <label className="form-check-label" htmlFor={`interest${index}`}>
                                                        {interest}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="password" 
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="password" 
                                                name="password"
                                                value={registerForm.password}
                                                onChange={handleRegisterChange} 
                                                placeholder="Password"
                                                required
                                            />
                                            <label htmlFor="password">Password * (min 8 characters)</label>
                                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input 
                                                type="password" 
                                                className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                                                id="confirmPassword" 
                                                name="confirm_password"
                                                value={registerForm.confirm_password}
                                                onChange={handleRegisterChange} 
                                                placeholder="Confirm Password"
                                                required
                                            />
                                            <label htmlFor="confirmPassword">Confirm Password *</label>
                                            {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loading.register}
                                >
                                    {loading.register ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registering...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
