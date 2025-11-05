import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Award, 
  BookOpen, 
  Users, 
  Star, 
  Mail, 
  Phone, 
  Briefcase,
  GraduationCap,
  TrendingUp,
  Clock,
  Play,
  CheckCircle2,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Github,
  MessageCircle,
  Calendar,
  DollarSign,
  Target,
  Heart,
  Share2,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const API_BASE = "http://localhost:3000";

const InstructorPortfolio = () => {
  const { instructorId } = useParams();
  const { token } = useAuth();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (!instructorId || !token) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch instructor details with authentication
        const instructorRes = await fetch(`${API_BASE}/user/${instructorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!instructorRes.ok) throw new Error('Failed to fetch instructor');
        const instructorData = await instructorRes.json();
        setInstructor(instructorData);

        // Fetch instructor's courses (only visible ones) with authentication
        const coursesRes = await fetch(`${API_BASE}/course/instructor/${instructorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!coursesRes.ok) throw new Error('Failed to fetch courses');
        const coursesData = await coursesRes.json();
        // Filter out hidden courses
        setCourses(coursesData.filter(course => !course.hided));
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [instructorId, token]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalStudents = courses.reduce((sum, course) => sum + (course.students?.length || 0), 0);
    const totalCourses = courses.length;
    const avgRating = courses.length > 0 
      ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
      : 0;
    const totalReviews = courses.reduce((sum, course) => sum + (course.reviews?.length || 0), 0);

    return {
      totalStudents,
      totalCourses,
      avgRating,
      totalReviews
    };
  }, [courses]);

  const getExperienceBadge = (level) => {
    const badges = {
      BEGINNER: { label: 'Beginner', color: 'bg-green-100 text-green-700 border-green-200' },
      INTERMEDIATE: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      ADVANCED: { label: 'Expert', color: 'bg-purple-100 text-purple-700 border-purple-200' }
    };
    return badges[level] || badges.BEGINNER;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading instructor profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Instructor Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The instructor you are looking for does not exist.'}</p>
            <Link to="/instructors">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Browse All Instructors
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const experienceBadge = getExperienceBadge(instructor.experienceLvl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-200 via-blue-500 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Profile Section */}
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                      <img
                        src={instructor.profilePicUrl 
                          ? `${API_BASE}${instructor.profilePicUrl}` 
                          : `${API_BASE}/uploads/user icon.png`}
                        alt={`${instructor.firstName} ${instructor.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-2 shadow-lg">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {instructor.firstName} {instructor.lastName}
                      </h1>
                      <p className="text-blue-100 text-lg mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        {instructor.domain || 'Professional Instructor'}
                      </p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${experienceBadge.color} border font-medium px-3 py-1`}>
                      <Award className="w-3.5 h-3.5 mr-1.5" />
                      {experienceBadge.label}
                    </Badge>
                    <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white font-medium px-3 py-1">
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      {stats.totalStudents} Students
                    </Badge>
                    <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white font-medium px-3 py-1">
                      <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                      {stats.totalCourses} Courses
                    </Badge>
                    {stats.avgRating > 0 && (
                      <Badge className="bg-yellow-400/90 border-yellow-300 text-yellow-900 font-medium px-3 py-1">
                        <Star className="w-3.5 h-3.5 mr-1.5 fill-yellow-900" />
                        {stats.avgRating} Rating
                      </Badge>
                    )}
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="border-white/30 text-red-700  hover:border-red-800 hover:text-red-800">
                      <Heart className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-blue-100">Total Students</span>
                    <span className="text-2xl font-bold">{stats.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-blue-100">Courses</span>
                    <span className="text-2xl font-bold">{stats.totalCourses}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-blue-100">Average Rating</span>
                    <span className="text-2xl font-bold flex items-center gap-1">
                      {stats.avgRating}
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-blue-100">Reviews</span>
                    <span className="text-2xl font-bold">{stats.totalReviews}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
                <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  About
                </TabsTrigger>
                <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  Courses ({stats.totalCourses})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  Reviews
                </TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6 mt-6">
                <Card className="border-2 border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="w-5 h-5 text-blue-600" />
                      About {instructor.firstName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Professional Background</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {instructor.bio || `${instructor.firstName} ${instructor.lastName} is an experienced instructor specializing in ${instructor.domain}. With a ${experienceBadge.label.toLowerCase()} level of expertise, they bring valuable knowledge and practical insights to help students succeed in their learning journey.`}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Experience Level</h4>
                          <p className="text-sm text-gray-600">{experienceBadge.label} Instructor</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <Briefcase className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Specialization</h4>
                          <p className="text-sm text-gray-600">{instructor.domain || 'Multiple Domains'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <Users className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Total Students</h4>
                          <p className="text-sm text-gray-600">{stats.totalStudents} students taught</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                        <BookOpen className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Courses Created</h4>
                          <p className="text-sm text-gray-600">{stats.totalCourses} active courses</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teaching Philosophy */}
                <Card className="border-2 border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="w-5 h-5 text-blue-600" />
                      Teaching Approach
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Practical & Hands-on</h4>
                          <p className="text-sm text-gray-600">Focus on real-world applications and projects</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Student-Centered</h4>
                          <p className="text-sm text-gray-600">Adapting to different learning styles and paces</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Industry-Relevant</h4>
                          <p className="text-sm text-gray-600">Teaching current technologies and best practices</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-6 mt-6">
                {courses.length === 0 ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses available yet</h3>
                      <p className="text-gray-500">This instructor hasn't published any courses yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {courses.map((course) => (
                      <Card key={course.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Course Thumbnail */}
                          <div className="sm:w-64 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden">
                            {course.videoUrl ? (
                              <video
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={course.videoUrl}
                                controls={false}
                                muted
                                preload="metadata"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                <Play className="w-16 h-16 text-blue-300" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                                <Play className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            </div>
                          </div>

                          {/* Course Info */}
                          <div className="flex-1 p-4 sm:p-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    {course.category}
                                  </Badge>
                                  <Badge variant="outline">{course.level}</Badge>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                  {course.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                  {course.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                  ${course.price}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {course.students?.length || 0} students
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  {course.rating || 0}
                                </span>
                                {course.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {course.duration}
                                  </span>
                                )}
                              </div>
                              <Link to={`/course/${course.id}`}>
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                  View Course
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6 mt-6">
                <Card className="border-2 border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Student Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.totalReviews === 0 ? (
                      <div className="text-center py-12">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to leave a review after taking a course!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                          <div className="text-5xl font-bold text-gray-900 mb-2">{stats.avgRating}</div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= Math.round(stats.avgRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600">{stats.totalReviews} reviews</p>
                        </div>
                        
                        <p className="text-center text-gray-500 text-sm py-4">
                          Individual reviews coming soon!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <Card className="border-2 border-gray-100 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {instructor.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{instructor.email}</p>
                    </div>
                  </div>
                )}
                
                {instructor.phoneNumber && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{instructor.phoneNumber}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{stats.totalStudents}+</p>
                    <p className="text-xs text-gray-600">Students Taught</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{stats.totalCourses}</p>
                    <p className="text-xs text-gray-600">Courses Created</p>
                  </div>
                </div>
                
                {stats.avgRating > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stats.avgRating}/5.0</p>
                      <p className="text-xs text-gray-600">Average Rating</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InstructorPortfolio;
