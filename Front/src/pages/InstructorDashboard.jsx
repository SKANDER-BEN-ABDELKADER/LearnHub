import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Plus, 
  Star,
  Upload,
  PlayCircle,
  Award,
  BarChart3,
  Clock,
  Video,
  Filter,
  Search
} from "lucide-react";

const API_BASE = "http://localhost:3000";

const InstructorDashboard = () => {
  const { user, token } = useAuth();
  const instructorId = user?.id;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    level: "",
    videoFile: null,
    hided: false,
    learnText: "",
    requirementsText: "",
  });
  const [dragActive, setDragActive] = useState(false);

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => sum + (course.students?.length || 0), 0);
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price * (course.students?.length || 0)), 0);
    const avgRating = courses.length > 0 
      ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
      : 0;
    const publishedCourses = courses.filter(c => !c.hided).length;

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      avgRating,
      publishedCourses
    };
  }, [courses]);

    const handleOpenAdd = () => {
      setForm({
        title: "",
        description: "",
        price: 0,
        category: "",
        level: "",
        videoFile: null,
        hided: false,
        learnText: "",
        requirementsText: "",
      });
      setShowAddModal(true);
    };

    const handleOpenEdit = (course) => {
      setEditCourse(course);
      setForm({ 
        ...course, 
        videoFile: null,
        learnText: Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn.join('\n') : "",
        requirementsText: Array.isArray(course.requirements) ? course.requirements.join('\n') : "",
      });
      setShowEditModal(true);
    };

    const handleOpenDelete = (course) => {
      setDeleteCourse(course);
      setShowDeleteModal(true);
    };

    const handleChange = (e) => {
      const { name, value, type, checked, files } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      }));
    };

    const handleVideoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('video/')) {
          setError('Please select a valid video file');
          return;
        }
        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          setError('Video file size must be less than 100MB');
          return;
        }
        setForm(prev => ({
          ...prev,
          videoFile: file,
          videoUrl: ""
        }));
        setError(null);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith('video/')) {
          setError('Please select a valid video file');
          return;
        }
        if (file.size > 100 * 1024 * 1024) {
          setError('Video file size must be less than 100MB');
          return;
        }
        setForm(prev => ({ ...prev, videoFile: file, videoUrl: "" }));
        setError(null);
      }
    };

    // Fetch instructor's courses
    useEffect(() => {
      if (!instructorId) return;
      setLoading(true);
      fetch(`${API_BASE}/course/instructor/${instructorId}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch courses");
          return res.json();
        })
        .then(data => {
          setCourses(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, [instructorId]);

    // Add course
    const handleAddCourse = async () => {
      try {
        setIsAdding(true);
        const toastId = toast.loading('Uploading video and analyzing content...');
        const formData = new FormData();
        
        // Add basic course data
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('price', String(form.price));
        formData.append('category', form.category);
        formData.append('level', form.level);
        formData.append('hided', String(form.hided));
        formData.append('instructorId', String(instructorId));
        
        // Add video data
        if (form.videoFile) {
          console.log('Adding video file:', form.videoFile.name, form.videoFile.size);
          formData.append('video', form.videoFile);
        } else if (form.videoUrl) {
          console.log('Adding video URL:', form.videoUrl);
          formData.append('videoUrl', form.videoUrl);
        }

        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        const res = await fetch(`${API_BASE}/course`, {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`, 
          },
        });
       
        if (!res.ok) throw new Error("Failed to add course");
        const newCourse = await res.json();
        setCourses(prev => [...prev, newCourse]);
        setShowAddModal(false);
        toast.success('Course created successfully!', { id: toastId });
        setForm({
          title: "",
          description: "",
          price: 0,
          category: "",
          level: "",
          videoFile: null,
          hided: false,
        });
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to add course');
      } finally {
        setIsAdding(false);
      }
    };

    // Edit course
    const handleEditCourse = async () => {
      try {
        const toastId = toast.loading('Saving changes...');
        const formData = new FormData();
        
        // Add basic course data
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('price', String(form.price));
        formData.append('category', form.category);
        formData.append('level', form.level);
        formData.append('hided', String(form.hided));
        
        // Add video data
        if (form.videoFile) {
          console.log('Edit - Adding video file:', form.videoFile.name, form.videoFile.size);
          formData.append('video', form.videoFile);
        } else if (form.videoUrl) {
          formData.append('videoUrl', form.videoUrl);
        }

        // Add whatYouWillLearn and requirements from textareas (one per line)
        const learnItems = (form.learnText || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const reqItems = (form.requirementsText || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        learnItems.forEach(item => formData.append('whatYouWillLearn', item));
        reqItems.forEach(item => formData.append('requirements', item));

        for (let [key, value] of formData.entries()) {
        }

        const res = await fetch(`${API_BASE}/course/${editCourse.id}`, {
          method: "PATCH",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`, // Assuming you have a token for auth
          },
        });
        
        
        if (!res.ok) throw new Error("Failed to update course");
        const updated = await res.json();
        setCourses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
        setShowEditModal(false);
        setEditCourse(null);
        toast.success('Course updated successfully!', { id: toastId });
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to update course');
      } finally {
        setIsEditing(false);
      }
    };

    const handleDeleteCourse = async () => {
      try {
        const toastId = toast.loading('Deleting course...');
        const res = await fetch(`${API_BASE}/course/${deleteCourse.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!res.ok) throw new Error("Failed to delete course");
        
        setCourses(prev => prev.filter(c => c.id !== deleteCourse.id));
        setShowDeleteModal(false);
        setDeleteCourse(null);
        toast.success('Course deleted successfully', { id: toastId });
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to delete course');
      }
    };

    const toggleCourseVisibility = async (course) => {
      try {
        const formData = new FormData();
        formData.append('hided', String(!course.hided));
        
        const res = await fetch(`${API_BASE}/course/${course.id}`, {
          method: "PATCH",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!res.ok) throw new Error("Failed to update course");
        const updated = await res.json();
        setCourses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
        toast.success(updated.hided ? 'Course hidden from students' : 'Course is now visible to students');
      } catch (err) {
        toast.error('Failed to update course visibility');
      }
    };

    // Filter courses
    const filteredCourses = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || course.category === filterCategory;
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "published" && !course.hided) ||
                           (filterStatus === "hidden" && course.hided);
      return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = [...new Set(courses.map(c => c.category))];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Instructor Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {user?.firstName} {user?.lastName}! 👋</p>
              </div>
              <Button 
                onClick={handleOpenAdd} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Course
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
                <BookOpen className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{analytics.totalCourses}</div>
                <p className="text-xs text-gray-500 mt-1">{analytics.publishedCourses} published</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                <Users className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{analytics.totalStudents}</div>
                <p className="text-xs text-gray-500 mt-1">Across all courses</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <DollarSign className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">${analytics.totalRevenue}</div>
                <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Rating</CardTitle>
                <Star className="w-5 h-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{analytics.avgRating}</div>
                <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {courses.length > 0 ? Math.round((analytics.totalStudents / courses.length)) : 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Avg. students/course</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search courses by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your courses...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-center">{error}</p>
              </CardContent>
            </Card>
          ) : filteredCourses.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {courses.length === 0 ? "No courses yet" : "No courses match your filters"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {courses.length === 0 
                    ? "Create your first course and start teaching!"
                    : "Try adjusting your search or filters"
                  }
                </p>
                {courses.length === 0 && (
                  <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Course
                  </Button>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                    <div className="relative overflow-hidden">
                      {course.videoUrl ? (
                        <video
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          src={course.videoUrl}
                          controls={false}
                          autoPlay={false}
                          muted
                          preload="metadata"
                          onLoadedData={e => e.target.pause()}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Video className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Badge className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-blue-600 font-semibold border-0">
                        {course.category}
                      </Badge>
                      <Badge variant="secondary" className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm">
                        {course.level}
                      </Badge>
                      {course.hided && (
                        <Badge variant="destructive" className="absolute bottom-3 left-3">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{course.students?.length || 0} students</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            <span className="font-semibold">{course.rating || 0}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ${course.price}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>${(course.price * (course.students?.length || 0)).toFixed(0)} earned</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex gap-2 bg-gray-50">
                      <Button 
                        variant="outline" 
                        onClick={() => toggleCourseVisibility(course)}
                        className="flex-1"
                        size="sm"
                      >
                        {course.hided ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                        {course.hided ? 'Publish' : 'Hide'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleOpenEdit(course)}
                        className="flex-1"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleOpenDelete(course)}
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Add Course Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* <div className="text-sm text-gray-600">Provide the basic details and upload a short intro video. We’ll analyze it to auto-fill learning outcomes and requirements.</div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: fields */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">Basic Information</div>
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Course Title</Label>
                    <Input name="title" id="title" placeholder="e.g. DevOps for Beginners" value={form.title} onChange={handleChange} />
                    <p className="text-xs text-gray-500 mt-1">Make it concise and descriptive.</p>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea name="description" id="description" placeholder="What is this course about? Who is it for?" value={form.description} onChange={handleChange} rows={4} />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Clear, benefit-led overview.</span>
                      <span>{(form.description || '').length}/500</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                      <Input name="price" id="price" type="number" min="0" placeholder="0" value={form.price} onChange={handleChange} />
                      <p className="text-xs text-gray-500 mt-1">Set 0 for free.</p>
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                      <select name="category" id="category" value={form.category} onChange={handleChange} className="w-full border rounded p-2">
                        <option value="">Select category</option>
                        {["Web Development", "Frontend", "Data Science", "Mobile Development", "Design", "Backend", "DevOps", "Cybersecurity"].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="level" className="text-sm font-medium">Level</Label>
                    <select name="level" id="level" value={form.level} onChange={handleChange} className="w-full border rounded p-2">
                      <option value="">Select level</option>
                      {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl.charAt(0) + lvl.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="hided" id="hided-add" checked={form.hided} onChange={handleChange} />
                    <Label htmlFor="hided-add" className="text-sm">Hide course from students</Label>
                  </div>
                </div>

                {/* Right column: video upload */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">Intro Video</div>
                  <Label className="text-sm font-medium mb-2 block">Intro Video</Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-lg border-2 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} p-6 text-center transition-colors`}
                  >
                    <div className="text-gray-600">
                      <div className="font-medium mb-1">Drag & drop your video here</div>
                      <div className="text-xs">or</div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="videoFile" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 cursor-pointer">Choose file</label>
                      <input type="file" id="videoFile" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">MP4 or WebM up to 100MB</p>
                  </div>

                  {form.videoFile && (
                    <div className="mt-3 rounded-md border p-3 text-sm">
                      <div className="font-medium">Selected file</div>
                      <div className="text-gray-600 mt-1">
                        {form.videoFile.name} · {(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </div>
                      <video className="w-full h-36 object-cover rounded mt-3" src={URL.createObjectURL(form.videoFile)} controls muted preload="metadata" onLoadedData={e => e.currentTarget.pause()} />
                    </div>
                  )}
                </div>
              </div>

              {isAdding && (
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-black/5" />
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
                    Uploading video and analyzing content... This may take up to a minute.
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isAdding}>Cancel</Button>
              <Button onClick={handleAddCourse} disabled={isAdding} className="relative">
                {isAdding && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                )}
                {isAdding ? 'Adding...' : 'Add Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Course Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: fields */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">Basic Information</div>
                  <div>
                    <Label htmlFor="title-edit" className="text-sm font-medium">Course Title</Label>
                    <Input name="title" id="title-edit" placeholder="e.g. DevOps for Beginners" value={form.title} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="description-edit" className="text-sm font-medium">Description</Label>
                    <Textarea name="description" id="description-edit" placeholder="Update the course description" value={form.description} onChange={handleChange} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price-edit" className="text-sm font-medium">Price ($)</Label>
                      <Input name="price" id="price-edit" type="number" min="0" placeholder="0" value={form.price} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="category-edit" className="text-sm font-medium">Category</Label>
                      <select name="category" id="category-edit" value={form.category} onChange={handleChange} className="w-full border rounded p-2">
                        <option value={form.category || ''}>{form.category ? form.category : 'Select category'}</option>
                        {["Web Development", "Frontend", "Data Science", "Mobile Development", "Design", "Backend", "DevOps", "Cybersecurity"].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="level-edit" className="text-sm font-medium">Level</Label>
                    <select name="level" id="level-edit" value={form.level} onChange={handleChange} className="w-full border rounded p-2">
                      <option value={form.level || ''}>{form.level ? form.level : 'Select level'}</option>
                      {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl.charAt(0) + lvl.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Edit learning outcomes */}
                  <div>
                    <Label htmlFor="learn-edit" className="text-sm font-medium">What you’ll learn</Label>
                    <Textarea id="learn-edit" name="learnText" value={form.learnText} onChange={handleChange} rows={4} placeholder={`One item per line\nExample:\n- Understand CI/CD basics\n- Use Docker and Compose`} />
                    <p className="text-xs text-gray-500 mt-1">One item per line. Keep it actionable.</p>
                  </div>

                  {/* Edit requirements */}
                  <div>
                    <Label htmlFor="req-edit" className="text-sm font-medium">Requirements</Label>
                    <Textarea id="req-edit" name="requirementsText" value={form.requirementsText} onChange={handleChange} rows={3} placeholder={`One item per line\nExample:\n- Basic terminal usage\n- Git installed`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="hided" id="hided-edit" checked={form.hided} onChange={handleChange} />
                    <Label htmlFor="hided-edit" className="text-sm">Hide course from students</Label>
                  </div>
                </div>

                {/* Right column: video */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Intro Video</Label>
                  {/* <div className={`rounded-lg border-2 border-dashed border-gray-300 p-6 text-center`}>
                    <div className="text-gray-600">
                      <div className="font-medium mb-1">Upload a new video (optional)</div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="videoFile-edit" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 cursor-pointer">Choose file</label>
                      <input type="file" id="videoFile-edit" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">MP4 or WebM up to 100MB</p>
                  </div> */}

                  {(form.videoFile || editCourse?.videoUrl) && (
                    <div className="mt-3 rounded-md border p-3 text-sm">
                      <div className="font-medium">{form.videoFile ? 'Selected file' : 'Current video'}</div>
                      {form.videoFile ? (
                        <div className="text-gray-600 mt-1">{form.videoFile.name} · {(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB</div>
                      ) : null}
                      <video className="w-full h-36 object-cover rounded mt-3" src={form.videoFile ? URL.createObjectURL(form.videoFile) : editCourse?.videoUrl} controls muted preload="metadata" onLoadedData={e => e.currentTarget.pause()} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isEditing}>Cancel</Button>
              <Button onClick={handleEditCourse} disabled={isEditing} className="relative">
                {isEditing && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                )}
                {isEditing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Course
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold">"{deleteCourse?.title}"</span>? 
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  ⚠️ This action cannot be undone. All course data, including student enrollments and ratings, will be permanently removed.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Footer />
      </div>
    );
  };

  export default InstructorDashboard; 