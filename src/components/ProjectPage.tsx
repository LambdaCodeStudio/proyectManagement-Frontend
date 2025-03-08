import React, { useState } from 'react';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';
import { ProjectDetail } from './ProjectDetail';

// Component views
type View = 'list' | 'detail' | 'create' | 'edit';

export const ProjectsPage: React.FC = () => {
  // State to control which view is shown
  const [currentView, setCurrentView] = useState<View>('list');
  // State to keep track of selected project ID
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Function to handle selecting a project to view details
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('detail');
  };
  
  // Function to handle creating a new project
  const handleCreateProject = () => {
    setSelectedProjectId(null); // Clear any selected project
    setCurrentView('create'); // Switch to create view
  };
  
  // Function to handle editing a project
  const handleEditProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('edit');
  };
  
  // Function to handle going back to project list
  const handleBack = () => {
    setCurrentView('list');
  };
  
  // Function to handle after successful save
  const handleSave = () => {
    setCurrentView('list');
  };
  
  // Additional navigation functions for the project detail view
  const handleNavigateToClient = (clientId: string) => {
    // Navigate to client detail (implementation depends on your app structure)
    console.log(`Navigating to client: ${clientId}`);
    // Example: window.location.href = `/clients/${clientId}`;
  };
  
  const handleNavigateToCreateInvoice = (projectId: string) => {
    // Navigate to invoice creation page
    console.log(`Creating invoice for project: ${projectId}`);
    // Example: window.location.href = `/invoices/create?projectId=${projectId}`;
  };
  
  const handleNavigateToCreatePayment = (projectId: string) => {
    // Navigate to payment creation page
    console.log(`Creating payment for project: ${projectId}`);
    // Example: window.location.href = `/payments/create?projectId=${projectId}`;
  };
  
  // Render different views based on current state
  return (
    <div className="container mx-auto px-4 py-6">
      {currentView === 'list' && (
        <ProjectList 
          onSelectProject={handleSelectProject} 
          onCreateProject={handleCreateProject} 
        />
      )}
      
      {currentView === 'detail' && selectedProjectId && (
        <ProjectDetail 
          projectId={selectedProjectId}
          onBack={handleBack}
          onNavigateToEdit={handleEditProject}
          onNavigateToClient={handleNavigateToClient}
          onNavigateToCreateInvoice={handleNavigateToCreateInvoice}
          onNavigateToCreatePayment={handleNavigateToCreatePayment}
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <ProjectForm 
          projectId={currentView === 'edit' ? selectedProjectId || undefined : undefined}
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
};