import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  Lock, 
  Camera, 
  Save, 
  AlertCircle,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';


const experienceLevels = [
  { value: 'BEGINNER', label: 'Beginner (0-2 years)', description: 'New to teaching' },
  { value: 'INTERMEDIATE', label: 'Intermediate (2-5 years)', description: 'Experienced educator' },
  { value: 'ADVANCED', label: 'Advanced (5+ years)', description: 'Seasoned professional' },
];

const domainSuggestions = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'UI/UX Design',
  'Digital Marketing',
  'Business & Finance',
  'Photography',
  'Music',
  'Language Learning',
];

const API_BASE = "http://localhost:3000";

const InstructorProfile = () => {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    domain: '',
    experienceLvl: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      axios.get(`${API_BASE}/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setForm({
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            email: res.data.email || '',
            password: '',
            phoneNumber: res.data.phoneNumber || '',
            domain: res.data.domain || '',
            experienceLvl: res.data.experienceLvl || '',
            profilePicUrl: res.data.profilePicUrl || '',
          });
          setProfilePicPreview(res.data.profilePicUrl ? `http://localhost:3000${res.data.profilePicUrl}` : 'http://localhost:3000/uploads/user icon.png');
        })
        .catch(() => setError('Failed to load profile'))
        .finally(() => setLoading(false));
    }
  }, [user, token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file)); // Show preview immediately
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updateData = { ...form };
      if (!updateData.password) delete updateData.password;
      let formData;
      if (profilePic) {
        formData = new FormData();
        Object.entries(updateData).forEach(([key, value]) => formData.append(key, value));
        formData.append('profilePic', profilePic);
      }
      await axios.patch(
        `${API_BASE}/user/${user.id}`,
        profilePic ? formData : updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(profilePic ? { 'Content-Type': 'multipart/form-data' } : {}),
          },
        }
      );
      setSuccess('Profile updated successfully!');
      setForm(f => ({ ...f, password: '' }));
      // Fetch updated user data and update localStorage and preview
      const res = await axios.get(`${API_BASE}/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      setProfilePicPreview(res.data.profilePicUrl ? `http://localhost:3000${res.data.profilePicUrl}` : 'http://localhost:3000/uploads/user icon.png');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainSelect = (domain) => {
    setForm(prev => ({ ...prev, domain }));
    setShowDomainSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Instructor Profile
          </h1>
          <p className="text-gray-600">
            Manage your professional information and settings
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Success</h3>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex flex-col items-center">
                {/* Profile Picture */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                    <img
                      src={profilePicPreview || 'http://localhost:3000/uploads/user icon.png'}
                      alt="Profile"
                      className="w-full h-full object-cover bg-white"
                    />
                  </div>
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2.5 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                    <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
                    <Camera className="w-4 h-4" />
                  </label>
                </div>

                {/* User Info */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                  {form.firstName} {form.lastName}
                </h2>
                <p className="text-sm text-gray-500 mb-1">{form.email}</p>
                
                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full text-blue-700 font-medium text-sm mt-3">
                  <GraduationCap className="w-4 h-4" />
                  <span>Instructor</span>
                </div>

                {/* Stats */}
                <div className="w-full mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Domain
                    </span>
                    <span className="font-medium text-gray-900">{form.domain || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Experience
                    </span>
                    <span className="font-medium text-gray-900">
                      {experienceLevels.find(l => l.value === form.experienceLvl)?.label.split(' ')[0] || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </span>
                    <span className="font-medium text-gray-900">{form.phoneNumber || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50/50">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                      activeTab === 'profile'
                        ? 'text-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Profile Information</span>
                    </div>
                    {activeTab === 'profile' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                      activeTab === 'security'
                        ? 'text-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Security</span>
                    </div>
                    {activeTab === 'security' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                {activeTab === 'profile' ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="firstName"
                              value={form.firstName}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                              required
                              placeholder="John"
                            />
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="lastName"
                              value={form.lastName}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                              required
                              placeholder="Doe"
                            />
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Contact Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed transition-all outline-none"
                              disabled
                            />
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={form.phoneNumber}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                              placeholder="+1 (555) 123-4567"
                            />
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Professional Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Domain */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Domain of Expertise
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="domain"
                              value={form.domain}
                              onChange={handleChange}
                              onFocus={() => setShowDomainSuggestions(true)}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                              placeholder="e.g., Web Development"
                            />
                            <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                          
                          {/* Domain Suggestions Dropdown */}
                          {showDomainSuggestions && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              <div className="p-2">
                                <p className="text-xs text-gray-500 px-2 py-1 mb-1">Suggested domains:</p>
                                {domainSuggestions
                                  .filter(d => d.toLowerCase().includes(form.domain.toLowerCase()))
                                  .map((domain, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleDomainSelect(domain)}
                                      className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg text-sm transition-colors"
                                    >
                                      {domain}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Experience Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Experience Level
                          </label>
                          <div className="relative">
                            <select
                              name="experienceLvl"
                              value={form.experienceLvl}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                              required
                            >
                              <option value="">Select your experience level</option>
                              {experienceLevels.map(lvl => (
                                <option key={lvl.value} value={lvl.value}>
                                  {lvl.label}
                                </option>
                              ))}
                            </select>
                            <Award className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          {form.experienceLvl && (
                            <p className="mt-1 text-xs text-gray-500">
                              {experienceLevels.find(l => l.value === form.experienceLvl)?.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Change Password
                      </h3>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Leave the password field blank if you don't want to change it.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="Enter new password"
                          />
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Use a strong password with at least 8 characters
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Your profile helps students learn more about you and your expertise. Make sure to keep it up to date!
              </p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Upload a professional profile picture to build trust</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Keep your contact information current</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Clearly define your domain expertise to attract the right students</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default InstructorProfile; 