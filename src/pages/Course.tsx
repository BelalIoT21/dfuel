
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { courseDatabaseService } from '@/services/database/courseService';
import { ChevronLeft } from 'lucide-react';
import CourseSlideViewer from '@/components/courses/CourseSlideViewer';
import { Slide } from '@/components/admin/courses/CourseSlideEditor';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        if (id) {
          const courseData = await courseDatabaseService.getCourseById(id);
          setCourse(courseData);
          
          // Parse slides from content
          if (courseData.content) {
            try {
              const parsedSlides = JSON.parse(courseData.content);
              if (Array.isArray(parsedSlides)) {
                setSlides(parsedSlides);
              } else {
                // If content exists but isn't valid JSON, create a text slide with it
                setSlides([
                  { id: '1', type: 'heading', content: courseData.title, headingLevel: 1 },
                  { id: '2', type: 'text', content: courseData.content }
                ]);
              }
            } catch (e) {
              // If content exists but isn't valid JSON, create a text slide with it
              setSlides([
                { id: '1', type: 'heading', content: courseData.title, headingLevel: 1 },
                { id: '2', type: 'text', content: courseData.content }
              ]);
            }
          } else {
            setSlides([
              { id: '1', type: 'heading', content: courseData.title, headingLevel: 1 },
              { id: '2', type: 'text', content: 'This course has no content yet.' }
            ]);
          }
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Course not found.'}</p>
          <Button asChild variant="outline">
            <Link to="/home">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/home">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {course.imageUrl && (
            <div className="w-full h-48 bg-gray-200 overflow-hidden">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                  {course.category}
                </span>
                <span className="inline-block ml-2 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                  {course.difficulty}
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.description}</p>

            <div className="border-t border-gray-100 pt-6">
              {slides.length > 0 ? (
                <CourseSlideViewer slides={slides} />
              ) : (
                <div className="prose max-w-none">
                  <p>{course.content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
