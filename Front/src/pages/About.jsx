import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Award, BookOpen, Users, Target, Heart, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  const stats = [
    { icon: Users, label: "Active Students", value: "50,000+" },
    { icon: BookOpen, label: "Courses Available", value: "500+" },
    { icon: Award, label: "Expert Instructors", value: "100+" },
    { icon: Target, label: "Success Rate", value: "95%" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Student-Centered",
      description: "We put our students first, ensuring every course is designed with their success in mind."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously update our curriculum to reflect the latest industry trends and technologies."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in course quality and instructor expertise."
    },
    {
      icon: Users,
      title: "Community",
      description: "We foster a supportive learning community where students and instructors collaborate."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg",
      description: "10+ years in EdTech"
    },
    {
      name: "Michael Chen",
      role: "Head of Curriculum",
      image: "/placeholder.svg",
      description: "Former Google Engineer"
    },
    {
      name: "Emily Rodriguez",
      role: "Director of Student Success",
      image: "/placeholder.svg",
      description: "Education Psychology PhD"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20 px-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About LearnHub</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Empowering learners worldwide to achieve their goals through high-quality, 
            accessible online education.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            At LearnHub, we believe that quality education should be accessible to everyone, 
            everywhere. Our mission is to democratize learning by connecting passionate instructors 
            with eager students, creating a global community of lifelong learners.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We're committed to providing cutting-edge courses taught by industry experts, 
            helping our students gain the skills they need to thrive in today's rapidly 
            evolving world.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-purple-100">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <Badge className="mx-auto">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Our Story</h2>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              LearnHub was founded in 2020 with a simple yet powerful vision: to make 
              high-quality education accessible to anyone with an internet connection. 
              What started as a small platform with just 10 courses has grown into a 
              thriving learning ecosystem with hundreds of courses and thousands of 
              satisfied students.
            </p>
            <p>
              Our founders, experienced educators and technologists, recognized that 
              traditional education models weren't keeping pace with the rapid changes 
              in the job market. They set out to create a platform that could bridge 
              this gap, connecting industry experts with eager learners worldwide.
            </p>
            <p>
              Today, LearnHub serves students in over 150 countries, offering courses 
              in technology, business, design, and more. We're proud of how far we've 
              come, but we're even more excited about where we're going. Join us on 
              this journey of lifelong learning!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Learning Community</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start your learning journey today and become part of a global community of learners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/courses" 
              className="inline-block bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold transition-colors"
            >
              Browse Courses
            </a>
            <a 
              href="/signup" 
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-md font-semibold transition-colors"
            >
              Sign Up Free
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
