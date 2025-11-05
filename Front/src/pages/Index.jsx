import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Star, Play, Users, Clock, Award, CheckCircle, TrendingUp, Globe, Sparkles, BookOpen, GraduationCap, Code, Palette, Briefcase, Database, Quote } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";
import { getProfilePicUrl } from "../utils/imageUtils";


const features = [
  {
    icon: Star,
    title: 'Expert Instructors',
    description: 'Learn from industry leaders with real-world experience and proven track records.'
  },
  {
    icon: Play,
    title: 'Learn Anywhere',
    description: 'Study at your own pace with 24/7 access to high-quality video courses.'
  },
  {
    icon: Award,
    title: 'Earn Certificates',
    description: 'Get recognized credentials to boost your resume and LinkedIn profile.'
  },
  {
    icon: TrendingUp,
    title: 'Career Advancement',
    description: 'Master in-demand skills that employers are actively seeking.'
  }
];

const benefits = [
  {
    icon: Globe,
    title: 'Global Community',
    stat: '150+',
    label: 'Countries'
  },
  {
    icon: BookOpen,
    title: 'Vast Library',
    stat: '10K+',
    label: 'Video Lessons'
  },
  {
    icon: GraduationCap,
    title: 'Success Stories',
    stat: '45K+',
    label: 'Graduates'
  },
  {
    icon: Sparkles,
    title: 'New Content',
    stat: 'Weekly',
    label: 'Updates'
  }
];

// Helper function to get icon based on category keywords
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  // Development & Programming
  if (name.includes('web') || name.includes('frontend') || name.includes('backend') || name.includes('fullstack')) return Code;
  if (name.includes('mobile') || name.includes('app') || name.includes('android') || name.includes('ios')) return Code;
  if (name.includes('programming') || name.includes('code') || name.includes('software')) return Code;
  if (name.includes('development') || name.includes('dev')) return Code;
  
  // Data & Analytics
  if (name.includes('data') || name.includes('analytics') || name.includes('science')) return Database;
  if (name.includes('database') || name.includes('sql') || name.includes('nosql')) return Database;
  if (name.includes('ai') || name.includes('machine learning') || name.includes('ml')) return Database;
  
  // Design & Creative
  if (name.includes('design') || name.includes('ui') || name.includes('ux')) return Palette;
  if (name.includes('graphic') || name.includes('creative') || name.includes('art')) return Palette;
  if (name.includes('video') || name.includes('photo') || name.includes('visual')) return Palette;
  
  // Business & Marketing
  if (name.includes('business') || name.includes('management') || name.includes('entrepreneur')) return Briefcase;
  if (name.includes('marketing') || name.includes('sales') || name.includes('finance')) return Briefcase;
  if (name.includes('leadership') || name.includes('strategy')) return Briefcase;
  
  // Default
  return BookOpen;
};

// Helper function to generate consistent colors based on category name
const getCategoryColor = (categoryName) => {
  // Predefined color schemes
  const colorPalettes = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-indigo-500 to-blue-500',
    'from-cyan-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-violet-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-red-500 to-pink-500',
    'from-teal-500 to-green-500',
    'from-amber-500 to-yellow-500'
  ];
  
  // Generate a consistent hash from the category name
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color palette consistently
  const index = Math.abs(hash) % colorPalettes.length;
  return colorPalettes[index];
};

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Full Stack Developer',
    company: 'Tech Corp',
    image: '/placeholder.svg',
    rating: 5,
    text: 'LearnHub completely transformed my career. The courses are practical, engaging, and taught by real experts. I landed my dream job within 3 months!'
  },
  {
    name: 'Michael Chen',
    role: 'Data Scientist',
    company: 'DataTech Inc',
    image: '/placeholder.svg',
    rating: 5,
    text: 'The quality of instruction is outstanding. The projects are real-world applicable, and the community support is incredible. Best investment I\'ve made!'
  },
  {
    name: 'Emily Rodriguez',
    role: 'UI/UX Designer',
    company: 'Creative Studio',
    image: '/placeholder.svg',
    rating: 5,
    text: 'As someone who switched careers, LearnHub made the transition smooth. The step-by-step approach and mentor support were game-changers for me.'
  }
];

const Index = () => {
  const { user, token } = useAuth();
  const API_URL = "http://localhost:3000";
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [topInstructors, setTopInstructors] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "N/A";
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const two = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
  };

  // Remove the redirect to login - Index page should be public
  // useEffect(() => {
  //   if (!token) {
  //     navigate("/login");
  //   }
  // }, [token]);

  useEffect(() => {
    // Fetch courses without requiring authentication
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    fetch(`${API_URL}/course?limit=3`, { headers })
      .then(res => res.json())
      .then(data => {
        setCourses(data.data);
        setFeaturedCourses(data.data.map(course => ({
          id: course.id,
          title: course.title,
          image: course.imageUrl || '/default-course.jpg',
          category: course.category,
          level: course.level,
          instructor: course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown',
          rating: course.rating || 0,
          students: course.students || 0,
          duration: course.duration || 0,
          price: course.price,
          videoUrl: course.videoUrl,
        })));
      })
      .catch(() => setFeaturedCourses([]));
  }, []);

  // Fetch top instructors
  useEffect(() => {
    fetch(`${API_URL}/user/instructors`)
      .then(res => res.json())
      .then(data => {
        const instructorsArray = Array.isArray(data) ? data : [];
        setTopInstructors(instructorsArray.slice(0, 4)); // Get top 4 instructors
      })
      .catch((error) => {
        console.error('Error fetching instructors:', error);
        setTopInstructors([]);
      });
  }, []);

  // Fetch categories from all courses
  useEffect(() => {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    fetch(`${API_URL}/course?page=1&limit=1000`, { headers })
      .then(res => res.json())
      .then(data => {
        const courses = data?.data || [];
        const categoryMap = new Map();
        
        // Group courses by category
        for (const course of courses) {
          const categoryName = course.category || 'Uncategorized';
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
              name: categoryName,
              courseCount: 0,
              icon: getCategoryIcon(categoryName),
              color: getCategoryColor(categoryName),
              description: `Explore courses in ${categoryName}`
            });
          }
          categoryMap.get(categoryName).courseCount += 1;
        }
        
        // Convert to array and sort by course count (most popular first)
        const categoriesArray = Array.from(categoryMap.values())
          .sort((a, b) => b.courseCount - a.courseCount)
          .slice(0, 4) // Get top 4 categories
          .map(cat => ({
            ...cat,
            courseCount: `${cat.courseCount} course${cat.courseCount !== 1 ? 's' : ''}`
          }));
        
        setPopularCategories(categoriesArray);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setPopularCategories([]);
      });
  }, [token]);



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-900 text-white py-24 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Join 50,000+ learners worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Learn Without
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 animate-gradient">
                Limits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-blue-100 leading-relaxed">
              Discover world-class courses from expert instructors. 
              <span className="block mt-2 font-semibold text-white">
                Start learning today and transform your future.
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/categories">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 hover:scale-105 transition-all shadow-lg px-8 py-6 text-lg font-semibold">
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="border-2 border-white text-yellow-900 hover:bg-white hover:text-blue-700 hover:scale-105 transition-all px-8 py-6 text-lg font-semibold">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Courses
                </Button>
              </Link>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                  <benefit.icon className="w-8 h-8 text-yellow-300 mb-3 mx-auto" />
                  <div className="text-3xl font-bold mb-1">{benefit.stat}</div>
                  <div className="text-blue-200 text-sm">{benefit.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2">Why Choose LearnHub</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the tools, resources, and support to help you achieve your learning goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-center group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses - Enhanced */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <Badge className="mb-4 px-4 py-2">Popular Courses</Badge>
              <h2 className="text-4xl md:text-5xl font-bold">Start Learning Today</h2>
              <p className="text-xl text-gray-600 mt-2">Handpicked courses to boost your career</p>
            </div>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="group">
                View All Courses
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
          
          {featuredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                  <div className="relative overflow-hidden">
                    {courses && course.videoUrl ? (
                      <video
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        src={course.videoUrl}
                        controls={false}
                        autoPlay={false}
                        muted
                        preload="metadata"
                        onLoadedData={e => e.target.pause()}
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Badge className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-blue-700 font-semibold">{course.category}</Badge>
                    <Badge variant="secondary" className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm">{course.level}</Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">{course.title}</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">by {course.instructor}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((i) => (
                            <Star key={i} className={`w-4 h-4 ${i <= Math.round(course.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="font-bold text-sm">{(course.rating || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{formatDuration(course.duration)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${course.price}</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">Best Value</Badge>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Link to={`/course/${course.id}`} className="w-full">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg transition-all">
                        <Play className="w-4 h-4 mr-2" />
                        Enroll Now
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2">Explore Topics</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Popular Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover courses across various fields and start learning today
            </p>
          </div>
          
          {popularCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCategories.map((category, index) => (
                <Link to={`/courses?category=${encodeURIComponent(category.name)}`} key={index}>
                  <Card className="group h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gray-200 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{category.name}</CardTitle>
                      <Badge variant="secondary" className="mx-auto">{category.courseCount}</Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/categories">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <BookOpen className="w-5 h-5 mr-2" />
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Instructors Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2">Meet Our Experts</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Learn from the Best</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our instructors are industry professionals with years of real-world experience
            </p>
          </div>
          
          {topInstructors.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading instructors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {topInstructors.map((instructor, index) => (
                <Card key={index} className="group text-center overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                  <div className="relative h-64 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    <img 
                      src={getProfilePicUrl(instructor.profilePicUrl)} 
                      alt={`${instructor.firstName} ${instructor.lastName}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {instructor.firstName} {instructor.lastName}
                    </CardTitle>
                    {instructor.domain && (
                      <Badge className="mx-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                        {instructor.domain}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {instructor.experienceLvl && (
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">{instructor.experienceLvl} Level</span>
                      </div>
                    )}
                    <Link to="/instructors">
                      <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/instructors">
              <Button size="lg" variant="outline" className="group">
                View All Instructors
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

            {/* Platform Description Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2">About LearnHub</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Gateway to Knowledge</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                <span className="font-bold text-2xl text-blue-600">LearnHub</span> is more than just an online learning platform—it's your partner in achieving your professional and personal goals.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We connect passionate learners with world-class instructors, providing high-quality courses across technology, business, design, and more. Our mission is to make education accessible, affordable, and engaging for everyone.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you're looking to advance your career, start a new one, or simply learn something new, LearnHub has the resources and community to support your journey every step of the way.
              </p>
              <div className="flex gap-4 pt-4">
                <Link to="/about">
                  <Button size="lg" variant="outline">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100">
                <CardHeader>
                  <Award className="w-10 h-10 text-blue-600 mb-2" />
                  <CardTitle className="text-2xl">100+</CardTitle>
                  <CardDescription>Expert Instructors</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-100">
                <CardHeader>
                  <BookOpen className="w-10 h-10 text-purple-600 mb-2" />
                  <CardTitle className="text-2xl">500+</CardTitle>
                  <CardDescription>Quality Courses</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-green-100">
                <CardHeader>
                  <Users className="w-10 h-10 text-green-600 mb-2" />
                  <CardTitle className="text-2xl">50K+</CardTitle>
                  <CardDescription>Active Students</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-orange-100">
                <CardHeader>
                  <Globe className="w-10 h-10 text-orange-600 mb-2" />
                  <CardTitle className="text-2xl">150+</CardTitle>
                  <CardDescription>Countries</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2">Success Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from real people who transformed their careers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group bg-white hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <Quote className="w-10 h-10 text-blue-200 mb-4" />
                  
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Removed old testimonials comment */}

      {/* CTA Section - Enhanced */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/30">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Limited Time Offer</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Transform Your Future?
          </h2>
          
          <p className="text-xl md:text-2xl mb-10 text-blue-100 leading-relaxed max-w-3xl mx-auto">
            Join thousands of successful learners who have already accelerated their careers. 
            <span className="block mt-2 font-semibold text-white">
              Your journey to success starts today!
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 hover:scale-105 transition-all shadow-xl px-10 py-6 text-lg font-semibold">
                <GraduationCap className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="border-2 border-white text-purple-900 hover:bg-white hover:text-blue-700 hover:scale-105 transition-all px-10 py-6 text-lg font-semibold">
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Courses
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">4.8/5</div>
              <div className="text-blue-200 text-sm flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                Average Rating
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-blue-200 text-sm flex items-center gap-1">
                <Users className="w-4 h-4" />
                Active Students
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-blue-200 text-sm flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                Quality Courses
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
