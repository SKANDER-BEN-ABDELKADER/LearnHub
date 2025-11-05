import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Menu, X, Waypoints, Search, User, Book, LogOut, LayoutDashboard, Clock, BookOpen, Users, MessageCircle, Info, GraduationCap } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import api from "../services/api";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [instructorForm, setInstructorForm] = useState({ domaine: "", experience_lvl: "" });
  const [dashboardView, setDashboardView] = useState("student"); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tokenExpirationWarning, setTokenExpirationWarning] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, token, updateUser } = useAuth(); 

  // Check token expiration and show warning
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;
        
        // Show warning if token expires in less than 5 minutes
        if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
          setTokenExpirationWarning(true);
        } else {
          setTokenExpirationWarning(false);
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Show instructor form modal
  const handleBecomeInstructor = () => {
    setShowInstructorForm(true);
  };

  // Handle instructor form input
  const handleInstructorFormChange = (e) => {
    const { name, value } = e.target;
    setInstructorForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit instructor form
  const handleInstructorFormSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return alert("User ID not found");
    try {
      const res = await api.patch(`/user/${user.id}`, {
        role: "INSTRUCTOR",
        actual_role: "INSTRUCTOR",
        domain: instructorForm.domaine,
        experienceLvl: instructorForm.experience_lvl,
      });
      const updatedUser = res.data;
      updateUser(updatedUser);
      setShowInstructorForm(false);
      setDashboardView("instructor");
      navigate("/instructor-dashboard");
    } catch (err) {
      alert(err.message || "Error updating role");
    }
  };

  // Toggle dashboard view for instructors
  const handleDashboardToggle = (view) => {
    setDashboardView(view);
    if (view === "instructor") {
      navigate("/instructor-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleRoleToggle = async () => {
  // Early return if user can't toggle role
  if (user?.role !== "INSTRUCTOR" || !user?.id) {
    console.warn("User is not authorized to toggle roles");
    return;
  }

  // Determine new role
  const newActualRole = user.actual_role === "INSTRUCTOR" ? "STUDENT" : "INSTRUCTOR";
  
  try {
    const response = await api.patch(`/user/${user.id}/toggle-role`);
    const updatedUser = response.data;
    
    // Update state and storage using the updateUser function from context
    updateUser(updatedUser);
    
    // Navigate to the appropriate dashboard view
    if (user.actual_role === "INSTRUCTOR") {
      navigate("/dashboard");
    } else {
      navigate("/instructor-dashboard");
    }
  } catch (err) {
    console.error("Role toggle error:", err);
    // Use a more user-friendly notification system
    alert(err.response?.data?.message || err.message || "An error occurred while changing roles");
  }
  // window.location.reload(); // Refresh UI state 
};

  // Helper function to check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Navigation links data
  const studentNavLinks = [
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/categories", label: "Categories", icon: Book },
    { to: "/instructors", label: "Instructors", icon: Users },
    { to: "/chatbot", label: "Chatbot", icon: MessageCircle },
    { to: "/about", label: "About", icon: Info },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              LearnHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user?.actual_role === "STUDENT" ? (
            <div className="hidden md:flex items-center space-x-1">
              {studentNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.to);
                return (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "text-blue-600 bg-blue-50 font-medium" 
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : user?.actual_role === "INSTRUCTOR" ? (
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to="/instructor-dashboard" 
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink("/instructor-dashboard")
                    ? "text-blue-600 bg-blue-50 font-medium" 
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link 
                to="/instructor/profile" 
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink("/instructor/profile")
                    ? "text-blue-600 bg-blue-50 font-medium" 
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Profile</span>
              </Link>
            </div>
          ) : null}

          {/* Search Bar - Desktop - Only show for students or non-authenticated users */}
          {user?.actual_role !== "INSTRUCTOR" && (
            <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-80 hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search courses..."
                className="bg-transparent outline-none w-full text-sm placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Token Expiration Warning */}
            {tokenExpirationWarning && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Session expires soon</span>
              </div>
            )}

            {/* Auth/Profile Buttons */}
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-gray-100">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Single Role Button */}
                {user.role === "STUDENT" && user.actual_role === "STUDENT" ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBecomeInstructor}
                    className="hidden md:flex items-center gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Become Instructor</span>
                  </Button>
                ) : user.role === "INSTRUCTOR" ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRoleToggle}
                    className="hidden md:flex items-center gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  >
                    {user.actual_role === "INSTRUCTOR" ? (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Switch to Student</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        <span>Switch to Instructor</span>
                      </>
                    )}
                  </Button>
                ) : null}
                
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 hover:bg-gray-100 rounded-xl"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
                      {user?.firstName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline font-medium text-gray-700">
                      {user?.firstName || user?.name || "Profile"}
                    </span>
                  </Button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <p className="font-medium text-gray-900 text-sm">
                          {user?.firstName || user?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link 
                          to={user?.actual_role === "STUDENT" ? "/dashboard" : "/instructor-dashboard"}
                          className="flex items-center px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-3" /> 
                          <span className="text-sm">Dashboard</span>
                        </Link>
                        <Link 
                          to="/instructor/profile"
                          className="flex items-center px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" /> 
                          <span className="text-sm">Profile</span>
                        </Link>
                      </div>
                      
                      {/* Logout */}
                      <div className="border-t border-gray-100">
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center w-full px-4 py-2.5 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 mr-3" /> 
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            

            {/* Become Instructor Modal */}
            {showInstructorForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative animate-in zoom-in-95 duration-200">
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
                    onClick={() => setShowInstructorForm(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Become an Instructor</h2>
                      <p className="text-sm text-gray-500">Share your knowledge with students</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleInstructorFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domain of Expertise
                      </label>
                      <input
                        name="domaine"
                        value={instructorForm.domaine}
                        onChange={handleInstructorFormChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        required
                        placeholder="e.g. Web Development, Data Science"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        name="experience_lvl"
                        value={instructorForm.experience_lvl}
                        onChange={handleInstructorFormChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        required
                      >
                        <option value="">Select your level</option>
                        <option value="BEGINNER">Beginner (0-2 years)</option>
                        <option value="INTERMEDIATE">Intermediate (2-5 years)</option>
                        <option value="ADVANCED">Advanced (5+ years)</option>
                      </select>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 py-2.5"
                    >
                      Submit Application
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-200">
            <div className="flex flex-col py-4 space-y-1">
              {/* Mobile Search - Only show for students or non-authenticated users */}
              {user?.actual_role !== "INSTRUCTOR" && (
                <div className="px-4 mb-2">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="bg-transparent outline-none w-full text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Token Warning - Mobile */}
              {tokenExpirationWarning && (
                <div className="mx-4 mb-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Session expires soon</span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {user?.actual_role === "STUDENT" ? (
                studentNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.to);
                  return (
                    <Link 
                      key={link.to}
                      to={link.to} 
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isActive 
                          ? "text-blue-600 bg-blue-50 font-medium border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })
              ) : user?.actual_role === "INSTRUCTOR" ? (
                <>
                  <Link 
                    to="/instructor-dashboard" 
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActiveLink("/instructor-dashboard")
                        ? "text-blue-600 bg-blue-50 font-medium border-l-4 border-blue-600" 
                        : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/instructor/profile" 
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActiveLink("/instructor/profile")
                        ? "text-blue-600 bg-blue-50 font-medium border-l-4 border-blue-600" 
                        : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                </>
              ) : null}


              {/* Mobile Auth/Profile */}
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-100 mt-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center border-gray-300 hover:bg-gray-50">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* User Info */}
                  <div className="px-4 pt-3 pb-2 border-t border-gray-100 mt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                        {user?.firstName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {user?.firstName || user?.name || "Profile"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    
                    {/* Role Toggle Button - Mobile */}
                    {user?.role === "STUDENT" && user?.actual_role === "STUDENT" ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          handleBecomeInstructor();
                          setIsMenuOpen(false);
                        }}
                        className="w-full justify-center border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Become Instructor
                      </Button>
                    ) : user?.role === "INSTRUCTOR" ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          handleRoleToggle();
                          setIsMenuOpen(false);
                        }}
                        className="w-full justify-center border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        {user?.actual_role === "INSTRUCTOR" ? (
                          <>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Switch to Student
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Switch to Instructor
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>
                  
                  {/* Logout Button */}
                  <div className="px-4 pb-2">
                    <Button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full justify-center border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> 
                      Logout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
