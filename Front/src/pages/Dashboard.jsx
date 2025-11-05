import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { 
  BookOpen, 
  Clock, 
  Award, 
  Play, 
  Download, 
  Calendar, 
  TrendingUp, 
  Star, 
  Target,
  Flame,
  Trophy,
  CheckCircle2,
  Search,
  Filter,
  BarChart3,
  GraduationCap,
  Zap,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";
import { getImageUrl } from "../utils/imageUtils";
import api from "../services/api";

const Dashboard = () => {
  const { user: authUser, token } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "/placeholder.svg"
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    // Populate profile from auth context
    if (authUser) {
      setProfile({
        name: `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() || authUser.email || "User",
        email: authUser.email || "",
        avatar: getImageUrl(authUser.profilePicUrl) || "/placeholder.svg"
      });
    }
  }, [authUser]);

  useEffect(() => {
    // Fetch only courses the user is enrolled in
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/course/me/enrolled');
        const data = res.data;
        // Backend can return paginated or plain list; normalize accordingly
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        const normalized = list.map((c) => {
          const totalLessons = Number(c.lessons || 0);
          const completedLessons = Number(c.completedLessons || 0);
          const progress = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : Number(c.progress || 0);
          const thumbnail = c.thumbnailUrl ? getImageUrl(c.thumbnailUrl) : null;
          const image = thumbnail || c.videoUrl || "/placeholder.svg";
          return {
            id: c.id,
            title: c.title,
            instructor: c.instructor ? `${c.instructor.firstName || ""} ${c.instructor.lastName || ""}`.trim() : "Unknown",
            progress,
            totalLessons,
            completedLessons,
            duration: c.duration || c.videoDuration || 0,
            image,
            category: c.category || "",
            rating: c.rating || 0,
            level: c.level || "BEGINNER",
            nextLesson: "",
            timeSpent: "",
            completed: progress === 100,
            enrolledAt: c.enrolledAt || new Date().toISOString()
          };
        });
        setCourses(normalized);
      } catch (e) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Calculate enhanced stats
  const stats = React.useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.completed).length;
    const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const totalHours = Math.round(courses.reduce((acc, c) => acc + (c.duration || 0), 0) / 3600);
    const avgProgress = totalCourses > 0 
      ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / totalCourses)
      : 0;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalHours,
      avgProgress,
      certificates: completedCourses // For now, certificates = completed courses
    };
  }, [courses]);

  // Format duration helper
  const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Filter and sort courses
  const filteredCourses = React.useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || 
                           (filterStatus === "in-progress" && course.progress > 0 && course.progress < 100) ||
                           (filterStatus === "completed" && course.completed) ||
                           (filterStatus === "not-started" && course.progress === 0);
      return matchesSearch && matchesFilter;
    });

    // Sort courses
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
    } else if (sortBy === "progress") {
      filtered.sort((a, b) => b.progress - a.progress);
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [courses, searchTerm, filterStatus, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 ring-4 ring-blue-100">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-bold">
                  {(profile.name || "U").split(" ").map(s => s[0]).slice(0,2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {profile.name || "Learner"}! 👋
                </h1>
                <p className="text-gray-600 mt-1">Continue your learning journey and achieve your goals</p>
              </div>
            </div>
            <Link to="/courses">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                <Search className="w-5 h-5 mr-2" />
                Browse More Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow col-span-1 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stats.inProgressCourses} active
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Certificates</p>
              <p className="text-3xl font-bold text-purple-600">{stats.certificates}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalHours}h</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.avgProgress}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Streak & Motivation Card */}
        {stats.completedCourses > 0 && (
          <Card className="mb-8 border-2 border-transparent bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Flame className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Keep the momentum going! 🚀</h3>
                    <p className="text-white/90">You've completed {stats.completedCourses} course{stats.completedCourses > 1 ? 's' : ''}. Amazing progress!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{stats.completedCourses}</div>
                  <div className="text-sm text-white/90">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <GraduationCap className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-6 mt-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search your courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Courses</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="not-started">Not Started</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="progress">By Progress</option>
                    <option value="title">By Title</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Course Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your courses...</p>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="pt-12 pb-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {courses.length === 0 ? "No courses enrolled yet" : "No courses match your filters"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {courses.length === 0 
                      ? "Start your learning journey by enrolling in courses!"
                      : "Try adjusting your search or filters"
                    }
                  </p>
                  {courses.length === 0 && (
                    <Link to="/courses">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Search className="w-5 h-5 mr-2" />
                        Browse Courses
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredCourses.length} of {courses.length} courses
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
                          {String(course.image || '').endsWith('.mp4') ? (
                            <video
                              src={course.image}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              muted
                              loop
                              playsInline
                              onMouseEnter={e => e.currentTarget.play()}
                              onMouseLeave={e => e.currentTarget.pause()}
                            />
                          ) : (
                            <img 
                              src={course.image}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {course.completed && (
                            <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {!course.completed && course.progress > 0 && (
                            <Badge className="absolute top-3 right-3 bg-blue-500 text-white border-0">
                              <Zap className="w-3 h-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className="bg-blue-100 text-blue-800 text-xs border-0">
                              {course.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-yellow-600">
                              <Star className="w-4 h-4 fill-yellow-400" />
                              <span className="text-sm font-semibold">{course.rating || 0}</span>
                            </div>
                          </div>
                          
                          <Link to={`/course/${course.id}`}>
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                          </Link>
                          
                          <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-2">
                                <span className="font-medium text-gray-700">{course.progress}% Complete</span>
                                <span className="text-gray-500">{course.completedLessons}/{course.totalLessons} lessons</span>
                              </div>
                              <Progress value={course.progress} className="h-2.5" />
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(course.duration)}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {course.level}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t flex gap-2">
                            <Link to={`/course/${course.id}`} className="flex-1">
                              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <Play className="w-4 h-4 mr-2" />
                                {course.completed ? "Review Course" : course.progress > 0 ? "Continue Learning" : "Start Course"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Learning Progress Overview
                  </CardTitle>
                  <CardDescription>Track your progress across all enrolled courses</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No progress to show yet. Enroll in courses to start learning!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Overall Progress Summary */}
                      <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-blue-600" />
                              <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{stats.avgProgress}%</div>
                            <Progress value={stats.avgProgress} className="mt-2 h-2" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-5 h-5 text-orange-600" />
                              <span className="text-sm font-medium text-gray-600">Active Courses</span>
                            </div>
                            <div className="text-3xl font-bold text-orange-600">{stats.inProgressCourses}</div>
                            <p className="text-sm text-gray-600 mt-2">Keep the momentum going!</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Trophy className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-gray-600">Completed</span>
                            </div>
                            <div className="text-3xl font-bold text-green-600">{stats.completedCourses}</div>
                            <p className="text-sm text-gray-600 mt-2">Great achievement!</p>
                          </div>
                        </div>
                      </div>

                      {/* Individual Course Progress */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Course by Course Progress</h3>
                        {courses.map((course) => (
                          <Card key={course.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                  {String(course.image || '').endsWith('.mp4') ? (
                                    <video src={course.image} className="w-full h-full object-cover" muted />
                                  ) : (
                                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <Link to={`/course/${course.id}`}>
                                        <h4 className="font-semibold hover:text-blue-600 transition-colors">{course.title}</h4>
                                      </Link>
                                      <p className="text-sm text-gray-600">by {course.instructor}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {course.progress}%
                                      </div>
                                      {course.completed && (
                                        <Badge className="bg-green-500 text-white mt-1">
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Done
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Progress value={course.progress} className="mb-3 h-3" />
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">Lessons:</span>
                                      <div className="font-semibold">{course.completedLessons}/{course.totalLessons}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Duration:</span>
                                      <div className="font-semibold">{formatDuration(course.duration)}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Category:</span>
                                      <div className="font-semibold">{course.category}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Level:</span>
                                      <div className="font-semibold">{course.level}</div>
                                    </div>
                                  </div>
                                  
                                  {!course.completed && (
                                    <div className="mt-3 pt-3 border-t">
                                      <Link to={`/course/${course.id}`}>
                                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                          Continue Learning
                                          <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Your Certificates
                  </CardTitle>
                  <CardDescription>Download and share your achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : stats.completedCourses === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mx-auto mb-6 flex items-center justify-center opacity-50">
                        <Award className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No certificates yet</h3>
                      <p className="text-gray-500 mb-6">Complete courses to earn certificates and showcase your skills!</p>
                      <Link to="/courses">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                          Browse Courses
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courses.filter(c => c.completed).map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-200">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-6">
                              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <Award className="w-10 h-10 text-white" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                                    <p className="text-gray-600">Instructor: {course.instructor}</p>
                                    <p className="text-sm text-gray-500 mt-1">Category: {course.category} • Level: {course.level}</p>
                                  </div>
                                  <Badge className="bg-green-500 text-white">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-4">
                                  <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Certificate
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Share on LinkedIn
                                  </Button>
                                  <Link to={`/course/${course.id}`}>
                                    <Button variant="outline" size="sm">
                                      View Course
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100">
                        <div className="flex items-center gap-4">
                          <Trophy className="w-12 h-12 text-yellow-500" />
                          <div>
                            <h4 className="font-bold text-lg mb-1">Keep Learning! 🎉</h4>
                            <p className="text-gray-600">
                              You've earned {stats.completedCourses} certificate{stats.completedCourses > 1 ? 's' : ''}. 
                              Complete more courses to expand your skills!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
