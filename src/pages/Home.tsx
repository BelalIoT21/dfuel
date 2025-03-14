
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMachineDashboard } from '../hooks/home/useMachineDashboard';

// Import components
import PageHeader from '../components/home/PageHeader';
import SafetyAlert from '../components/home/SafetyAlert';
import MachineGrid from '../components/home/MachineGrid';
import LoadingIndicator from '../components/home/LoadingIndicator';

const Home = () => {
  const navigate = useNavigate();
  const { 
    user, 
    machineData, 
    loading, 
    safetyCabinetCompleted, 
    safetyCourseCompleted,
    allSafetyRequirementsMet 
  } = useMachineDashboard();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader />
        
        <SafetyAlert 
          safetyCabinetCompleted={safetyCabinetCompleted}
          safetyCourseCompleted={safetyCourseCompleted}
          allSafetyRequirementsMet={allSafetyRequirementsMet}
        />

        {loading ? (
          <LoadingIndicator />
        ) : (
          <MachineGrid 
            machines={machineData} 
            userCertifications={user.certifications}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
