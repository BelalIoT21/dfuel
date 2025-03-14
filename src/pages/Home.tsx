
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-600 mt-1">Select a machine to get started</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/profile'}>
              Profile
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <Link to={`/machine/${machine.id}`} key={machine.id}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg card-hover">
                <CardHeader>
                  <CardTitle>{machine.name}</CardTitle>
                  <CardDescription>{machine.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex gap-2">
                        {machine.courseCompleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Course Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Course Pending
                          </span>
                        )}
                        {machine.quizPassed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Quiz Passed
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
