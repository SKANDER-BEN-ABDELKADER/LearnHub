import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Users, BookOpen, Star, Plus, Edit, Trash2, Eye, LogOut } from "lucide-react";
import { useAuth } from "../components/context/AuthContext";
import api from "../services/api";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState("users");

  // Filter states
  const [userFilters, setUserFilters] = useState({
    role: "ALL",
    search: ""
  });

  const [courseFilters, setCourseFilters] = useState({
    category: "ALL",
    level: "ALL",
    search: ""
  });

  const [reviewFilters, setReviewFilters] = useState({
    rating: "ALL",
    search: ""
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT"
  });

  // Courses state
  const [courses, setCourses] = useState([]);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "BEGINNER",
    price: 0,
    hided: false
  });

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    value: 5,
    comment: ""
  });

  // Loading states
  const [loading, setLoading] = useState({
    users: false,
    courses: false,
    reviews: false
  });

  // Fetch data functions
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await api.get('/user');
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchCourses = async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const response = await api.get('/course');
      // Handle pagination - assuming response.data.data contains the courses
      const coursesData = response.data.data || response.data;
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const fetchReviews = async () => {
    setLoading(prev => ({ ...prev, reviews: true }));
    try {
      const response = await api.get('/rating');
      setReviews(response.data);
    } catch (error) {
      toast.error("Failed to fetch reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  // Filtered data
  const filteredUsers = users.filter(user => {
    const matchesRole = userFilters.role === "ALL" || user.role === userFilters.role;
    const matchesSearch = userFilters.search === "" ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(userFilters.search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredCourses = courses.filter(course => {
    const matchesCategory = courseFilters.category === "ALL" || course.category === courseFilters.category;
    const matchesLevel = courseFilters.level === "ALL" || course.level === courseFilters.level;
    const matchesSearch = courseFilters.search === "" ||
      course.title.toLowerCase().includes(courseFilters.search.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const filteredReviews = reviews.filter(review => {
    const matchesRating = reviewFilters.rating === "ALL" || review.value.toString() === reviewFilters.rating;
    const matchesSearch = reviewFilters.search === "" ||
      (review.course?.title || "").toLowerCase().includes(reviewFilters.search.toLowerCase()) ||
      (review.student ? `${review.student.firstName} ${review.student.lastName}` : "").toLowerCase().includes(reviewFilters.search.toLowerCase());
    return matchesRating && matchesSearch;
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchReviews();
  }, []);

  // User management functions
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...userForm };
      
      // If editing and password is empty, don't include it
      if (editingUser && !submitData.password.trim()) {
        delete submitData.password;
      }
      
      if (editingUser) {
        await api.patch(`/user/${editingUser.id}`, submitData);
        toast.success("User updated successfully");
      } else {
        await api.post('/user', submitData);
        toast.success("User created successfully");
      }
      setUserDialogOpen(false);
      setEditingUser(null);
      resetUserForm();
      fetchUsers();
    } catch (error) {
      toast.error(editingUser ? "Failed to update user" : "Failed to create user");
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/user/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "", // Start empty for editing
      role: user.role || "STUDENT"
    });
    setUserDialogOpen(true);
  };

  const resetUserForm = () => {
    setUserForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "STUDENT"
    });
  };

  // Course management functions
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/course/${editingCourse.id}`, courseForm);
      toast.success("Course updated successfully");
      setCourseDialogOpen(false);
      setEditingCourse(null);
      resetCourseForm();
      fetchCourses();
    } catch (error) {
      toast.error("Failed to update course");
      console.error("Error updating course:", error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await api.delete(`/course/${courseId}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
      console.error("Error deleting course:", error);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      level: course.level || "BEGINNER",
      price: course.price || 0,
      hided: course.hided || false
    });
    setCourseDialogOpen(true);
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      level: "BEGINNER",
      price: 0,
      hided: false
    });
  };

  // Review management functions
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/rating/${editingReview.id}`, reviewForm);
      toast.success("Review updated successfully");
      setReviewDialogOpen(false);
      setEditingReview(null);
      resetReviewForm();
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update review");
      console.error("Error updating review:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/rating/${reviewId}`);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
      console.error("Error deleting review:", error);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      value: review.value || 5,
      comment: review.comment || ""
    });
    setReviewDialogOpen(true);
  };

  const resetReviewForm = () => {
    setReviewForm({
      value: 5,
      comment: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Admin Dashboard</h1>
            <p className="text-blue-700">Manage users, courses, and reviews</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-blue-100">
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" />
              Courses ({filteredCourses.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Star className="w-4 h-4" />
              Reviews ({filteredReviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <CardTitle className="text-blue-900">User Management</CardTitle>
                    <CardDescription className="text-blue-700">Add, edit, and delete users</CardDescription>
                  </div>
                  <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingUser(null);
                          resetUserForm();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-blue-900">
                          {editingUser ? "Edit User" : "Add New User"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingUser ? "Update user information" : "Create a new user account"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUserSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">First Name</Label>
                            <Input
                              id="firstName"
                              value={userForm.firstName}
                              onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">Last Name</Label>
                            <Input
                              id="lastName"
                              value={userForm.lastName}
                              onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={userForm.password}
                              onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                              className="col-span-3"
                              placeholder={editingUser ? "Leave empty to keep current password" : ""}
                              required={!editingUser}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                              <SelectTrigger id="role" className="col-span-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            {editingUser ? "Update User" : "Create User"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {/* User Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="userRoleFilter">Role:</Label>
                    <Select value={userFilters.role} onValueChange={(value) => setUserFilters({...userFilters, role: value})}>
                      <SelectTrigger id="userRoleFilter" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="userSearch">Search:</Label>
                    <Input
                      id="userSearch"
                      placeholder="Search by name or email..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading.users ? (
                  <div className="p-8 text-center text-blue-600">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-blue-900">Name</TableHead>
                        <TableHead className="text-blue-900">Email</TableHead>
                        <TableHead className="text-blue-900">Role</TableHead>
                        <TableHead className="text-blue-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-blue-50">
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'INSTRUCTOR' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <div className="mb-4">
                  <CardTitle className="text-blue-900">Course Management</CardTitle>
                  <CardDescription className="text-blue-700">Edit and delete courses</CardDescription>
                </div>
                {/* Course Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="courseCategoryFilter">Category:</Label>
                    <Select value={courseFilters.category} onValueChange={(value) => setCourseFilters({...courseFilters, category: value})}>
                      <SelectTrigger id="courseCategoryFilter" className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {courses.length > 0 && [...new Set(courses.map(course => course.category).filter(Boolean))].map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="courseLevelFilter">Level:</Label>
                    <Select value={courseFilters.level} onValueChange={(value) => setCourseFilters({...courseFilters, level: value})}>
                      <SelectTrigger id="courseLevelFilter" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Levels</SelectItem>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="courseSearch">Search:</Label>
                    <Input
                      id="courseSearch"
                      placeholder="Search by title..."
                      value={courseFilters.search}
                      onChange={(e) => setCourseFilters({...courseFilters, search: e.target.value})}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading.courses ? (
                  <div className="p-8 text-center text-blue-600">Loading courses...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-blue-900">Title</TableHead>
                        <TableHead className="text-blue-900">Category</TableHead>
                        <TableHead className="text-blue-900">Level</TableHead>
                        <TableHead className="text-blue-900">Price</TableHead>
                        <TableHead className="text-blue-900">Status</TableHead>
                        <TableHead className="text-blue-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course.id} className="hover:bg-blue-50">
                          <TableCell className="font-medium max-w-xs truncate" title={course.title}>
                            {course.title}
                          </TableCell>
                          <TableCell>{course.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{course.level}</Badge>
                          </TableCell>
                          <TableCell>${course.price}</TableCell>
                          <TableCell>
                            <Badge variant={course.hided ? 'secondary' : 'default'}>
                              {course.hided ? 'Hidden' : 'Visible'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCourse(course.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Course Edit Dialog */}
            <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle className="text-blue-900">Edit Course</DialogTitle>
                  <DialogDescription>Update course information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCourseSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input
                        id="title"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea
                        id="description"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                        className="col-span-3"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <Input
                        id="category"
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="level" className="text-right">Level</Label>
                      <Select value={courseForm.level} onValueChange={(value) => setCourseForm({...courseForm, level: value})}>
                        <SelectTrigger id="courseEditLevel" className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({...courseForm, price: parseFloat(e.target.value) || 0})}
                        className="col-span-3"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hided" className="text-right">Hidden</Label>
                      <input
                        id="hided"
                        type="checkbox"
                        checked={courseForm.hided}
                        onChange={(e) => setCourseForm({...courseForm, hided: e.target.checked})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Update Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <div className="mb-4">
                  <CardTitle className="text-blue-900">Review Management</CardTitle>
                  <CardDescription className="text-blue-700">Edit and delete reviews</CardDescription>
                </div>
                {/* Review Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reviewRatingFilter">Rating:</Label>
                    <Select value={reviewFilters.rating} onValueChange={(value) => setReviewFilters({...reviewFilters, rating: value})}>
                      <SelectTrigger id="reviewRatingFilter" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reviewSearch">Search:</Label>
                    <Input
                      id="reviewSearch"
                      placeholder="Search by course or user..."
                      value={reviewFilters.search}
                      onChange={(e) => setReviewFilters({...reviewFilters, search: e.target.value})}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading.reviews ? (
                  <div className="p-8 text-center text-blue-600">Loading reviews...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-blue-900">Course</TableHead>
                        <TableHead className="text-blue-900">User</TableHead>
                        <TableHead className="text-blue-900">Rating</TableHead>
                        <TableHead className="text-blue-900">Creation Date</TableHead>
                        <TableHead className="text-blue-900">Update Date</TableHead>
                        <TableHead className="text-blue-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review) => (
                        <TableRow key={review.id} className="hover:bg-blue-50">
                          <TableCell className="font-medium">
                            {review.course?.title || 'Unknown Course'}
                          </TableCell>
                          <TableCell>
                            {review.student ? `${review.student.firstName} ${review.student.lastName}` : 'Unknown User'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {review.value}
                            </div>
                          </TableCell>
                          <TableCell>
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditReview(review)}
                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this review? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteReview(review.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Review Edit Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-blue-900">Edit Review</DialogTitle>
                  <DialogDescription>Update review information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReviewSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rating" className="text-right">Rating</Label>
                      <Select value={reviewForm.value.toString()} onValueChange={(value) => setReviewForm({...reviewForm, value: parseInt(value)})}>
                        <SelectTrigger id="rating" className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="comment" className="text-right">Comment</Label>
                      <Textarea
                        id="comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        className="col-span-3"
                        rows={3}
                        placeholder="Review comment..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Update Review
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
      
    </div>
  );
};

export default AdminDashboard;